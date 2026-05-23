// Auth
export const EP_AUTH_REGISTER   = '/auth/register';
export const EP_AUTH_LOGIN      = '/auth/login';
export const EP_AUTH_LOGOUT     = '/auth/logout';
export const EP_AUTH_REFRESH    = '/auth/refresh';
export const EP_AUTH_PROFILE    = '/auth/profile';

// Health
export const EP_HEALTH_SCHEDULE    = '/health/schedule';
export const EP_HEALTH_CONTACTS    = '/health/emergency-contacts';
export const EP_HEALTH_APPOINTMENT = '/health/appointment';

// Resources
export const EP_RESOURCES          = '/resources';
export const EP_RESOURCE_BY_ID     = (id: string) => `/resources/${id}`;

// Events
export const EP_EVENTS             = '/events';
export const EP_EVENT_BY_ID        = (id: string) => `/events/${id}`;
export const EP_EVENT_ENROLL       = (id: string) => `/events/${id}/enroll`;

// Webhooks
export const EP_WEBHOOKS           = '/webhooks';
export const EP_WEBHOOK_BY_ID      = (id: string) => `/webhooks/${id}`;

// Metrics (admin)
export const EP_METRICS            = '/metrics';
