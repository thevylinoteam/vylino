export type VylinoSocialPlatform =
  | 'facebook'
  | 'instagram'
  | 'linkedin'
  | 'x'
  | 'youtube'
  | 'threads'
  | 'bluesky'
  | 'mastodon'
  | 'discord'
  | 'other';

export type VylinoSocialPostStatus =
  | 'draft'
  | 'approved'
  | 'scheduled'
  | 'publishing'
  | 'published'
  | 'failed'
  | 'cancelled';

export type VylinoSocialAccount = {
  id: string;
  providerAccountId: string;
  platform: VylinoSocialPlatform;
  displayName: string;
  username?: string;
  profileUrl?: string;
  avatarUrl?: string;
  connected: boolean;
  lastSyncedAt?: string;
};

export type VylinoSocialMediaAsset = {
  id?: string;
  url: string;
  type: 'image' | 'video' | 'document' | 'other';
  altText?: string;
};

export type VylinoSocialPost = {
  id: string;
  providerPostId?: string;
  accountIds: string[];
  text: string;
  media?: VylinoSocialMediaAsset[];
  status: VylinoSocialPostStatus;
  scheduledAt?: string;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  failureReason?: string;
};

export type VylinoSocialPostMetrics = {
  postId: string;
  impressions?: number;
  reach?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  clicks?: number;
  views?: number;
  measuredAt: string;
};

export type VylinoPostizRecord =
  | { kind: 'account'; data: VylinoSocialAccount }
  | { kind: 'post'; data: VylinoSocialPost }
  | { kind: 'metrics'; data: VylinoSocialPostMetrics };
