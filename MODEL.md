# Breathe ESG Data Model

This document shows the schema for the application. Every table below maps to a Django model.

## Model: Tenant
| Field | Type / Notes |
| :--- | :--- |
| id | UUID PK |
| name | Company name |
| slug | URL-safe identifier |
| created_at | Timestamp |
**Rationale**: Isolates every query. All other models FK to Tenant. Prevents cross client data leakage.

## Model: User
| Field | Type / Notes |
| :--- | :--- |
| id | UUID PK |
| tenant | FK → Tenant |
| email | Unique per tenant |
| role | ANALYST \| ADMIN |
| is_active | Boolean |
**Rationale**: Tenant users. Analysts can review, Admins can configure sources and unlock locked rows.

## Model: DataSource
| Field | Type / Notes |
| :--- | :--- |
| id | UUID PK |
| tenant | FK → Tenant |
| source_type | SAP \| UTILITY \| TRAVEL |
| name | Human label e.g. 'SAP Plant DE01' |
| config | JSONField — credentials, plant codes, meter IDs |
| last_ingested_at | Timestamp |
**Rationale**: One source per integration endpoint. Config holds source specific metadata (plant code lookup, meter ID).

## Model: IngestionBatch
| Field | Type / Notes |
| :--- | :--- |
| id | UUID PK |
| tenant | FK → Tenant |
| source | FK → DataSource |
| uploaded_by | FK → User |
| raw_file | FileField — original upload kept forever |
| file_hash | SHA-256 of raw file |
| status | PROCESSING \| COMPLETE \| FAILED |
| row_count | Integer |
| error_count | Integer |
| created_at | Timestamp |
| completed_at | Nullable timestamp |
**Rationale**: One batch per upload/pull event. Raw file is immutable. Hash detects duplicate uploads.

## Model: EmissionRecord
| Field | Type / Notes |
| :--- | :--- |
| id | UUID PK |
| tenant | FK → Tenant |
| batch | FK → IngestionBatch |
| source_type | SAP \| UTILITY \| TRAVEL |
| scope | 1 \| 2 \| 3 |
| category | e.g. 'stationary_combustion', 'purchased_electricity', 'air_travel' |
| activity_value | Decimal(15,4) — raw quantity |
| activity_unit | VARCHAR — original unit from source |
| normalised_value | Decimal(15,4) — in kWh or kg fuel |
| co2e_kg | Decimal(15,4) — computed tonnes CO2e * 1000 |
| emission_factor | Decimal(12,6) |
| emission_factor_source | e.g. 'IPCC AR6', 'UK DEFRA 2023' |
| period_start | Date |
| period_end | Date |
| location | VARCHAR — plant code, meter ID, airport pair |
| raw_row | JSONField — original row verbatim |
| status | PENDING \| SUSPICIOUS \| ERROR \| APPROVED \| LOCKED |
| flag_reason | Nullable text |
| reviewed_by | FK → User, nullable |
| reviewed_at | Nullable timestamp |
| locked_at | Nullable timestamp |
| created_at | Timestamp |
**Rationale**: Central fact table. co2e_kg computed at ingest, never recomputed after LOCKED. raw_row preserves original for disputes.

## Model: AuditLog
| Field | Type / Notes |
| :--- | :--- |
| id | UUID PK |
| tenant | FK → Tenant |
| actor | FK → User |
| record | FK → EmissionRecord, nullable |
| batch | FK → IngestionBatch, nullable |
| action | VARCHAR — APPROVE, REJECT, EDIT, LOCK, UPLOAD |
| before_state | JSONField — snapshot before change |
| after_state | JSONField — snapshot after change |
| ip_address | GenericIPAddressField |
| created_at | Timestamp |
**Rationale**: Append only. Never deleted. Auditors read this to trace every change back to a person and timestamp.

## Model: UnitConversion
| Field | Type / Notes |
| :--- | :--- |
| id | Integer PK |
| from_unit | VARCHAR e.g. 'MWh', 'litres', 'US gallons' |
| to_unit | VARCHAR e.g. 'kWh', 'kg' |
| factor | Decimal(20,10) |
| commodity | Nullable — 'diesel', 'natural_gas' for density conversions |
**Rationale**: Lookup table for all unit conversions. Seeded from DEFRA/IPCC tables. New units added here, not hardcoded.

## Model: PlantCodeLookup
| Field | Type / Notes |
| :--- | :--- |
| id | Integer PK |
| tenant | FK → Tenant |
| plant_code | VARCHAR — SAP plant code |
| plant_name | VARCHAR |
| country | ISO 3166-1 alpha-2 |
| region | VARCHAR |
| grid_emission_factor | Decimal for Scope 2 if applicable |
**Rationale**: Maps opaque SAP plant codes to real locations. Tenant specific because plant codes are client-specific.
