from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NetworkViewSet, list_ports

router = DefaultRouter()
router.register(r'networks', NetworkViewSet, basename='network')

urlpatterns = [
    path('', include(router.urls)),
    path('ports/', list_ports, name='list_ports'),
] 