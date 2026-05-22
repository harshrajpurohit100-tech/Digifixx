export type ClientStatus = "active" | "paused" | "archived";

export type LandingPageStatus = "draft" | "active" | "paused" | "archived";

export type LandingPageTemplate =
  | "telegram_join"
  | "whatsapp_lead"
  | "simple_lead_form"
  | "custom_basic";

export type TrackingEventName =
  | "PageView"
  | "ViewContent"
  | "Lead"
  | "Contact"
  | "Subscribe"
  | "CompleteRegistration"
  | "ButtonClick"
  | "FormSubmit"
  | "Custom";

export type CapiDeliveryStatus =
  | "not_sent"
  | "pending"
  | "sent"
  | "failed"
  | "skipped";

export type TrafficType = "human" | "bot" | "system" | "unknown";

export type AnalyticsDatePreset =
  | "today"
  | "yesterday"
  | "last7"
  | "last30"
  | "thisMonth"
  | "lastMonth"
  | "custom";

export type AnalyticsEventFilter =
  | "all"
  | "PageView"
  | "Lead"
  | "Purchase"
  | "CompleteRegistration"
  | "custom";

export type AnalyticsPagination = {
  page: number;
  pageSize: 50 | 100 | 200;
  total: number;
  totalPages: number;
  from: number;
  to: number;
};

export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "rejected"
  | "converted";

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "archive"
  | "publish"
  | "pause"
  | "regenerate_code"
  | "login"
  | "logout"
  | "config_change"
  | "token_update";

export type JsonRecord = Record<string, unknown>;

export type Client = {
  id: string;
  name: string;
  internal_code: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  status: ClientStatus;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type LandingPage = {
  id: string;
  client_id: string;
  internal_name: string;
  public_code: string;
  template: LandingPageTemplate;
  status: LandingPageStatus;
  page_title: string | null;
  headline: string;
  subheadline: string | null;
  description: string | null;
  primary_button_text: string;
  primary_button_url: string;
  secondary_button_text: string | null;
  secondary_button_url: string | null;
  disclaimer: string | null;
  background_style: string;
  custom_css: string | null;
  default_event_name: TrackingEventName;
  utm_source_default: string | null;
  utm_campaign_default: string | null;
  channel_name: string | null;
  logo_url: string | null;
  logo_path: string | null;
  subscriber_count: number | null;
  top_notice_text: string;
  support_line_1: string | null;
  support_line_2: string | null;
  urgency_text: string | null;
  is_countdown_enabled: boolean;
  countdown_seconds: number;
  footer_note: string | null;
  maintained_by_text: string | null;
  cta_button_text: string;
  published_at: string | null;
  archived_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type SafeMetaTrackingProfile = Omit<
  MetaTrackingProfile,
  "capi_access_token_encrypted"
>;

export type LandingPageWithClientAndTracking = LandingPage & {
  client: Pick<Client, "id" | "name"> | null;
  tracking_profile: Pick<
    SafeMetaTrackingProfile,
    | "id"
    | "pixel_id"
    | "capi_token_last4"
    | "is_active"
    | "test_event_code"
    | "default_click_event"
  > | null;
};

export type PublicLandingPage = Pick<
  LandingPage,
  | "id"
  | "client_id"
  | "public_code"
  | "page_title"
  | "channel_name"
  | "logo_url"
  | "subscriber_count"
  | "top_notice_text"
  | "support_line_1"
  | "support_line_2"
  | "urgency_text"
  | "is_countdown_enabled"
  | "countdown_seconds"
  | "footer_note"
  | "maintained_by_text"
  | "cta_button_text"
  | "primary_button_url"
  | "disclaimer"
  | "status"
  | "updated_at"
> & {
  tracking?: {
    pixel_id: string;
    default_pageview_event: TrackingEventName;
    default_click_event: TrackingEventName;
  } | null;
};

export type MetaTrackingProfile = {
  id: string;
  client_id: string;
  landing_page_id: string | null;
  profile_name: string;
  meta_business_id: string | null;
  meta_ad_account_id: string | null;
  pixel_id: string;
  capi_access_token_encrypted: string | null;
  capi_token_last4: string | null;
  test_event_code: string | null;
  default_pageview_event: TrackingEventName;
  default_click_event: TrackingEventName;
  is_active: boolean;
  last_verified_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type VisitorSession = {
  id: string;
  landing_page_id: string;
  visitor_id: string;
  session_id: string;
  ip_hash: string | null;
  user_agent: string | null;
  browser: string | null;
  os: string | null;
  device_type: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  referrer: string | null;
  first_utm_source: string | null;
  first_utm_medium: string | null;
  first_utm_campaign: string | null;
  first_utm_content: string | null;
  first_utm_term: string | null;
  first_seen_at: string;
  last_seen_at: string;
};

export type TrackingEvent = {
  id: string;
  client_id: string | null;
  landing_page_id: string;
  visitor_session_id: string | null;
  event_name: TrackingEventName;
  custom_event_name: string | null;
  event_id: string;
  event_source_url: string | null;
  action_source: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  utm_adset: string | null;
  utm_ad: string | null;
  referrer: string | null;
  ip_hash: string | null;
  user_agent: string | null;
  browser: string | null;
  os: string | null;
  device_type: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  meta_pixel_id: string | null;
  capi_delivery_status: CapiDeliveryStatus;
  capi_response: JsonRecord | null;
  capi_error: string | null;
  capi_sent_at: string | null;
  traffic_type: TrafficType;
  is_bot: boolean;
  bot_reason: string | null;
  metadata: JsonRecord;
  created_at: string;
};

export type Lead = {
  id: string;
  client_id: string | null;
  landing_page_id: string;
  visitor_session_id: string | null;
  tracking_event_id: string | null;
  status: LeadStatus;
  name: string | null;
  email: string | null;
  phone: string | null;
  message: string | null;
  form_data: JsonRecord;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  referrer: string | null;
  created_at: string;
  updated_at: string;
};

export type AuditLog = {
  id: string;
  actor_user_id: string | null;
  actor_email: string | null;
  action: AuditAction;
  entity_type: string;
  entity_id: string | null;
  entity_label: string | null;
  old_values: JsonRecord | null;
  new_values: JsonRecord | null;
  metadata: JsonRecord;
  ip_hash: string | null;
  user_agent: string | null;
  created_at: string;
};

export type LandingPageAnalyticsSummary = {
  totalVisits: number;
  totalConversions: number;
  uniqueVisitors: number;
  conversionRate: number;
  todayVisits: number;
  todayConversions: number;
};

export type TopLandingPageAnalytics = {
  id: string;
  public_code: string;
  internal_name: string;
  channel_name: string | null;
  visits: number;
  conversions: number;
  conversionRate: number;
};

export type RecentTrackingEvent = {
  id: string;
  event_name: string;
  public_code: string;
  internal_name: string;
  channel_name: string | null;
  device_type: string | null;
  utm_source: string | null;
  created_at: string;
  capi_delivery_status: CapiDeliveryStatus;
  traffic_type: TrafficType;
};

export type AnalyticsOverview = {
  totalVisits: number;
  totalConversions: number;
  uniqueVisitors: number;
  conversionRate: number;
  topLandingPages: TopLandingPageAnalytics[];
  recentEvents: RecentTrackingEvent[];
};

export type AnalyticsLandingPageSelectorItem = {
  id: string;
  public_code: string;
  channel_name: string | null;
  internal_name: string;
  status: LandingPageStatus;
};

export type AnalyticsSourceBreakdown = {
  source: string;
  visits: number;
  conversions: number;
};

export type AnalyticsDeviceBreakdown = {
  device_type: string;
  visits: number;
  conversions: number;
};

export type AnalyticsEventBreakdown = {
  event_name: string;
  count: number;
};

export type DetailedRecentTrackingEvent = {
  id: string;
  event_name: string;
  event_id: string;
  device_type: string | null;
  browser: string | null;
  utm_source: string | null;
  referrer: string | null;
  created_at: string;
  capi_delivery_status: CapiDeliveryStatus;
  traffic_type: TrafficType;
  bot_reason: string | null;
  landing_page_id: string;
  landing_page_public_code: string | null;
  landing_page_name: string | null;
  visitor_id: string | null;
  session_id: string | null;
};

export type TrafficQuality = {
  humanVisits: number;
  botVisits: number;
  systemVisits: number;
  unknownVisits: number;
  rawVisits: number;
  humanConversions: number;
  botConversions: number;
  systemConversions: number;
  unknownConversions: number;
};

export type LandingPageAnalyticsDetail = {
  summary: LandingPageAnalyticsSummary;
  trafficQuality: TrafficQuality;
  sourceBreakdown: AnalyticsSourceBreakdown[];
  deviceBreakdown: AnalyticsDeviceBreakdown[];
  eventBreakdown: AnalyticsEventBreakdown[];
};

export type AnalyticsEventExplorer = {
  events: DetailedRecentTrackingEvent[];
  pagination: AnalyticsPagination;
};
