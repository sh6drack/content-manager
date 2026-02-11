export interface PublishResult {
  nativePostId: string;
  nativePostUrl: string;
}

export interface MediaUploadResult {
  mediaId: string;
}

export interface AnalyticsData {
  impressions: number;
  engagements: number;
  clicks: number;
  likes: number;
  shares: number;
  comments: number;
  reach: number;
}

export interface PlatformAdapter {
  publish(params: {
    content: string;
    accessToken: string;
    mediaIds?: string[];
    mediaUrls?: string[];
    platformAccountId?: string;
  }): Promise<PublishResult>;

  uploadMedia?(params: {
    accessToken: string;
    url: string;
    mimeType: string;
    platformAccountId?: string;
  }): Promise<MediaUploadResult>;

  fetchAnalytics?(params: {
    accessToken: string;
    nativePostId: string;
    platformAccountId?: string;
  }): Promise<AnalyticsData>;
}
