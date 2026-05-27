from django.contrib import admin
from .models import DataSource, IngestionBatch, EmissionRecord, AuditLog, UnitConversion, PlantCodeLookup

admin.site.register(DataSource)
admin.site.register(IngestionBatch)
admin.site.register(EmissionRecord)
admin.site.register(AuditLog)
admin.site.register(UnitConversion)
admin.site.register(PlantCodeLookup)
