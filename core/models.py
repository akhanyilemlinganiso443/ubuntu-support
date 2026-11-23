from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    ROLE_CHOICES = [
        ('CLIENT', 'MSME Client'),
        ('AGENT', 'Support Agent'),
        ('ADMIN', 'UEH Admin'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='CLIENT')
    business_name = models.CharField(max_length=100, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    def __str__(self):
        return f"{self.user.username} - {self.role}"

class ServiceRequest(models.Model):
    STATUS_CHOICES = [
        ('OPEN', 'Open'),
        ('IN_PROGRESS', 'In Progress'),
        ('RESOLVED', 'Resolved'),
    ]
    URGENCY_CHOICES = [
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
    ]
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='requests')
    agent = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_requests')
    category = models.CharField(max_length=100)
    title = models.CharField(max_length=200, blank=True, default="")
    description = models.TextField()
    urgency = models.CharField(max_length=10, choices=URGENCY_CHOICES, default='MEDIUM')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='OPEN')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Opportunity(models.Model):
    TYPE_CHOICES = [
        ('FUNDING', 'Funding'),
        ('TENDER', 'Tender'),
        ('TRAINING', 'Training'),
    ]
    title = models.CharField(max_length=200)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    description = models.TextField()
    deadline = models.DateField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

class Application(models.Model):
    opportunity = models.ForeignKey(Opportunity, on_delete=models.CASCADE, related_name='applications')
    applicant = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    status = models.CharField(max_length=20, default='PENDING')
    applied_at = models.DateTimeField(auto_now_add=True)

class RequestUpdate(models.Model):
    request = models.ForeignKey(ServiceRequest, on_delete=models.CASCADE, related_name='updates')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)