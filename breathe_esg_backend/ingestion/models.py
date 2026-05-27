import uuid
from django.db import models
from tenants.models import Tenant, User

class DataSource(models.Model):
    SOURCE_TYPES = (
        ('SAP', 'SAP'),
        ('UTILITY', 'Utility'),
        ('TRAVEL', 'Travel'),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='data_sources')
    source_type = models.CharField(max_length=20, choices=SOURCE_TYPES)
    name = models.CharField(max_length=255)
    config = models.JSONField(default=dict, blank=True)
    last_ingested_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.source_type})"

class IngestionBatch(models.Model):
    STATUS_CHOICES = (
        ('PROCESSING', 'Processing'),
        ('COMPLETE', 'Complete'),
        ('FAILED', 'Failed'),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='ingestion_batches')
    source = models.ForeignKey(DataSource, on_delete=models.CASCADE, related_name='batches')
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='uploaded_batches')
    raw_file = models.FileField(upload_to='raw_uploads/')
    file_hash = models.CharField(max_length=64)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PROCESSING')
    row_count = models.IntegerField(default=0)
    error_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

class EmissionRecord(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('SUSPICIOUS', 'Suspicious'),
        ('ERROR', 'Error'),
        ('APPROVED', 'Approved'),
        ('LOCKED', 'Locked'),
    )
    SCOPE_CHOICES = (
        (1, 'Scope 1'),
        (2, 'Scope 2'),
        (3, 'Scope 3'),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='emission_records')
    batch = models.ForeignKey(IngestionBatch, on_delete=models.CASCADE, related_name='records')
    source_type = models.CharField(max_length=20, choices=DataSource.SOURCE_TYPES)
    scope = models.IntegerField(choices=SCOPE_CHOICES)
    category = models.CharField(max_length=255)
    
    activity_value = models.DecimalField(max_digits=15, decimal_places=4, null=True, blank=True)
    activity_unit = models.CharField(max_length=50, null=True, blank=True)
    normalised_value = models.DecimalField(max_digits=15, decimal_places=4, null=True, blank=True)
    co2e_kg = models.DecimalField(max_digits=15, decimal_places=4, null=True, blank=True)
    
    emission_factor = models.DecimalField(max_digits=12, decimal_places=6, null=True, blank=True)
    emission_factor_source = models.CharField(max_length=255, null=True, blank=True)
    
    period_start = models.DateField(null=True, blank=True)
    period_end = models.DateField(null=True, blank=True)
    location = models.CharField(max_length=255, null=True, blank=True)
    
    raw_row = models.JSONField(default=dict)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    flag_reason = models.TextField(null=True, blank=True)
    
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_records')
    reviewed_at = models.DateTimeField(null=True, blank=True)
    locked_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class AuditLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='audit_logs')
    actor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='actions')
    record = models.ForeignKey(EmissionRecord, on_delete=models.CASCADE, null=True, blank=True, related_name='audit_logs')
    batch = models.ForeignKey(IngestionBatch, on_delete=models.CASCADE, null=True, blank=True, related_name='audit_logs')
    action = models.CharField(max_length=50) # APPROVE, REJECT, EDIT, LOCK, UPLOAD
    before_state = models.JSONField(null=True, blank=True)
    after_state = models.JSONField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class UnitConversion(models.Model):
    # lookup table seeded from DEFRA/IPCC
    from_unit = models.CharField(max_length=50)
    to_unit = models.CharField(max_length=50)
    factor = models.DecimalField(max_digits=20, decimal_places=10)
    commodity = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return f"{self.from_unit} to {self.to_unit} = {self.factor}"

class PlantCodeLookup(models.Model):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='plant_codes')
    plant_code = models.CharField(max_length=50)
    plant_name = models.CharField(max_length=255)
    country = models.CharField(max_length=2) # ISO 3166-1 alpha-2
    region = models.CharField(max_length=255, null=True, blank=True)
    grid_emission_factor = models.DecimalField(max_digits=12, decimal_places=6, null=True, blank=True)

    class Meta:
        unique_together = ('tenant', 'plant_code')

    def __str__(self):
        return f"{self.plant_code} - {self.plant_name}"
