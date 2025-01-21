from django.core.exceptions import ValidationError
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from docker.errors import APIError
import docker
from rest_framework.decorators import api_view

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