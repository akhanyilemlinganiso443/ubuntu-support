from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
import json

# Fake storage for now - so we don't break your DB
REQUESTS = [
  {"id": 1, "title": "Plumbing", "category": "Business Support", "status": "OPEN"},
  {"id": 2, "title": "Small Business Funding", "category": "Funding", "status": "OPEN"},
  {"id": 3, "title": "Business Skills Training", "category": "Training", "status": "OPEN"},
]

def get_requests(request):
    return JsonResponse(REQUESTS, safe=False)

@csrf_exempt
def create_request(request):
    if request.method == "POST":
        data = json.loads(request.body)
        new_req = {
            "id": len(REQUESTS) + 1,
            "title": data.get("title"),
            "category": data.get("category"),
            "status": "OPEN"
        }
        REQUESTS.append(new_req)
        return JsonResponse(new_req)
    return JsonResponse({"error": "POST only"})

@csrf_exempt
def login_user(request):
    if request.method == "POST":
        data = json.loads(request.body)
        user = authenticate(username=data.get("username"), password=data.get("password"))
        if user:
            return JsonResponse({"success": True, "username": user.username})
        return JsonResponse({"success": False, "error": "Wrong username or password"})
    return JsonResponse({"error": "POST only"})

@csrf_exempt
def register_user(request):
    if request.method == "POST":
        data = json.loads(request.body)
        if User.objects.filter(username=data.get("username")).exists():
            return JsonResponse({"success": False, "error": "User already exists"})
        User.objects.create_user(username=data.get("username"), password=data.get("password"))
        return JsonResponse({"success": True})
    return JsonResponse({"error": "POST only"})
def dashboard(request):
    return JsonResponse({"message": "Dashboard works", "requests": REQUESTS})

def home(request):
    return JsonResponse({"message": "UEH Home - API is running"})
def requests_api(request):
    return JsonResponse({"requests": REQUESTS})

@csrf_exempt
def logout_user(request):
    from django.contrib.auth import logout
    logout(request)
    return JsonResponse({"success": True})