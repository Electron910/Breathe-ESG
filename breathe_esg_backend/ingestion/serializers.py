from rest_framework import serializers
from .models import DataSource, IngestionBatch, EmissionRecord, AuditLog

class DataSourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = DataSource
        fields = '__all__'
        read_only_fields = ['tenant']

class IngestionBatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = IngestionBatch
        fields = '__all__'
        read_only_fields = ['tenant', 'uploaded_by', 'status', 'row_count', 'error_count', 'file_hash']

class EmissionRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmissionRecord
        fields = '__all__'
        read_only_fields = ['tenant', 'co2e_kg', 'normalised_value']
