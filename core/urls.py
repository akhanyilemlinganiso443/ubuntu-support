from django.urls import path
from . import views

urlpatterns = [
    path('api/requests/', views.requests_api, name='requests_api'),
    path('api/requests/create/', views.create_request, name='create_request'),
    path('api/login/', views.login_user, name='login'),
    path('api/register/', views.register_user, name='register'),
    path('api/logout/', views.logout_user, name='logout'),
]