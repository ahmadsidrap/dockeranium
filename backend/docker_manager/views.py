from django.core.exceptions import ValidationError
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from docker.errors import APIError
import docker
from rest_framework.decorators import api_view
import yaml

def debug_print(message):
    # Print to stdout which shows in docker logs
    print(message, flush=True)

class NetworkViewSet(viewsets.ViewSet):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.client = docker.from_env()

    def list(self, request):
        try:
            networks = self.client.networks.list()
            return Response([{
                'id': network.id,
                'name': network.name,
                'driver': network.attrs['Driver'],
                'scope': network.attrs['Scope'],
                'containers': len(network.attrs.get('Containers', {}))
            } for network in networks])
        except Exception as e:
            return Response({'error': str(e)}, status=500)

    def retrieve(self, request, pk=None):
        try:
            network = self.client.networks.get(pk)
            return Response({
                'id': network.id,
                'name': network.name,
                # ... other fields
            })
        except Exception as e:
            return Response({'error': str(e)}, status=500)

    @action(detail=True, methods=['get'], url_path='disconnected')
    def disconnected(self, request, pk=None):
        try:
            # Get the network
            network = self.client.networks.get(pk)
            network_info = network.attrs
            
            debug_print(f"Network info for {pk}: {network_info}")
            
            # Get all containers that were previously connected to this network
            previously_connected = set()
            if 'Containers' in network_info:
                previously_connected = set(network_info.get('Containers', {}).keys())
                debug_print(f"Previously connected containers: {previously_connected}")
            
            # Get all containers
            containers = self.client.containers.list(all=True)
            
            # Filter for disconnected containers
            disconnected = []
            for container in containers:
                container_networks = container.attrs['NetworkSettings']['Networks']
                debug_print(f"Container {container.name} networks: {container_networks.keys()}")
                # Check if container was previously connected but is not currently connected
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
            return Response(disconnected)
            
        except APIError as e:
            return Response({'error': str(e)}, status=400)
        except Exception as e:
            debug_print(f"Error in disconnected: {str(e)}")
            return Response({'error': str(e)}, status=500)

    @action(detail=True, methods=['get'], url_path='reconstruct')
    def reconstruct(self, request, pk=None):
        try:
            network = self.client.networks.get(pk)
            network_info = network.attrs
            
            # Create a docker-compose style configuration with ordered sections
            compose_config = {
                'version': '3',
                'services': {},
                'networks': {
                    network.name: {
                        'driver': network_info['Driver'],
                        'ipam': {
                            'driver': network_info['IPAM']['Driver'],
                            'config': network_info['IPAM']['Config']
                        }
                    }
                }
            }
            
            # Add connected containers as services
            for container_id, container_info in network_info.get('Containers', {}).items():
                container = self.client.containers.get(container_id)
                container_config = container.attrs['Config']
                
                service_name = container.name.lstrip('/')
                service_config = {
                    'image': container_config['Image'],
                    'container_name': container.name.lstrip('/'),
                    'networks': [network.name]
                }

                # Add environment variables if any
                if container_config.get('Env'):
                    env_list = []
                    for env in container_config['Env']:
                        if '=' in env:  # Only add valid env vars
                            env_list.append(env)
                    if env_list:
                        service_config['environment'] = env_list

                # Add ports if any
                ports = container.attrs['NetworkSettings']['Ports']
                if ports:
                    port_list = []
                    for container_port, binding in ports.items():
                        if binding:
                            port = container_port.split('/')[0]
                            for bind in binding:
                                port_list.append(f"{bind['HostPort']}:{port}")
                    if port_list:
                        service_config['ports'] = port_list

                # Add volumes if any
                if container_config.get('Volumes'):
                    volumes = []
                    for container_path in container_config['Volumes'].keys():
                        volumes.append(f"{container_path}")
                    if volumes:
                        service_config['volumes'] = volumes

                compose_config['services'][service_name] = service_config
            
            # Convert to YAML with proper formatting
            yaml.add_representer(
                dict,
                lambda dumper, data: dumper.represent_dict(data.items()),
                Dumper=yaml.SafeDumper
            )
            
            yaml_content = yaml.dump(
                compose_config,
                default_flow_style=False,
                sort_keys=False,
                Dumper=yaml.SafeDumper
            )
            
            return Response({'yaml': yaml_content})
            
        except Exception as e:
            return Response({'error': str(e)}, status=500)

    @action(detail=True, methods=['post'], url_path='apply')
    def apply_config(self, request, pk=None):
        try:
            yaml_content = request.data.get('yaml')
            if not yaml_content:
                return Response({'error': 'No YAML configuration provided'}, status=400)
            
            # Parse YAML
            config = yaml.safe_load(yaml_content)
            
            # Apply network configuration
            # Note: This is a placeholder. Actual implementation would need to:
            # 1. Validate the configuration
            # 2. Compare with current state
            # 3. Apply changes safely
            # 4. Handle errors appropriately
            
            return Response({'message': 'Configuration applied successfully'})
            
        except Exception as e:
            return Response({'error': str(e)}, status=500)

@api_view(['GET'])
def list_ports(request):
    try:
        client = docker.from_env()
        containers = client.containers.list()
        
        ports_data = []
        for container in containers:
            container_info = container.attrs
            
            # Get networks information
            networks = container_info.get('NetworkSettings', {}).get('Networks', {})
            for network_name, network_info in networks.items():
                network_id = network_info.get('NetworkID', '')
                
                # Get port mappings
                ports = container_info.get('NetworkSettings', {}).get('Ports', {})
                
                if ports:  # Only add if container has ports
                    ports_data.append({
                        'containerId': container.id,
                        'containerName': container.name.lstrip('/'),
                        'networkId': network_id,
                        'networkName': network_name,
                        'ports': ports
                    })
        
        debug_print(f"Ports data: {ports_data}")  # Add debug logging
        return Response(ports_data)
    except Exception as e:
        debug_print(f"Error in list_ports: {str(e)}")  # Add debug logging
        return Response({'error': str(e)}, status=500) 