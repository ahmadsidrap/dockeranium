from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NetworkViewSet

router = DefaultRouter()
router.register(r'networks', NetworkViewSet, basename='network')

urlpatterns = [
    path('', include(router.urls)),
] 