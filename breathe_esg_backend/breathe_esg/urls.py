from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from ingestion.views import DataSourceViewSet, IngestionBatchViewSet, EmissionRecordViewSet
from review.views import review_record, bulk_approve, lock_records, export_records, dashboard_summary
from tenants.views import setup_tenant, current_user

router = DefaultRouter()
router.register(r'sources', DataSourceViewSet, basename='datasource')
router.register(r'batches', IngestionBatchViewSet, basename='batch')
router.register(r'records', EmissionRecordViewSet, basename='record')

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Auth
    path('api/setup/', setup_tenant, name='setup_tenant'),
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/me/', current_user, name='current_user'),
    
    # Custom Review Actions
    path('api/records/<uuid:pk>/review/', review_record, name='review_record'),
    path('api/records/bulk-approve/', bulk_approve, name='bulk_approve'),
    path('api/records/lock/', lock_records, name='lock_records'),
    path('api/records/export/', export_records, name='export_records'),
    
    # Viewsets
    path('api/', include(router.urls)),
    
    # Dashboard
    path('api/dashboard/summary/', dashboard_summary, name='dashboard_summary'),
]
