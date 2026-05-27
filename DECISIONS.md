# DECISIONS

## SAP ingestion: flat file CSV over OData / IDoc
OData need live SAP system access, network configuration and SAP BASIS team involvement none of which an onboarding client can provide at first. As I get to know about IDoc it is XML heavy primarily used for system to system EDI, not with third party analytics ingestion. Flat file CSV through SFTP upload is what SAP clients actually use to share data with external tools. 
**DECISION:** Flat file CSV with semicolon as delimiter, supporting both UTF-8 and latin-1 encoding.

## Utility: CSV portal export over PDF or Green Button API
PDF parsing is very sensitive with each utility has a different bill layout, requiring a different parser per supplier and coming to Green Button API, it is US only and requires OAuth setup per utility. CSV portal export is available from all major utilities globally and is what facilities teams actually produce. 
**DECISION:** CSV export, single meter per row format with billing period columns.

## co2e computed at ingest, not at query time
Calculating co2e_kg at ingest and storing it means: 1) audit trail shows what factor is used when, 2) retrospective factor updates don't silently change historical data, 3) queries are fast. Downside: if emission factors are updated, historical records don't auto update but this is correct for audit purposes. 
**DECISION:** Store co2e_kg at ingest. Add emission_factor_source to record. If factors change, create a new batch.

## Location based Scope 2 only (not market based)
Market based Scope 2 requires renewable energy certificate like (REC/REGO/GO) data, which isnn't provided so location based uses the national grid emission factor and works with electricity consumption data alone. 
**DECISION:** Location based Scope 2. Document that market based requires REC data a future enhancement.


## No async task queue (no Celery)
Celery adds Redis, worker processes and deployment complexity. For files of realistic size (< 50k rows), synchronous parsing completes in under 5 seconds. Async would be needed for 500k+ row files. 
**DECISION:** Synchronous parsing in the request. Document Celery as scaling gap.

## Scope classification by material group, not ML
ML classification needs training data and ongoing maintenance. A lookup table keyed by material group code is deterministic, auditable and explainable which matters for audit. 
**DECISION:** Rules based Scope classification via material group lookup. Document edge cases.
