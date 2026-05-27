import os
import django
import json
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'breathe_esg.settings.dev')
django.setup()
from django.test import Client
from tenants.models import User, Tenant
from ingestion.models import DataSource

c = Client()
t = Tenant.objects.first()
u = User.objects.filter(tenant=t).first()
from rest_framework_simplejwt.tokens import RefreshToken
refresh = RefreshToken.for_user(u)
token = str(refresh.access_token)
ds = DataSource.objects.filter(tenant=t, source_type='SAP').first()

try:
    with open('sample_data/sap_sample.csv', 'rb') as f:
        r = c.post('/api/batches/upload/', {'source_id': str(ds.id), 'file': f}, HTTP_AUTHORIZATION=f'Bearer {token}')
        print("Status:", r.status_code)
        print("Content:", r.content.decode('utf-8'))
except Exception as e:
    import traceback
    traceback.print_exc()
