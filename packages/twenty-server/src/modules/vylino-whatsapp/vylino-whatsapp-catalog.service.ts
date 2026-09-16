import { Injectable } from '@nestjs/common';

const DEFAULT_SERVICES = [
  {
    serviceKey: 'website-development',
    name: 'Business Website Development',
    category: 'Website Development',
    shortDescription:
      'Professional business websites, WordPress builds, landing pages and redesigns.',
    keywords:
      'website,wordpress,business website,landing page,website redesign,web development',
    isActive: true,
    paymentRequired: true,
    priority: 100,
  },
  {
    serviceKey: 'ecommerce-development',
    name: 'Ecommerce Website Development',
    category: 'Ecommerce',
    shortDescription:
      'Online stores using Shopify, WooCommerce or a suitable ecommerce stack.',
    keywords:
      'ecommerce,e-commerce,online store,shopify,woocommerce,store website',
    isActive: true,
    paymentRequired: true,
    priority: 95,
  },
  {
    serviceKey: 'seo-services',
    name: 'SEO Services',
    category: 'SEO',
    shortDescription:
      'SEO strategy, on-page optimisation, local SEO and organic growth support.',
    keywords:
      'seo,ranking,google ranking,organic traffic,search engine,local seo',
    isActive: true,
    paymentRequired: true,
    priority: 90,
  },
  {
    serviceKey: 'digital-marketing',
    name: 'Digital Marketing Services',
    category: 'Digital Marketing',
    shortDescription:
      'Integrated digital marketing for lead generation, content and growth.',
    keywords:
      'digital marketing,online marketing,social media marketing,lead generation,content marketing',
    isActive: true,
    paymentRequired: true,
    priority: 85,
  },
  {
    serviceKey: 'google-meta-ads',
    name: 'Google & Meta Ads Management',
    category: 'Paid Advertising',
    shortDescription:
      'Google Ads and Meta Ads campaign setup, optimisation and reporting.',
    keywords:
      'google ads,meta ads,facebook ads,instagram ads,ppc,paid ads,advertising',
    isActive: true,
    paymentRequired: true,
    priority: 80,
  },
  {
    serviceKey: 'website-maintenance',
    name: 'Website Maintenance & Support',
    category: 'Support',
    shortDescription:
      'Website updates, fixes, maintenance and ongoing technical support.',
    keywords:
      'website maintenance,website support,website issue,wordpress support,website fix',
    isActive: true,
    paymentRequired: true,
    priority: 70,
  },
] as const;

type GraphQlResponse<T> = {
  data?: T;
  errors?: Array<{ message?: string }>;
};

type ExistingCatalogResponse = {
  vylinoServiceCatalogItems?: {
    edges?: Array<{ node?: { id?: string; serviceKey?: string } }>;
  };
};

type CreateCatalogResponse = {
  createVylinoServiceCatalogItem?: { id?: string; serviceKey?: string };
};

@Injectable()
export class VylinoWhatsAppCatalogService {
  private get config() {
    const graphqlUrl = process.env.VYLINO_TWENTY_GRAPHQL_URL;
    const apiKey = process.env.VYLINO_TWENTY_API_KEY;
    if (!graphqlUrl || !apiKey) {
      throw new Error('Vylino Twenty GraphQL persistence is not configured');
    }
    return { graphqlUrl, apiKey };
  }

  private async request<T>(query: string, variables: Record<string, unknown>) {
    const { graphqlUrl, apiKey } = this.config;
    const response = await fetch(graphqlUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ query, variables }),
      signal: AbortSignal.timeout(30_000),
    });
    const payload = (await response.json()) as GraphQlResponse<T>;
    if (!response.ok || payload.errors?.length || !payload.data) {
      const message = payload.errors
        ?.map((error) => error.message)
        .filter(Boolean)
        .join('; ');
      throw new Error(
        message || `Twenty GraphQL request failed: ${response.status}`,
      );
    }
    return payload.data;
  }

  async seedDefaults() {
    const created: string[] = [];
    const existing: string[] = [];

    for (const item of DEFAULT_SERVICES) {
      const found = await this.request<ExistingCatalogResponse>(
        `query FindVylinoServiceCatalogItem($serviceKey: String!) {
          vylinoServiceCatalogItems(
            filter: { serviceKey: { eq: $serviceKey } }
            first: 1
          ) { edges { node { id serviceKey } } }
        }`,
        { serviceKey: item.serviceKey },
      );
      if (found.vylinoServiceCatalogItems?.edges?.[0]?.node?.id) {
        existing.push(item.serviceKey);
        continue;
      }

      const result = await this.request<CreateCatalogResponse>(
        `mutation CreateVylinoServiceCatalogItem($data: VylinoServiceCatalogItemCreateInput!) {
          createVylinoServiceCatalogItem(data: $data) { id serviceKey }
        }`,
        { data: item },
      );
      if (result.createVylinoServiceCatalogItem?.id) {
        created.push(item.serviceKey);
      }
    }

    return { created, existing };
  }
}
