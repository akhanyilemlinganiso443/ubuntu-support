from django.contrib import admin
from .models import Profile, ServiceRequest, Opportunity, Application, RequestUpdate

admin.site.register(Profile)
admin.site.register(ServiceRequest)
admin.site.register(Opportunity)
admin.site.register(Application)
admin.site.register(RequestUpdate)