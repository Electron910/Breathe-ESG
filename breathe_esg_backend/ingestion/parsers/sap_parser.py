from decimal import Decimal
from .base import BaseParser
from dateutil import parser as date_parser
from ingestion.models import PlantCodeLookup

class SAPParser(BaseParser):
    def get_delimiter(self) -> str:
        return ';'

    def process_row(self, raw_row) -> dict:
        date_str = raw_row.get('Buchungsdatum')
        if not date_str:
            raise ValueError("Missing Buchungsdatum")
            
        try:
            period_start = date_parser.parse(date_str, dayfirst=True).date()
        except Exception:
            raise ValueError(f"Invalid date format: {date_str}")
            
        plant_code = raw_row.get('Werk', '')
        mat_group = raw_row.get('Materialgruppe', '')
        
        status = 'PENDING'
        flag_reason = []
        
        # Verify plant code
        if not PlantCodeLookup.objects.filter(tenant=self.tenant, plant_code=plant_code).exists():
            status = 'SUSPICIOUS'
            flag_reason.append(f"Unknown plant code: {plant_code}")
            
        menge_str = raw_row.get('Menge', '0').replace('.', '').replace(',', '.')
        try:
            activity_value = Decimal(menge_str)
        except:
            raise ValueError(f"Invalid Menge: {raw_row.get('Menge')}")
            
        unit = raw_row.get('Einheit', '')
        
        # Scope 1 vs 3 based on material group
        scope = 1 if mat_group.startswith('FUEL') else 3
        
        return {
            'source_type': 'SAP',
            'scope': scope,
            'category': mat_group,
            'activity_value': activity_value,
            'activity_unit': unit,
            'period_start': period_start,
            'period_end': period_start,
            'location': plant_code,
            'status': status,
            'flag_reason': '; '.join(flag_reason) if flag_reason else None,
            'raw_row': raw_row
        }
