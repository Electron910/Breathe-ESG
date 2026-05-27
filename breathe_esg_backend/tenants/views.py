from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .models import Tenant, User

@api_view(['POST'])
@permission_classes([AllowAny])
def setup_tenant(request):
    data = request.data
    tenant_name = data.get('company_name', 'Default Tenant')
    slug = tenant_name.lower().replace(' ', '-')
    tenant, _ = Tenant.objects.get_or_create(name=tenant_name, slug=slug)
    
    email = data.get('email')
    password = data.get('password')
    if not User.objects.filter(email=email).exists():
        user = User.objects.create_user(email=email, password=password, tenant=tenant, role='ADMIN')
    
    return Response({'message': 'Tenant and User created successfully.'}, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    return Response({
        'id': request.user.id,
        'email': request.user.email,
        'role': request.user.role,
        'tenant_name': request.user.tenant.name if request.user.tenant else None
    })
