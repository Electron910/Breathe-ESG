import hashlib
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from decimal import Decimal
from .models import DataSource, IngestionBatch, EmissionRecord
from .serializers import DataSourceSerializer, IngestionBatchSerializer, EmissionRecordSerializer
from .parsers import SAPParser, UtilityParser, TravelParser

class DataSourceViewSet(viewsets.ModelViewSet):
    serializer_class = DataSourceSerializer

    def get_queryset(self):
        return DataSource.objects.filter(tenant=self.request.user.tenant)
        
    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant)

class IngestionBatchViewSet(viewsets.ModelViewSet):
    serializer_class = IngestionBatchSerializer

    def get_queryset(self):
        return IngestionBatch.objects.filter(tenant=self.request.user.tenant).order_by('-created_at')

    @action(detail=False, methods=['post'])
    def upload(self, request):
        source_id = request.data.get('source_id')
        file_obj = request.FILES.get('file')
        
        if not source_id or not file_obj:
            return Response({"error": "source_id and file are required"}, status=status.HTTP_400_BAD_REQUEST)
            
        source = DataSource.objects.get(id=source_id, tenant=request.user.tenant)
        
        file_content = file_obj.read()
        file_hash = hashlib.sha256(file_content).hexdigest()
        
        batch = IngestionBatch.objects.create(
            tenant=request.user.tenant,
            source=source,
            uploaded_by=request.user,
            raw_file=file_obj,
            file_hash=file_hash,
            status='PROCESSING'
        )
        
        # Synchronous parsing for prototype
        try:
            if source.source_type == 'SAP':
                parser = SAPParser(batch, batch.raw_file.path)
            elif source.source_type == 'UTILITY':
                parser = UtilityParser(batch, batch.raw_file.path)
            else:
                parser = TravelParser(batch, batch.raw_file.path)
                
            records_data = parser.parse()
            
            # Save records
            records_to_create = []
            error_count = 0
            for r in records_data:
                if r.get('status') == 'ERROR':
                    error_count += 1
                
                records_to_create.append(EmissionRecord(
                    tenant=request.user.tenant,
                    batch=batch,
                    source_type=r.get('source_type', source.source_type),
                    scope=r.get('scope', 3),
                    category=r.get('category', ''),
                    activity_value=r.get('activity_value'),
                    activity_unit=r.get('activity_unit'),
                    period_start=r.get('period_start'),
                    period_end=r.get('period_end'),
                    location=r.get('location', ''),
                    status=r.get('status', 'PENDING'),
                    flag_reason=r.get('flag_reason'),
                    raw_row=r.get('raw_row', {}),
                    co2e_kg=r.get('activity_value', 0) * Decimal('1.5') # Mock EF for prototype
                ))

                
            EmissionRecord.objects.bulk_create(records_to_create)
            
            batch.status = 'COMPLETE'
            batch.row_count = len(records_to_create)
            batch.error_count = error_count
            batch.save()
            
            return Response(IngestionBatchSerializer(batch).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            batch.status = 'FAILED'
            batch.save()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class EmissionRecordViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = EmissionRecordSerializer

    def get_queryset(self):
        queryset = EmissionRecord.objects.filter(tenant=self.request.user.tenant).order_by('-created_at')
        batch_id = self.request.query_params.get('batch')
        status = self.request.query_params.get('status')
        source_type = self.request.query_params.get('source_type')
        
        if batch_id:
            queryset = queryset.filter(batch_id=batch_id)
        if status:
            queryset = queryset.filter(status=status)
        if source_type:
            queryset = queryset.filter(source_type=source_type)
            
        return queryset
