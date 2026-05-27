from decimal import Decimal
from .base import BaseParser
from dateutil import parser as date_parser

class UtilityParser(BaseParser):
    def get_delimiter(self) -> str:
        return ','

    def process_row(self, raw_row) -> dict:
        start_str = raw_row.get('billing_period_start')
        end_str = raw_row.get('billing_period_end')
        cons_str = raw_row.get('consumption_kwh', '0')
        unit = raw_row.get('unit', 'kWh')
        
        if not start_str or not end_str:
            raise ValueError("Missing billing period dates")
            
        period_start = date_parser.parse(start_str).date()
        period_end = date_parser.parse(end_str).date()
        
        try:
            activity_value = Decimal(cons_str)
        except:
            raise ValueError("Invalid consumption value")
            
        status = 'PENDING'
        flag_reason = []
        
        if activity_value == 0:
            status = 'SUSPICIOUS'
            flag_reason.append("Zero consumption reported")
            
        return {
            'source_type': 'UTILITY',
            'scope': 2,
            'category': 'purchased_electricity',
            'activity_value': activity_value,
            'activity_unit': unit,
            'period_start': period_start,
            'period_end': period_end,
            'location': raw_row.get('meter_id', ''),
            'status': status,
            'flag_reason': '; '.join(flag_reason) if flag_reason else None,
            'raw_row': raw_row
        }
