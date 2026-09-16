# Vylino Business OS — Twenty CRM App

This internal Twenty app provisions Vylino CRM metadata on top of Twenty standard objects.

## Person fields

- `leadSource`
- `leadChannel`
- `serviceInterest`
- `leadScore`
- `estimatedValue`
- `nextFollowUp`
- `campaign`
- `landingPage`
- `referrer`
- `utmSource`
- `utmMedium`
- `utmCampaign`
- `utmContent`
- `utmTerm`
- `gclid`
- `fbclid`
- `externalLeadId`
- `firstCapturedAt`

## Opportunity pipeline

The app adds the application-owned `vylinoSalesStage` select field and a Kanban view using these stages:

1. `NEW_LEAD`
2. `CONTACTED`
3. `QUALIFIED`
4. `MEETING`
5. `PROPOSAL_SENT`
6. `NEGOTIATION`
7. `WON`
8. `LOST`

## Provisioning

Use the repository workflow **Provision Vylino CRM App**.

Required workflow input:

- `api_url`: base URL of the target Twenty deployment.

Required repository secret:

- `VYLINO_TWENTY_API_KEY`: API key/access token for the target Twenty workspace.

The workflow performs:

```text
yarn install
yarn lint
yarn twenty app:publish --private --remote vylino
yarn twenty app:install --remote vylino
```

## Lead ingestion activation

The server endpoint is:

```text
POST /rest/vylino/leads/ingest
```

Keep `VYLINO_WRITE_ATTRIBUTION_FIELDS` disabled until this app has installed successfully in the same workspace targeted by `VYLINO_TWENTY_API_KEY`.

After successful installation, deploy the server with:

```text
VYLINO_WRITE_ATTRIBUTION_FIELDS=true
VYLINO_DEFAULT_OPPORTUNITY_STAGE=NEW_LEAD
```

The server-side CRM transport writes the Opportunity stage to `vylinoSalesStage`.

## Safe rollback

If the app is not installed, fails to upgrade, or metadata is unavailable:

1. set `VYLINO_WRITE_ATTRIBUTION_FIELDS=false`;
2. keep the ingestion endpoint active if basic Person/Opportunity creation is still desired;
3. do not remove application-owned fields from an active workspace until exported CRM data has been reviewed.

The ingestion route is deliberately designed so attribution writes can be disabled independently from core Person/Opportunity persistence.
