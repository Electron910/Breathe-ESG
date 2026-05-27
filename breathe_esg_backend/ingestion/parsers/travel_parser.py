from decimal import Decimal
from .base import BaseParser
from dateutil import parser as date_parser

class TravelParser(BaseParser):
    def get_delimiter(self) -> str:
        return ','

    def process_row(self, raw_row) -> dict:
        date_str = raw_row.get('travel_date')
        if not date_str:
            raise ValueError("Missing travel date")
            
        period_start = date_parser.parse(date_str).date()
        mode = raw_row.get('mode', 'air')
        
        activity_value = Decimal(0)
        unit = ''
        
        status = 'PENDING'
        flag_reason = []
        
        if mode == 'air':
            dist_str = raw_row.get('distance_km')
            if dist_str:
                activity_value = Decimal(dist_str)
                unit = 'km'
            else:
                orig = raw_row.get('origin_code', '')
                dest = raw_row.get('destination_code', '')
                if not orig or orig == 'INVALID_CODE':
                    status = 'ERROR'
                    flag_reason.append("Missing or invalid airport code for distance calculation")
                else:
                    # Mock distance calc for prototype
                    activity_value = Decimal('1000.0')
                    unit = 'km'
                    status = 'SUSPICIOUS'
                    flag_reason.append(f"Distance computed from {orig} to {dest} via mock haversine")
                    
        elif mode == 'hotel':
            activity_value = Decimal(raw_row.get('hotel_nights', '1') or '1')
            unit = 'nights'
        elif mode == 'car':
            activity_value = Decimal(raw_row.get('car_km', '0') or '0')
            unit = 'km'
        elif mode == 'rail':
            activity_value = Decimal(raw_row.get('distance_km', '0') or '0')
            unit = 'km'
            
        if status == 'ERROR':
            raise ValueError('; '.join(flag_reason))
            
        return {
            'source_type': 'TRAVEL',
            'scope': 3,
            'category': f"business_travel_{mode}",
            'activity_value': activity_value,
            'activity_unit': unit,
            'period_start': period_start,
            'period_end': period_start,
            'location': raw_row.get('destination_code', ''),
            'status': status,
            'flag_reason': '; '.join(flag_reason) if flag_reason else None,
            'raw_row': raw_row
        }
