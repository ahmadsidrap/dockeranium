from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.views import APIView
import docker
import psutil
import os

def debug_print(message):
    # Print to stdout which shows in docker logs
    print(message, flush=True)

class ContainerViewSet(ViewSet):
    def list(self, request):
        try:
            client = docker.from_env()
            containers = client.containers.list(all=True)
            
            container_list = []
            for container in containers:
                container_list.append({
                    'id': container.short_id,
                    'name': container.name,
                    'image': container.image.tags[0] if container.image.tags else container.image.short_id,
                    'status': container.status,
                    'state': container.attrs['State'],
                    'created': container.attrs['Created'],
                    'ports': container.ports,
                })
            
            return Response(container_list)
        except docker.errors.DockerException as e:
            return Response(
                {'error': f'Docker error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        try:
            client = docker.from_env()
            container = client.containers.get(pk)
            container.start()
            return Response({'status': 'Container started successfully'})
        except docker.errors.DockerException as e:
            return Response(
                {'error': f'Docker error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def stop(self, request, pk=None):
        try:
            client = docker.from_env()
            container = client.containers.get(pk)
            container.stop()
            return Response({'status': 'Container stopped successfully'})
        except docker.errors.DockerException as e:
            return Response(
                {'error': f'Docker error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def retrieve(self, request, pk=None):
        try:
            client = docker.from_env()
            container = client.containers.get(pk)
            
            container_detail = {
                'id': container.short_id,
                'name': container.name,
                'image': container.image.tags[0] if container.image.tags else container.image.short_id,
                'status': container.status,
                'state': container.attrs['State'],
                'created': container.attrs['Created'],
                'config': container.attrs['Config'],
                'networkSettings': container.attrs['NetworkSettings'],
                'mounts': container.attrs['Mounts']
            }
            
            return Response(container_detail)
        except docker.errors.DockerException as e:
            return Response(
                {'error': f'Docker error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def running(self, request):
        try:
            client = docker.from_env()
            containers = client.containers.list(filters={'status': 'running'})
            
            container_list = []
            for container in containers:
                # Get network information
                networks = []
                for network_name, network_config in container.attrs['NetworkSettings']['Networks'].items():
                    networks.append({
                        'name': network_name,
                        'ipAddress': network_config.get('IPAddress', '')
                    })

                container_list.append({
                    'id': container.short_id,
                    'name': container.name,
                    'image': container.image.tags[0] if container.image.tags else container.image.short_id,
                    'ports': container.attrs['NetworkSettings']['Ports'],
                    'networks': networks
                })
            
            return Response(container_list)
        except docker.errors.DockerException as e:
            return Response(
                {'error': f'Docker error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def destroy(self, request, pk=None):
        try:
            client = docker.from_env()
            container = client.containers.get(pk)
            
            # Check if container is running
            if container.status == 'running':
                return Response(
                    {'error': 'Cannot delete a running container'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            container.remove()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except docker.errors.NotFound:
            return Response(
                {'error': 'Container not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except docker.errors.APIError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['get'], url_path='logs')
    def logs(self, request, pk=None):
        try:
            client = docker.from_env()
            container = client.containers.get(pk)
            
            # Get logs with timestamps
            logs = container.logs(
                timestamps=True,
                tail=100,  # Last 100 lines
                stream=False
            ).decode('utf-8')
            
            return Response({
                'logs': logs,
                'container': {
                    'id': container.id,
                    'name': container.name,
                    'status': container.status
                }
            })
            
        except docker.errors.NotFound:
            return Response(
                {'error': 'Container not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except docker.errors.APIError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ImageListView(APIView):
    def get(self, request, image_id=None):
        try:
            client = docker.from_env()
            
            if image_id:
                # Get specific image detail
                image = client.images.get(f'sha256:{image_id}')
                image_detail = {
                    'id': image.short_id,
                    'tags': image.tags,
                    'size': image.attrs['Size'],
                    'created': image.attrs['Created'],
                    'architecture': image.attrs['Architecture'],
                    'os': image.attrs['Os'],
                    'author': image.attrs.get('Author', ''),
                    'config': {
                        'Env': image.attrs['Config'].get('Env', []),
                        'Cmd': image.attrs['Config'].get('Cmd', []),
                        'WorkingDir': image.attrs['Config'].get('WorkingDir', ''),
                        'ExposedPorts': image.attrs['Config'].get('ExposedPorts', {}),
                        'Labels': image.attrs['Config'].get('Labels', {}),
                        'User': image.attrs['Config'].get('User', '')
                    },
                    'history': image.history()
                }
                return Response(image_detail)
            
            # List all images
            images = client.images.list()
            image_list = []
            for image in images:
                image_list.append({
                    'id': image.short_id,
                    'tags': image.tags,
                    'size': image.attrs['Size'],
                    'created': image.attrs['Created'],
                    'architecture': image.attrs['Architecture'],
                    'os': image.attrs['Os'],
                })
            
            return Response(image_list)
        except docker.errors.ImageNotFound:
            return Response(
                {'error': 'Image not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except docker.errors.DockerException as e:
            return Response(
                {'error': f'Docker error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def delete(self, request, image_id):
        try:
            client = docker.from_env()
            image = client.images.get(f'sha256:{image_id}')
            
            # Check if image is used by any containers
            containers = client.containers.list(all=True)
            for container in containers:
                if container.image.id == image.id:
                    return Response(
                        {'error': 'Cannot delete image that is used by containers'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            client.images.remove(image.id)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except docker.errors.ImageNotFound:
            return Response(
                {'error': 'Image not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except docker.errors.APIError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class NetworkViewSet(ViewSet):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.client = docker.from_env()

    def list(self, request):
        try:
            networks = self.client.networks.list()
            network_list = []
            for network in networks:
                # Get connected containers with their details
                attached_containers = []
                network_client = self.client.networks.get(network.id)
                for container_id, container_config in network_client.attrs['Containers'].items():
                    try:
                        container = self.client.containers.get(container_id)
                        attached_containers.append({
                            'id': container.short_id,
                            'name': container.name,
                            'ipv4Address': container_config.get('IPv4Address', ''),
                            'ipv6Address': container_config.get('IPv6Address', '')
                        })
                    except docker.errors.NotFound:
                        # Skip if container no longer exists
                        continue

                network_list.append({
                    'id': network.short_id,
                    'name': network.name,
                    'driver': network.attrs['Driver'],
                    'scope': network.attrs['Scope'],
                    'ipam': network.attrs['IPAM']['Config'],
                    'internal': network.attrs['Internal'],
                    'inUse': bool(attached_containers),
                    'containers': len(attached_containers)
                })
            return Response(network_list)
        except docker.errors.DockerException as e:
            return Response({'error': str(e)}, status=500)

    def retrieve(self, request, pk=None):
        try:
            network = self.client.networks.get(pk)
            # Process connected containers
            attached_containers = []
            for container_id, container_config in network.attrs['Containers'].items():
                container = self.client.containers.get(container_id)
                attached_containers.append({
                    'id': container.short_id,
                    'name': container.name,
                    'ipv4Address': container_config.get('IPv4Address', ''),
                    'ipv6Address': container_config.get('IPv6Address', ''),
                    'macAddress': container_config.get('MacAddress', ''),
                    'state': container.attrs['State'],
                    'ports': container.attrs['NetworkSettings']['Ports']
                })
            
            network_detail = {
                'id': network.short_id,
                'name': network.name,
                'driver': network.attrs['Driver'],
                'scope': network.attrs['Scope'],
                'created': network.attrs['Created'],
                'ipam': network.attrs['IPAM']['Config'],
                'internal': network.attrs['Internal'],
                'attachableContainers': attached_containers,
                'options': network.attrs.get('Options', {}),
                'labels': network.attrs.get('Labels', {}),
                'enableIPv6': network.attrs.get('EnableIPv6', False)
            }
            return Response(network_detail)
        except docker.errors.DockerException as e:
            return Response({'error': str(e)}, status=500)

    def destroy(self, request, pk=None):
        try:
            network = self.client.networks.get(pk)
            # Check if network is in use
            if len(network.attrs['Containers']) > 0:
                return Response(
                    {'error': 'Cannot delete network that is in use'},
                    status=400
                )
            network.remove()
            return Response(status=204)
        except docker.errors.DockerException as e:
            return Response({'error': str(e)}, status=500)

    @action(detail=True, methods=['get'], url_path='disconnected')
    def disconnected(self, request, pk=None):
        try:
            # Get the network
            network = self.client.networks.get(pk)
            network_info = network.attrs
            
            # Get all containers
            containers = self.client.containers.list(all=True)
            
            # Filter for disconnected containers
            disconnected = []
            for container in containers:
                container_networks = container.attrs['NetworkSettings']['Networks']
                network_name = list(container_networks.keys())[0] if container_networks else ''
                
                # Check if container was previously connected but is not currently connected
                if network_name in network.name and container.status == 'exited':
                    # Get the last known network settings for this container
                    network_settings = container.attrs['NetworkSettings']
                    last_network = network_settings['Networks'].get(network_name, {})
                    
                    disconnected.append({
                        'id': container.id,
                        'name': container.name.lstrip('/'),
                        'ipv4Address': last_network.get('IPAddress', '-'),
                        'ipv6Address': last_network.get('GlobalIPv6Address', '-'),
                        'macAddress': last_network.get('MacAddress', '-'),
                        'state': {
                            'Running': container.status == 'running',
                            'Status': container.status
                        }
                    })
            return Response(disconnected)
            
        except docker.errors.APIError as e:
            debug_print(f"API Error: {str(e)}")
            return Response({'error': str(e)}, status=400)
        except Exception as e:
            debug_print(f"Error in disconnected: {str(e)}")
            return Response({'error': str(e)}, status=500)

class VolumeListView(APIView):
    def get(self, request, volume_id=None):
        try:
            client = docker.from_env()
            
            if volume_id:
                # Get specific volume detail
                volume = client.volumes.get(volume_id)
                
                # Get mounted containers
                mounted_containers = []
                for container in client.containers.list(all=True):
                    for mount in container.attrs['Mounts']:
                        if mount['Type'] == 'volume' and mount['Name'] == volume.name:
                            mounted_containers.append({
                                'id': container.short_id,
                                'name': container.name,
                                'mountPath': mount['Destination'],
                                'mode': mount['Mode'],
                                'rw': mount['RW']
                            })
                
                volume_detail = {
                    'id': volume.id,
                    'name': volume.name,
                    'driver': volume.attrs['Driver'],
                    'mountpoint': volume.attrs['Mountpoint'],
                    'created': volume.attrs['CreatedAt'],
                    'scope': volume.attrs['Scope'],
                    'labels': volume.attrs['Labels'] or {},
                    'options': volume.attrs.get('Options', {}),
                    'size': volume.attrs.get('UsageData', {}).get('Size', 0) if volume.attrs.get('UsageData') else 0,
                    'status': {
                        'mounted': bool(mounted_containers),
                        'inUse': bool(mounted_containers)
                    },
                    'mountedContainers': mounted_containers
                }
                return Response(volume_detail)
            
            # List all volumes
            volumes = client.volumes.list()
            volume_list = []
            for volume in volumes:
                volume_list.append({
                    'id': volume.id,
                    'name': volume.name,
                    'driver': volume.attrs['Driver'],
                    'mountpoint': volume.attrs['Mountpoint'],
                    'created': volume.attrs['CreatedAt'],
                    'scope': volume.attrs['Scope'],
                    'labels': volume.attrs['Labels'] or {},
                    'size': volume.attrs.get('UsageData', {}).get('Size', 0) if volume.attrs.get('UsageData') else 0
                })
            
            return Response(volume_list)
        except docker.errors.NotFound:
            return Response(
                {'error': 'Volume not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except docker.errors.DockerException as e:
            return Response(
                {'error': f'Docker error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def delete(self, request, volume_id):
        try:
            client = docker.from_env()
            volume = client.volumes.get(volume_id)
            
            # Check if volume is in use
            mounted_containers = []
            for container in client.containers.list(all=True):
                for mount in container.attrs['Mounts']:
                    if mount['Type'] == 'volume' and mount['Name'] == volume.name:
                        mounted_containers.append(container.name)

            if mounted_containers:
                return Response(
                    {'error': f'Cannot delete volume that is used by containers: {", ".join(mounted_containers)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            volume.remove()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except docker.errors.NotFound:
            return Response(
                {'error': 'Volume not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except docker.errors.APIError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class StatsView(APIView):
    def get(self, request):
        try:
            client = docker.from_env()
            
            # Get containers stats
            containers = client.containers.list(all=True)
            running_containers = [c for c in containers if c.status == 'running']
            
            stats = {
                'containers': {
                    'total': len(containers),
                    'running': len(running_containers),
                    'stopped': len(containers) - len(running_containers)
                },
                'images': len(client.images.list()),
                'networks': len(client.networks.list()),
                'volumes': len(client.volumes.list())
            }
            
            return Response(stats)
        except docker.errors.DockerException as e:
            return Response(
                {'error': f'Docker error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class SystemStatsView(APIView):
    def get(self, request):
        try:
            # CPU stats
            cpu_count = psutil.cpu_count()
            cpu_percent = psutil.cpu_percent(interval=1, percpu=True)
            cpu_freq = psutil.cpu_freq()
            
            # Memory stats
            memory = psutil.virtual_memory()
            
            # Disk stats
            disk = psutil.disk_usage('/')
            
            # Network stats
            network_stats = {}
            net_io = psutil.net_io_counters()
            network_interfaces = psutil.net_if_addrs()
            
            for interface, addrs in network_interfaces.items():
                network_stats[interface] = {
                    'addresses': [
                        {
                            'address': addr.address,
                            'family': str(addr.family),
                            'netmask': addr.netmask
                        }
                        for addr in addrs
                        if addr.family.name in ('AF_INET', 'AF_INET6')  # Only IP addresses
                    ]
                }
            
            # Calculate total volume size
            total_volume_size = 0
            try:
                client = docker.from_env()
                volumes = client.volumes.list()
                for volume in volumes:
                    if volume.attrs.get('UsageData') and volume.attrs['UsageData'].get('Size'):
                        total_volume_size += volume.attrs['UsageData']['Size']
            except Exception:
                # If we can't get volume sizes, continue with 0
                pass

            stats = {
                'cpu': {
                    'cores': cpu_count,
                    'usage_per_core': cpu_percent,
                    'average_usage': sum(cpu_percent) / len(cpu_percent),
                    'frequency': {
                        'current': cpu_freq.current,
                        'min': cpu_freq.min,
                        'max': cpu_freq.max
                    } if cpu_freq else None
                },
                'memory': {
                    'total': memory.total,
                    'available': memory.available,
                    'used': memory.used,
                    'percent': memory.percent
                },
                'disk': {
                    'total': disk.total,
                    'used': disk.used,
                    'free': disk.free,
                    'percent': disk.percent
                },
                'network': {
                    'interfaces': network_stats,
                    'io': {
                        'bytes_sent': net_io.bytes_sent,
                        'bytes_recv': net_io.bytes_recv,
                        'packets_sent': net_io.packets_sent,
                        'packets_recv': net_io.packets_recv
                    }
                },
                'volumes': {
                    'total_size': total_volume_size
                }
            }
            
            return Response(stats)
        except Exception as e:
            return Response(
                {'error': f'System stats error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            ) 