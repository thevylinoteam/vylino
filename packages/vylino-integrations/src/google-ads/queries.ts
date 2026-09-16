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

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const assertIsoDate = (value: string, label: string) => {
  if (!ISO_DATE_PATTERN.test(value)) {
    throw new Error(`${label} must use YYYY-MM-DD format.`);
  }

  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    throw new Error(`${label} is not a valid calendar date.`);
  }
};

export const buildGoogleAdsDailyMetricsQuery = (
  startDate: string,
  endDate: string,
) => {
  assertIsoDate(startDate, 'Google Ads start date');
  assertIsoDate(endDate, 'Google Ads end date');

  if (startDate > endDate) {
    throw new Error('Google Ads start date must not be after end date.');
  }

  return `
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
};
