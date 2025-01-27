from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import docker
from typing import List, Dict, Optional, Any
from pydantic import BaseModel
import psutil
import datetime

app = FastAPI(title="Dockeranium API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Docker client
docker_client = docker.from_env()

def debug_print(message):
    # Print to stdout which shows in docker logs
    print(message, flush=True)

# Models
class PortMapping(BaseModel):
    HostIp: str
    HostPort: str

class NetworkConfig(BaseModel):
    Subnet: Optional[str] = None
    Gateway: Optional[str] = None
    IPRange: Optional[str] = None

class ContainerState(BaseModel):
    Running: bool
    Status: str

class ContainerPort(BaseModel):
    containerId: str
    containerName: str
    networkId: str
    networkName: str
    ports: Dict[str, Optional[List[PortMapping]]]

# Additional Models
class ContainerStats(BaseModel):
    cpu_percentage: float
    memory_usage: int
    memory_limit: int
    memory_percentage: float
    network_rx: int
    network_tx: int
    block_read: int
    block_write: int

class SystemStats(BaseModel):
    cpu_usage: float
    memory_total: int
    memory_used: int
    memory_free: int
    disk_total: int
    disk_used: int
    disk_free: int

# Routes
@app.get("/api/networks")
async def list_networks():
    try:
        networks = docker_client.networks.list()
        return [{
            'id': network.id,
            'name': network.name,
            'driver': network.attrs['Driver'],
            'scope': network.attrs['Scope'],
            'ipam': network.attrs['IPAM']['Config'] if 'IPAM' in network.attrs else None,
            'internal': network.attrs.get('Internal', False),
            'containers': len(network.attrs.get('Containers', {})),
            'inUse': len(network.attrs.get('Containers', {})) > 0
        } for network in networks]
    except Exception as e:
        debug_print(f"Error in list_networks: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/networks/{network_id}")
async def get_network(network_id: str):
    try:
        network = docker_client.networks.get(network_id)
        network_info = network.attrs
        containers = network_info.get('Containers', {})
        
        attachable_containers = []
        for container_id, container_data in containers.items():
            try:
                container = docker_client.containers.get(container_id)
                container_info = container.attrs
                
                ports = container_info['NetworkSettings']['Ports']
                ipv4_address = container_data.get('IPv4Address', '').split('/')[0]
                ipv6_address = container_data.get('IPv6Address', '').split('/')[0]
                
                attachable_containers.append({
                    'id': container.id,
                    'name': container.name.lstrip('/'),
                    'ipv4Address': ipv4_address,
                    'ipv6Address': ipv6_address,
                    'macAddress': container_data.get('MacAddress', ''),
                    'ports': ports,
                    'state': {
                        'Running': container.status == 'running',
                        'Status': container.status
                    }
                })
            except Exception as e:
                debug_print(f"Error processing container {container_id}: {str(e)}")
                continue
        
        return {
            'id': network.id,
            'name': network.name,
            'driver': network_info['Driver'],
            'scope': network_info['Scope'],
            'created': network_info['Created'],
            'ipam': network_info['IPAM']['Config'] if 'IPAM' in network_info else [],
            'internal': network_info.get('Internal', False),
            'attachableContainers': attachable_containers,
            'options': network_info.get('Options', {}),
            'labels': network_info.get('Labels', {}),
            'enableIPv6': network_info.get('EnableIPv6', False)
        }
    except docker.errors.NotFound:
        raise HTTPException(status_code=404, detail="Network not found")
    except Exception as e:
        debug_print(f"Error in get_network: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/networks/{network_id}/disconnected")
async def get_disconnected_containers(network_id: str):
    try:
        network = docker_client.networks.get(network_id)
        network_info = network.attrs
        
        debug_print(f"Network info for {network_id}: {network_info}")
        
        previously_connected = set()
        if 'Containers' in network_info:
            previously_connected = set(network_info.get('Containers', {}).keys())
            debug_print(f"Previously connected containers: {previously_connected}")
        
        containers = docker_client.containers.list(all=True)
        
        disconnected = []
        for container in containers:
            container_networks = container.attrs['NetworkSettings']['Networks']
            debug_print(f"Container {container.name} networks: {container_networks.keys()}")
            
            if (container.id in previously_connected and 
                network.name not in container_networks):
                disconnected.append({
                    'id': container.id,
                    'name': container.name.lstrip('/'),
                    'state': {
                        'Running': container.status == 'running',
                        'Status': container.status
                    }
                })
        
        debug_print(f"Disconnected containers: {disconnected}")
        return disconnected
        
    except docker.errors.NotFound:
        raise HTTPException(status_code=404, detail="Network not found")
    except Exception as e:
        debug_print(f"Error in get_disconnected_containers: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/ports")
async def list_ports():
    try:
        containers = docker_client.containers.list()
        
        ports_data = []
        for container in containers:
            container_info = container.attrs
            
            networks = container_info.get('NetworkSettings', {}).get('Networks', {})
            for network_name, network_info in networks.items():
                network_id = network_info.get('NetworkID', '')
                
                ports = container_info.get('NetworkSettings', {}).get('Ports', {})
                
                if ports:
                    ports_data.append({
                        'containerId': container.id,
                        'containerName': container.name.lstrip('/'),
                        'networkId': network_id,
                        'networkName': network_name,
                        'ports': ports
                    })
        
        debug_print(f"Ports data: {ports_data}")
        return ports_data
    except Exception as e:
        debug_print(f"Error in list_ports: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Container Routes
@app.get("/api/containers")
async def list_containers():
    try:
        containers = docker_client.containers.list(all=True)
        return [{
            'id': container.id,
            'name': container.name.lstrip('/'),
            'image': container.image.tags[0] if container.image.tags else container.image.id,
            'status': container.status,
            'state': container.attrs.get('State', {}),
            'created': container.attrs.get('Created', ''),
            'ports': container.attrs.get('NetworkSettings', {}).get('Ports', {}),
            'networks': list(container.attrs.get('NetworkSettings', {}).get('Networks', {}).keys())
        } for container in containers]
    except Exception as e:
        debug_print(f"Error in list_containers: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/containers/running")
async def list_running_containers():
    try:
        containers = docker_client.containers.list(filters={"status": "running"})
        return [{
            'id': container.id,
            'name': container.name.lstrip('/'),
            'image': container.image.tags[0] if container.image.tags else container.image.id,
            'status': container.status,
            'state': container.attrs.get('State', {}),
            'created': container.attrs.get('Created', ''),
            'ports': container.attrs.get('NetworkSettings', {}).get('Ports', {}),
            'networks': list(container.attrs.get('NetworkSettings', {}).get('Networks', {}).keys())
        } for container in containers]
    except Exception as e:
        debug_print(f"Error in list_running_containers: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/containers/{container_id}")
async def get_container(container_id: str):
    try:
        debug_print(f"Attempting to get container with ID: {container_id}")
        
        # List all containers to check if the ID exists
        all_containers = docker_client.containers.list(all=True)
        container_ids = [c.id for c in all_containers]
        debug_print(f"Available container IDs: {container_ids}")
        
        # Try to get the container
        container = docker_client.containers.get(container_id)
        debug_print(f"Found container: {container.name}")
        
        network_settings = container.attrs.get('NetworkSettings', {})
        debug_print(f"Network settings: {network_settings.keys()}")
        
        response_data = {
            'id': container.id,
            'name': container.name.lstrip('/'),
            'image': container.image.tags[0] if container.image.tags else container.image.id,
            'status': container.status,
            'state': container.attrs.get('State', {}),
            'created': container.attrs.get('Created', ''),
            'ports': network_settings.get('Ports', {}),
            'networks': network_settings.get('Networks', {}),
            'mounts': container.attrs.get('Mounts', []),
            'config': container.attrs.get('Config', {})
        }
        debug_print(f"Returning container data: {response_data}")
        return response_data
        
    except docker.errors.NotFound:
        debug_print(f"Container not found: {container_id}")
        raise HTTPException(
            status_code=404,
            detail=f"Container not found: {container_id}. Available containers: {[c.id[:12] + '...' for c in docker_client.containers.list(all=True)]}"
        )
    except Exception as e:
        debug_print(f"Error in get_container: {str(e)}")
        debug_print(f"Error type: {type(e)}")
        debug_print(f"Error args: {e.args}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/containers/{container_id}/logs")
async def get_container_logs(container_id: str):
    try:
        debug_print(f"Attempting to get logs for container with ID: {container_id}")
        container = docker_client.containers.get(container_id)
        
        # Get logs with timestamps
        logs = container.logs(timestamps=True, tail=1000).decode('utf-8')
        
        # Split logs into lines and parse timestamps
        log_lines = []
        for line in logs.splitlines():
            # Docker logs format: timestamp message
            # Split only on first space to preserve spaces in message
            parts = line.split(' ', 1)
            if len(parts) == 2:
                timestamp, message = parts
                log_lines.append({
                    'timestamp': timestamp,
                    'message': message
                })
            else:
                log_lines.append({
                    'timestamp': None,
                    'message': line
                })
        
        return {
            'container_id': container.id,
            'container_name': container.name,
            'logs': log_lines
        }
        
    except docker.errors.NotFound:
        debug_print(f"Container not found: {container_id}")
        raise HTTPException(
            status_code=404,
            detail=f"Container not found: {container_id}"
        )
    except Exception as e:
        debug_print(f"Error getting logs for container {container_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/containers/{container_id}/stop")
async def stop_container(container_id: str):
    try:
        debug_print(f"Attempting to stop container with ID: {container_id}")
        container = docker_client.containers.get(container_id)
        
        if not container.attrs['State']['Running']:
            raise HTTPException(
                status_code=400,
                detail="Container is not running"
            )
            
        container.stop()
        return {"message": f"Container {container.name} stopped successfully"}
        
    except docker.errors.NotFound:
        debug_print(f"Container not found: {container_id}")
        raise HTTPException(
            status_code=404,
            detail=f"Container not found: {container_id}"
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        debug_print(f"Error stopping container {container_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/containers/{container_id}/start")
async def start_container(container_id: str):
    try:
        debug_print(f"Attempting to start container with ID: {container_id}")
        container = docker_client.containers.get(container_id)
        
        if container.attrs['State']['Running']:
            raise HTTPException(
                status_code=400,
                detail="Container is already running"
            )
            
        container.start()
        return {"message": f"Container {container.name} started successfully"}
        
    except docker.errors.NotFound:
        debug_print(f"Container not found: {container_id}")
        raise HTTPException(
            status_code=404,
            detail=f"Container not found: {container_id}"
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        debug_print(f"Error starting container {container_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Image Routes
@app.get("/api/images")
async def list_images():
    try:
        images = docker_client.images.list()
        return [{
            'id': image.id,
            'tags': image.tags,
            'created': image.attrs['Created'] if isinstance(image.attrs['Created'], str) else datetime.datetime.fromtimestamp(image.attrs['Created']).isoformat(),
            'size': image.attrs['Size'],
            'containers': len(docker_client.containers.list(all=True, filters={'ancestor': image.id}))
        } for image in images]
    except Exception as e:
        debug_print(f"Error in list_images: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/images/{image_id}")
async def get_image(image_id: str):
    try:
        image = docker_client.images.get(image_id)
        containers = docker_client.containers.list(all=True, filters={'ancestor': image.id})
        
        return {
            'id': image.id,
            'tags': image.tags,
            'created': image.attrs['Created'] if isinstance(image.attrs['Created'], str) else datetime.datetime.fromtimestamp(image.attrs['Created']).isoformat(),
            'size': image.attrs['Size'],
            'architecture': image.attrs.get('Architecture', ''),
            'os': image.attrs.get('Os', ''),
            'author': image.attrs.get('Author', ''),
            'containers': [
                {
                    'id': container.id,
                    'name': container.name.lstrip('/'),
                    'status': container.status,
                    'state': container.attrs['State'],
                    'created': container.attrs['Created']
                }
                for container in containers
            ],
            'config': image.attrs.get('Config', {}),
            'history': image.history()
        }
    except docker.errors.ImageNotFound:
        raise HTTPException(status_code=404, detail="Image not found")
    except Exception as e:
        debug_print(f"Error in get_image: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Volume Routes
@app.get("/api/volumes")
async def list_volumes():
    try:
        volumes = docker_client.volumes.list()
        return [{
            'id': volume.id,
            'name': volume.name,
            'driver': volume.attrs['Driver'],
            'mountpoint': volume.attrs['Mountpoint'],
            'created': volume.attrs['CreatedAt'],
            'status': volume.attrs.get('Status', {}),
            'labels': volume.attrs.get('Labels', {})
        } for volume in volumes]
    except Exception as e:
        debug_print(f"Error in list_volumes: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Stats Routes
@app.get("/api/stats")
async def get_stats():
    try:
        # Get container stats
        all_containers = docker_client.containers.list(all=True)
        running_containers = docker_client.containers.list(filters={"status": "running"})
        
        # Get other resource counts
        images = docker_client.images.list()
        networks = docker_client.networks.list()
        volumes = docker_client.volumes.list()
        
        return {
            'containers': {
                'total': len(all_containers),
                'running': len(running_containers),
                'stopped': len(all_containers) - len(running_containers)
            },
            'images': len(images),
            'networks': len(networks),
            'volumes': len(volumes)
        }
    except Exception as e:
        debug_print(f"Error in get_stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/containers/stats")
async def get_container_stats():
    try:
        containers = docker_client.containers.list()
        stats = []
        
        for container in containers:
            try:
                stats_dict = container.stats(stream=False)
                
                # CPU stats with safety checks
                cpu_stats = stats_dict.get('cpu_stats', {})
                precpu_stats = stats_dict.get('precpu_stats', {})
                
                cpu_usage = cpu_stats.get('cpu_usage', {})
                precpu_usage = precpu_stats.get('cpu_usage', {})
                
                cpu_delta = cpu_usage.get('total_usage', 0) - precpu_usage.get('total_usage', 0)
                system_delta = cpu_stats.get('system_cpu_usage', 0) - precpu_stats.get('system_cpu_usage', 0)
                
                # Get number of CPUs
                online_cpus = cpu_stats.get('online_cpus', 1)
                if online_cpus == 0:
                    online_cpus = 1
                
                # Calculate CPU percentage
                cpu_percentage = 0.0
                if system_delta > 0:
                    cpu_percentage = (cpu_delta / system_delta) * 100.0 * online_cpus
                
                # Memory stats with safety checks
                memory_stats = stats_dict.get('memory_stats', {})
                memory_usage = memory_stats.get('usage', 0)
                if memory_usage is None:
                    memory_usage = 0
                    
                memory_limit = memory_stats.get('limit', 0)
                if memory_limit is None or memory_limit == 0:
                    memory_limit = psutil.virtual_memory().total  # Fallback to system total memory
                
                memory_percentage = 0.0
                if memory_limit > 0:
                    memory_percentage = (memory_usage / memory_limit) * 100.0
                
                # Network stats with safety checks
                network_stats = stats_dict.get('networks', {})
                if network_stats is None:
                    network_stats = {}
                    
                rx_bytes = sum(interface.get('rx_bytes', 0) or 0 for interface in network_stats.values())
                tx_bytes = sum(interface.get('tx_bytes', 0) or 0 for interface in network_stats.values())
                
                # Block IO stats with safety checks
                blkio_stats = stats_dict.get('blkio_stats', {})
                if blkio_stats is None:
                    blkio_stats = {}
                    
                io_service_bytes = blkio_stats.get('io_service_bytes_recursive', [])
                if io_service_bytes is None:
                    io_service_bytes = []
                    
                read_bytes = sum(stat.get('value', 0) for stat in io_service_bytes if stat.get('op') == 'read')
                write_bytes = sum(stat.get('value', 0) for stat in io_service_bytes if stat.get('op') == 'write')
                
                stats.append({
                    'id': container.id,
                    'name': container.name.lstrip('/'),
                    'cpu_percentage': round(cpu_percentage, 2),
                    'memory_usage': int(memory_usage),  # Ensure integer
                    'memory_limit': int(memory_limit),  # Ensure integer
                    'memory_percentage': round(memory_percentage, 2),
                    'network_rx': int(rx_bytes),  # Ensure integer
                    'network_tx': int(tx_bytes),  # Ensure integer
                    'block_read': int(read_bytes),  # Ensure integer
                    'block_write': int(write_bytes)  # Ensure integer
                })
            except Exception as e:
                debug_print(f"Error getting stats for container {container.name}: {str(e)}")
                # Add default stats for containers with errors
                stats.append({
                    'id': container.id,
                    'name': container.name.lstrip('/'),
                    'cpu_percentage': 0.0,
                    'memory_usage': 0,
                    'memory_limit': psutil.virtual_memory().total,
                    'memory_percentage': 0.0,
                    'network_rx': 0,
                    'network_tx': 0,
                    'block_read': 0,
                    'block_write': 0
                })
                continue
                
        return stats
    except Exception as e:
        debug_print(f"Error in get_container_stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/system/stats")
async def get_system_stats():
    try:
        # Get CPU info
        cpu_percent_per_core = psutil.cpu_percent(interval=1, percpu=True)
        cpu_freq = psutil.cpu_freq()
        cpu_info = {
            'cores': psutil.cpu_count(),
            'usage_per_core': cpu_percent_per_core,
            'average_usage': sum(cpu_percent_per_core) / len(cpu_percent_per_core),
            'frequency': {
                'current': cpu_freq.current if cpu_freq else None,
                'min': cpu_freq.min if cpu_freq else None,
                'max': cpu_freq.max if cpu_freq else None
            } if cpu_freq else None
        }

        # Get memory info
        memory = psutil.virtual_memory()
        memory_info = {
            'total': memory.total,
            'available': memory.available,
            'used': memory.used,
            'percent': memory.percent
        }

        # Get disk info
        disk = psutil.disk_usage('/')
        disk_info = {
            'total': disk.total,
            'used': disk.used,
            'free': disk.free,
            'percent': disk.percent
        }

        # Get network info
        net_if_addrs = psutil.net_if_addrs()
        net_io = psutil.net_io_counters()
        
        network_info = {
            'interfaces': {
                interface: {
                    'addresses': [
                        {
                            'address': addr.address,
                            'family': str(addr.family),
                            'netmask': addr.netmask if hasattr(addr, 'netmask') else None
                        }
                        for addr in addrs
                    ]
                }
                for interface, addrs in net_if_addrs.items()
            },
            'io': {
                'bytes_sent': net_io.bytes_sent,
                'bytes_recv': net_io.bytes_recv,
                'packets_sent': net_io.packets_sent,
                'packets_recv': net_io.packets_recv
            }
        }

        return {
            'cpu': cpu_info,
            'memory': memory_info,
            'disk': disk_info,
            'network': network_info
        }
    except Exception as e:
        debug_print(f"Error in get_system_stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) 