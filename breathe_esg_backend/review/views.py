import csv
from django.utils import timezone
from django.http import HttpResponse
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication

class QueryParameterJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        token = request.query_params.get('token')
        if token:
            try:
                validated_token = self.get_validated_token(token.encode('utf-8'))
                return self.get_user(validated_token), validated_token
            except Exception:
                pass
        return super().authenticate(request)

from django.db.models import Sum, Count

from ingestion.models import EmissionRecord, AuditLog
from tenants.permissions import IsAdminRole

@api_view(['PATCH'])
@permission_classes([IsAuthenticated, IsAdminRole])
def review_record(request, pk):
    try:
        record = EmissionRecord.objects.get(pk=pk, tenant=request.user.tenant)
    except EmissionRecord.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
        
    action = request.data.get('action') # APPROVE, REJECT, EDIT
    if action not in ['APPROVE', 'REJECT', 'EDIT']:
        return Response({"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)
        
    before_state = record.status
    
    if action == 'APPROVE':
        record.status = 'APPROVED'
    elif action == 'REJECT':
        record.status = 'ERROR'
        reason_provided = request.data.get('reason')
        record.flag_reason = reason_provided if reason_provided else 'Manually rejected'
    elif action == 'EDIT':
        # Apply edits
        if 'activity_value' in request.data:
            record.activity_value = request.data['activity_value']
            # Recompute co2e_kg for prototype
            record.co2e_kg = float(record.activity_value) * 1.5 
            
    record.reviewed_by = request.user
    record.reviewed_at = timezone.now()
    record.save()
    
    AuditLog.objects.create(
        tenant=request.user.tenant,
        actor=request.user,
        record=record,
        action=action,
        before_state={'status': before_state},
        after_state={'status': record.status, 'activity_value': str(record.activity_value)}
    )
    
    return Response({"status": record.status})

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminRole])
def bulk_approve(request):
    batch_id = request.data.get('batch_id')
    if not batch_id:
        return Response({"error": "batch_id required"}, status=status.HTTP_400_BAD_REQUEST)
        
    records = EmissionRecord.objects.filter(tenant=request.user.tenant, batch_id=batch_id, status='PENDING')
    count = records.count()
    
    records.update(status='APPROVED', reviewed_by=request.user, reviewed_at=timezone.now())
    
    # Audit log for bulk
    AuditLog.objects.create(
        tenant=request.user.tenant,
        actor=request.user,
        action='BULK_APPROVE',
        after_state={'count': count, 'batch_id': batch_id}
    )
    
    return Response({"approved_count": count})

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminRole])
def lock_records(request):
    # Lock approved records for audit
    records = EmissionRecord.objects.filter(tenant=request.user.tenant, status='APPROVED')
    count = records.count()
    records.update(status='LOCKED', locked_at=timezone.now())
    return Response({"locked_count": count})

@api_view(['GET'])
@authentication_classes([QueryParameterJWTAuthentication])
@permission_classes([IsAuthenticated])
def export_records(request):
    records = EmissionRecord.objects.filter(tenant=request.user.tenant, status='LOCKED')
    
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="audit_export.csv"'
    
    writer = csv.writer(response)
    writer.writerow(['ID', 'Source', 'Scope', 'Category', 'Activity Value', 'Unit', 'CO2e (kg)', 'Period Start', 'Location', 'Locked At'])
    
    for r in records:
        writer.writerow([
            r.id, r.source_type, r.scope, r.category, r.activity_value, 
            r.activity_unit, r.co2e_kg, r.period_start, r.location, r.locked_at
        ])
        
    return response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_summary(request):
    tenant = request.user.tenant
    
    # Totals by scope
    scope_totals = list(EmissionRecord.objects.filter(tenant=tenant).values('scope').annotate(total_co2e=Sum('co2e_kg')))
    
    # Status counts
    status_counts = list(EmissionRecord.objects.filter(tenant=tenant).values('status').annotate(count=Count('id')))
    
    # Source counts
    source_counts = list(EmissionRecord.objects.filter(tenant=tenant).values('source_type').annotate(count=Count('id')))
    
    return Response({
        "scope_totals": scope_totals,
        "status_counts": status_counts,
        "source_counts": source_counts,
        "total_records": EmissionRecord.objects.filter(tenant=tenant).count()
    })
