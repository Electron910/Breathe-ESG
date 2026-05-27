# TRADEOFFS

## Celery / Async Processing
**Why not built:** Adds Redis, Celery workers, task monitoring, doubles deployment complexity and adds 4+ hours of setup. Synchronous parsing handles files up to ~50k rows in under 5 seconds.
**When it matters:** Client uploads 500k row SAP export. Request times out at 30s (Render default). Fix: Add Celery + Redis, return a job ID from the upload endpoint, poll for completion.

## Market Based Scope 2
**Why not built:** Requires REC/REGO/GO certificate data, a separate ingestion source. The client hasn't indicated they have this. Location based is always calculable and appropriate as a baseline.
**When it matters:** Client has renewable PPAs and wants to report a lower Scope 2 figure. Fix: Add a Certificate ingestion source, build market based calculation alongside location based.

## Live API Connectors (SAP OData, Concur OAuth, Green Button)
**Why not built:** Each requires client side credentials, API whitelisting and token refresh logic. This is 2+ days of work per connector. Demonstrating that the data model and parsing logic handles realistic shapes is more valuable at prototype stage.
**When it matters:** Client wants automated monthly data pulls without manual CSV exports. Fix: DataSource.config JSONField is already designed to store credentials. Add connector classes inheriting from BaseConnector, scheduled via Django Q or Celery Beat.
