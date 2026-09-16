export const GOOGLE_ADS_ACCOUNT_QUERY = `
  SELECT
    customer.id,
    customer.descriptive_name,
    customer.currency_code,
    customer.time_zone,
    customer.manager,
    customer.test_account
  FROM customer
`;

export const GOOGLE_ADS_CAMPAIGN_QUERY = `
  SELECT
    campaign.id,
    campaign.name,
    campaign.status,
    campaign.advertising_channel_type,
    campaign.start_date,
    campaign.end_date
  FROM campaign
  WHERE campaign.status != 'REMOVED'
`;

export const buildGoogleAdsDailyMetricsQuery = (
  startDate: string,
  endDate: string,
) => `
  SELECT
    campaign.id,
    segments.date,
    metrics.impressions,
    metrics.clicks,
    metrics.cost_micros,
    metrics.conversions,
    metrics.conversions_value
  FROM campaign
  WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
`;
