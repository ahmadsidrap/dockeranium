from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ContainerViewSet, 
    ImageListView, 
    NetworkViewSet,
    VolumeListView, 
    StatsView, 
    SystemStatsView
)

router = DefaultRouter()
router.register(r'containers', ContainerViewSet, basename='container')
router.register(r'networks', NetworkViewSet, basename='network')

urlpatterns = [
    path('', include(router.urls)),
    path('stats', StatsView.as_view(), name='stats'),
    path('images', ImageListView.as_view(), name='image-list'),
    path('images/<str:image_id>/', ImageListView.as_view(), name='image-detail'),
    path('volumes', VolumeListView.as_view(), name='volume-list'),
    path('volumes/<str:volume_id>/', VolumeListView.as_view(), name='volume-detail'),
    path('system/stats', SystemStatsView.as_view(), name='system-stats'),
] 