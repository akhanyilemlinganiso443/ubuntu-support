from rest_framework import viewsets, permissions
from django.contrib.auth.models import User
from rest_framework.exceptions import PermissionDenied
from core.models import ServiceRequest, Opportunity, Application, RequestUpdate, Profile
from .serializers import ServiceRequestSerializer, OpportunitySerializer, ApplicationSerializer, RequestUpdateSerializer

def get_role(user):
    if not user.is_authenticated:
        return None
    if user.is_superuser:
        return 'ADMIN'
    profile = getattr(user, 'profile', None)
    return profile.role if profile else 'CLIENT'

class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return get_role(request.user) == 'ADMIN'

class ServiceRequestViewSet(viewsets.ModelViewSet):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]
    serializer_class = ServiceRequestSerializer

    def get_queryset(self):
        role = get_role(self.request.user)
        if role in ['AGENT', 'ADMIN']:
            return ServiceRequest.objects.all().order_by('-created_at')
        if self.request.user.is_authenticated:
            return ServiceRequest.objects.filter(client=self.request.user).order_by('-created_at')
        return ServiceRequest.objects.all().order_by('-created_at')

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else User.objects.first()
        serializer.save(client=user, status='OPEN')

    def perform_update(self, serializer):
        role = get_role(self.request.user)
        # Only AGENT / ADMIN can change status / assign agent
        if role not in ['AGENT', 'ADMIN']:
            raise PermissionDenied("Only Support Agent or Admin can update a request.")
        serializer.save()

class OpportunityViewSet(viewsets.ModelViewSet):
    queryset = Opportunity.objects.all().order_by('-created_at')
    serializer_class = OpportunitySerializer
    permission_classes = [IsAdminOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class ApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        role = get_role(self.request.user)
        if role in ['AGENT', 'ADMIN']:
            return Application.objects.all().order_by('-applied_at')
        if self.request.user.is_authenticated:
            return Application.objects.filter(applicant=self.request.user).order_by('-applied_at')
        return Application.objects.none()

    def perform_create(self, serializer):
        if get_role(self.request.user) not in ['CLIENT', 'ADMIN']:
            raise PermissionDenied("Only MSME Clients can apply.")
        serializer.save(applicant=self.request.user)

class RequestUpdateViewSet(viewsets.ModelViewSet):
    queryset = RequestUpdate.objects.all().order_by('-created_at')
    serializer_class = RequestUpdateSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)