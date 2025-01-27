import { z } from 'zod';

// Notification Types
export const NotificationTypeEnum = z.enum([
  'INFO',
  'SUCCESS', 
  'WARNING',
  'ERROR'
]);

export type NotificationType = z.infer<typeof NotificationTypeEnum>;

// Notification Schema
export const NotificationSchema = z.object({
  id: z.string(),
  title: z.string(),
  message: z.string(),
  type: NotificationTypeEnum,
  read: z.boolean(),
  createdAt: z.string(),
  metadata: z.record(z.any()).optional()
});

export type INotification = z.infer<typeof NotificationSchema>;

// Notification Preferences Schema
export const NotificationPreferencesSchema = z.object({
  email: z.boolean(),
  push: z.boolean(),
  types: z.array(NotificationTypeEnum)
});

export type INotificationPreferences = z.infer<typeof NotificationPreferencesSchema>;