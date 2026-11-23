from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ServiceRequestViewSet, OpportunityViewSet, ApplicationViewSet, RequestUpdateViewSet

router = DefaultRouter()
router.register(r'requests', ServiceRequestViewSet, basename='servicerequest')
router.register(r'opportunities', OpportunityViewSet, basename='opportunity')
router.register(r'applications', ApplicationViewSet, basename='application')
router.register(r'updates', RequestUpdateViewSet, basename='requestupdate')

urlpatterns = [
    path('', include(router.urls)),
]