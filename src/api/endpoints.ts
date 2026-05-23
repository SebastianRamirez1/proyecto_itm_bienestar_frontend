// Auth
export const EP_AUTH_REGISTER   = '/auth/register';
export const EP_AUTH_LOGIN      = '/auth/login';
export const EP_AUTH_LOGOUT     = '/auth/logout';
export const EP_AUTH_REFRESH    = '/auth/refresh';
export const EP_AUTH_PROFILE    = '/auth/profile';

// Health
export const EP_HEALTH_SCHEDULE    = '/health/schedule';
export const EP_HEALTH_EMERGENCY   = '/health/emergency';        // was /health/emergency-contacts
export const EP_HEALTH_RESOURCES   = '/health/resources';
export const EP_HEALTH_TIPS        = '/health/tips';
export const EP_HEALTH_APPOINTMENT = '/health/appointment';

// Library (was incorrectly named 'resources')
export const EP_LIBRARY_BOOKS      = '/library/books';
export const EP_LIBRARY_BOOK_BY_ID = (id: string) => `/library/books/${id}`;
export const EP_LIBRARY_ROOMS      = '/library/rooms';
export const EP_LIBRARY_SCHEDULE   = '/library/schedule';
export const EP_LIBRARY_RESERVE    = '/library/rooms/reserve';

// Alerts
export const EP_ALERTS             = '/alerts';
export const EP_ALERT_BY_ID        = (id: string) => `/alerts/${id}`;

// Cafeteria
export const EP_CAFETERIA_MENU     = '/cafeteria/menu';
export const EP_CAFETERIA_SCHEDULE = '/cafeteria/schedule';
export const EP_CAFETERIA_PRICES   = '/cafeteria/prices';

// Events
export const EP_EVENTS             = '/events';
export const EP_EVENTS_UPCOMING    = '/events/upcoming';
export const EP_EVENT_BY_ID        = (id: string) => `/events/${id}`;
export const EP_EVENT_REGISTER     = (id: string) => `/events/${id}/register`; // was /enroll

// Webhooks
export const EP_WEBHOOKS           = '/webhooks';
export const EP_WEBHOOK_BY_ID      = (id: string) => `/webhooks/${id}`;

// Metrics (admin)
export const EP_METRICS            = '/metrics';
