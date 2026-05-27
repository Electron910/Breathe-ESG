# SOURCES

## SAP Fuel & Procurement
**Real world format researched:**
SAP S/4HANA and ECC flat file exports via SE16 table browser or COGI/MIGO transaction. Documented in SAP Help Portal under 'Data Transfer Workbench' and widely discussed in SCN (SAP Community Network). Format: semicolon delimited, headers in language of SAP system locale (German for European plants), dates in locale specific format (DD.MM.YYYY for German), decimal separator is comma not period.

**What I learned:**
SAP doesn't have a single export format, it depends on the transaction, the user's locale and the system version. The most continuous pattern i saw for procurement/fuel is MB52 (warehouse stocks) or MIGO report exports. Units are SAP internal codes which are not human readable. Plant codes are alphanumeric with no standard meaning. Material numbers are integers referencing a material master table the client must provide.

**Sample data design:**
50 rows, plant codes DE01/DE02/IN01, material groups FUEL_DIESEL/FUEL_NATGAS/PROC_CHEMICALS. German locale: headers in German, comma decimal separators, DD.MM.YYYY dates. Units: mix of L, KG, M3 to test conversion logic. 3 rows with unknown plant codes to test suspicious flagging.

**What would break in production:**
Client plants in multiple SAP systems with different locale settings → inconsistent formats in same export. Material master not provided → can't map material number to fuel type. Client using SAP BW (Business Warehouse) extract → completely different schema. Multi-currency rows (procurement in USD vs EUR) → need FX handling.

## Utility Electricity
**Real world format researched:**
UK: National Grid, EDF, British Gas portal CSV exports. US: PG&E, Con Ed Green Button CSV. EU: Vattenfall, E.ON portal exports. All offer CSV download, typically monthly or on demand. Format: one row per billing period per meter, columns for consumption (kWh/MWh), demand (kW), tariff, billing period start/end, account number, meter ID.

**What I learned:**
I saw billing periods rarely aligned with calendar months (utility reads meters on fixed day cycles). Large clients have multiple accounts and dozens of meters. Some exports include reactive power (kVAr) irrelevant for emissions. Units vary: US utilities often export in kWh; EU sometimes MWh for large commercial accounts. Grid emission factors change annually (national inventory updates) and vary by region within a country.

**Sample data design:**
3 meters (main building, warehouse, data centre), 12 months × 3 = 36 rows. Billing periods cross month boundaries. One MWh row to test conversion. Two country codes (GB, DE) to test different grid emission factors.

**What would break in production:**
Client has 200 meters across 30 buildings → need meter to building hierarchy. Half hourly interval data instead of monthly billing summaries → need aggregation. Utility provides PDF bills not CSV → need PDF parser per supplier. Client switches supplier mid year → same meter, different supplier, different market based EF.

## Source: Corporate Travel
**Real world format researched:**
SAP Concur standard expense report CSV export. Navan trip report export. Both documented in their respective developer portals and support documentation. Concur fields: report name, employee ID, travel date, expense type, amount, merchant name, origin city, destination city, distance. Key gap: airport codes not always present sometimes just city names. Distance often blank.

**What I learned:**
GHG Protocol Technical Guidance for Scope 3 (Category 6) specifies distance based method for air travel. Without distance, must compute great circle distance from airport location. Booking class (economy/business/first) has a multiplier on emission factor (DEFRA: business = 2.9× economy for long haul). Hotel emission factors are per room night and vary by country or star rating. Radiative forcing index (RFI) for aviation is disputed, DEFRA includes it (factor of 1.9), GHG Protocol makes it optional.

**Sample data design:**
40 rows: 20 air trips (mix of short/long haul, economy/business, with and without distance), 8 hotel stays, 7 rail trips, 5 car rentals. IATA codes for airports to test distance calculation.

**What would break in production:**
City level data instead of IATA codes → need geocoding or city to airport mapping. Non standard expense categories → need mapping to transport modes. International trips where layovers not listed as separate segments → understated emissions. Employee expense claims for personal car mileage → need mileage rate conversion.
