import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { BatchResponse, MessagingDevicesResponse, MessagingPayload } from 'firebase-admin/messaging';

interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

@Injectable()
export class FCMService {
  constructor(private configService: ConfigService) {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: this.configService.get('FIREBASE_PROJECT_ID'),
          clientEmail: this.configService.get('FIREBASE_CLIENT_EMAIL'),
          privateKey: this.configService.get('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
        }),
      });
    }
  }

  async sendPushNotification(token: string, notification: NotificationPayload): Promise<void> {
    try {
      const message: MessagingPayload = {
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: notification.data,
      };

      const response: MessagingDevicesResponse = await admin.messaging().sendToDevice(token, message, {
        priority: 'high',
        timeToLive: 60 * 60 * 24, // 24 hours
      });

      if (response.failureCount > 0) {
        const error = response.results[0].error;
        if (error?.code === 'messaging/invalid-registration-token' ||
            error?.code === 'messaging/registration-token-not-registered') {
          throw new Error('INVALID_TOKEN');
        }
        throw error;
      }
    } catch (error) {
      console.error('Push notification error:', error);
      throw error;
    }
  }

  async sendMulticast(tokens: string[], notification: NotificationPayload): Promise<void> {
    if (!tokens.length) return;

    try {
      const messages = tokens.map(token => ({
        token,
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: notification.data,
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            clickAction: 'FLUTTER_NOTIFICATION_CLICK',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      }));

      const batchResponse: BatchResponse = await admin.messaging().sendAll(messages);

      // Handle failed tokens
      if (batchResponse.failureCount > 0) {
        const failedTokens: string[] = batchResponse.responses
          .map((resp, idx): string | null => {
            return resp.success ? null : tokens[idx];
          })
          .filter((token): token is string => token !== null);

        // Remove invalid tokens
        if (failedTokens.length > 0) {
          await this.removeInvalidTokens(failedTokens);
        }
      }
    } catch (error) {
      console.error('Multicast push notification error:', error);
      throw error;
    }
  }

  private async removeInvalidTokens(tokens: string[]): Promise<void> {
    // Implementation will be handled by the NotificationsService
    // This is just a placeholder for the interface
    console.log('Removing invalid tokens:', tokens);
  }
}