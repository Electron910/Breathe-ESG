import os
import csv
import random
from datetime import datetime, timedelta

os.makedirs('sample_data', exist_ok=True)

def generate_sap():
    headers = ['Buchungsdatum', 'Werk', 'Materialnummer', 'Materialgruppe', 'Bezeichnung', 'Menge', 'Einheit', 'Kostenstelle', 'Lieferant', 'Belegdatum', 'Betrag EUR']
    
    plants = ['DE01', 'DE02', 'IN01']
    materials = [
        ('100000042', 'FUEL_DIESEL', 'Dieselkraftstoff'),
        ('100000043', 'FUEL_NATGAS', 'Erdgas'),
        ('200000011', 'PROC_CHEMICALS', 'Chemikalien')
    ]
    
    with open('sample_data/sap_sample.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f, delimiter=';')
        writer.writerow(headers)
        
        base_date = datetime(2024, 1, 1)
        for i in range(50):
            d = base_date + timedelta(days=random.randint(0, 100))
            buchungsdatum = d.strftime('%d.%m.%Y')
            
            # intentional edge cases
            if i == 5:
                buchungsdatum = '32.13.2024' # ERROR date
                
            werk = random.choice(plants)
            if i in [10, 11, 12]:
                werk = 'UNKNOWN' # SUSPICIOUS unknown plant
                
            mat_num, mat_grp, bez = random.choice(materials)
            
            menge = random.uniform(100, 2000)
            if i in [1, 2]:
                # German comma decimal, thousands separator
                menge_str = f"{menge:,.3f}".replace(',', 'X').replace('.', ',').replace('X', '.')
            else:
                menge_str = f"{menge:.3f}".replace('.', ',') # standard SAP german format

            unit = random.choice(['L', 'KG', 'M3'])
            if i == 20: unit = 'GAL'
            
            # Outlier rows
            if i >= 40 and i <= 44:
                werk = 'DE01'
                mat_num, mat_grp, bez = materials[0]
                buchungsdatum = '15.03.2024'
                menge_str = f"{random.uniform(5000, 10000):.3f}".replace('.', ',') # Outlier
            
            row = [
                buchungsdatum, werk, mat_num, mat_grp, bez, menge_str, unit, 
                f"CC-{werk}-01", "SHELL AG", buchungsdatum, f"{random.uniform(1000, 5000):.2f}".replace('.', ',')
            ]
            writer.writerow(row)

def generate_utility():
    headers = ['account_number', 'meter_id', 'billing_period_start', 'billing_period_end', 'consumption_kwh', 'peak_demand_kw', 'unit', 'meter_location', 'tariff_code', 'supplier', 'country_code']
    meters = [
        ('ACC-01', 'MTR-BLD-A', 'Building A', 'GB'),
        ('ACC-01', 'MTR-BLD-B', 'Warehouse', 'GB'),
        ('ACC-02', 'MTR-DC-01', 'Data Centre', 'DE')
    ]
    
    with open('sample_data/utility_sample.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        
        for m_idx, meter in enumerate(meters):
            acc, mid, loc, ccode = meter
            start_date = datetime(2023, 12, 18) # Cross month boundaries
            for month in range(12):
                end_date = start_date + timedelta(days=random.randint(28, 33))
                cons = random.uniform(10000, 50000)
                unit = 'kWh'
                
                # intentional edge cases
                if m_idx == 0 and month == 5:
                    unit = 'MWh'
                    cons = cons / 1000
                if m_idx == 1 and month == 8:
                    cons = 0 # zero consumption suspicious
                
                row = [
                    acc, mid, start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d'),
                    f"{cons:.2f}", f"{random.uniform(50, 200):.1f}", unit, loc, 'COMMERCIAL_HV',
                    'National Grid' if ccode == 'GB' else 'E.ON', ccode
                ]
                writer.writerow(row)
                start_date = end_date

def generate_travel():
    headers = ['trip_id', 'employee_id', 'travel_date', 'mode', 'origin_code', 'destination_code', 'booking_class', 'distance_km', 'hotel_nights', 'car_km', 'cost_usd', 'vendor', 'trip_purpose']
    
    with open('sample_data/travel_sample.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        
        base_date = datetime(2024, 1, 1)
        for i in range(40):
            d = base_date + timedelta(days=random.randint(0, 100))
            
            mode = random.choices(['air', 'hotel', 'rail', 'car'], weights=[20, 8, 7, 5])[0]
            
            orig = dest = dist = hotel = car = bclass = ''
            if mode == 'air':
                orig = random.choice(['LHR', 'JFK', 'BOM', 'FRA'])
                dest = random.choice(['LHR', 'JFK', 'BOM', 'FRA'])
                while dest == orig: dest = random.choice(['LHR', 'JFK', 'BOM', 'FRA'])
                
                bclass = random.choices(['economy', 'business'], weights=[9, 1])[0]
                if random.random() > 0.5:
                    dist = f"{random.uniform(500, 5000):.1f}" # some with distance
                # else no distance, must be computed
                
                if i == 5:
                    orig = 'INVALID_CODE'
            elif mode == 'hotel':
                dest = random.choice(['London', 'New York', 'Mumbai'])
                hotel = random.randint(1, 5)
            elif mode == 'rail':
                orig = 'London Euston'
                dest = 'Manchester Piccadilly'
                dist = '300'
            elif mode == 'car':
                car = f"{random.uniform(50, 400):.1f}"

            row = [
                f"TRP-2024-{i:04d}", f"EMP-{random.randint(1000,9999)}", d.strftime('%Y-%m-%d'),
                mode, orig, dest, bclass, dist, hotel, car, f"{random.uniform(100, 2000):.2f}",
                "Vendor", "Client Meeting"
            ]
            writer.writerow(row)

generate_sap()
generate_utility()
generate_travel()
print("Sample data generated!")
