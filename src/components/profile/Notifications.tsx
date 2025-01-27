import React, { useState, useEffect } from 'react';
import { Bell, Mail, AlertCircle, Loader, Settings } from 'lucide-react';
import { notificationService, NotificationPreferences } from '../../services/notificationService';
import toast from 'react-hot-toast';

const NOTIFICATION_TYPES = [
  { id: 'EVENT_REMINDER', label: 'Event Reminders', description: 'Get notified before your events start' },
  { id: 'TICKET_PURCHASED', label: 'Ticket Purchases', description: 'Receive confirmations for ticket purchases' },
  { id: 'PRICE_CHANGE', label: 'Price Changes', description: 'Get notified when event prices change' },
  { id: 'EVENT_CANCELLED', label: 'Event Cancellations', description: 'Be informed if an event is cancelled' },
  { id: 'EVENT_UPDATED', label: 'Event Updates', description: 'Receive updates about events you are attending' }
];

export default function Notifications() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    loadPreferences();
    checkPushPermission();
  }, []);

  const checkPushPermission = () => {
    if ('Notification' in window) {
      setPushPermission(Notification.permission);
    }
  };

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const prefs = await notificationService.getPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast.error('Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key: 'email' | 'push', value: boolean) => {
    if (!preferences) return;

    try {
      setSaving(true);
      
      if (key === 'push' && value) {
        if (pushPermission === 'denied') {
          toast.error(
            'Push notifications are blocked. Please enable them in your browser settings.',
            { duration: 5000 }
          );
          return;
        }

        const granted = await notificationService.requestPushPermission();
        if (!granted) {
          return;
        }
        setPushPermission('granted');
      }

      const updatedPreferences = {
        ...preferences,
        [key]: value
      };

      await notificationService.updatePreferences(updatedPreferences);
      setPreferences(updatedPreferences);
      toast.success(`${key === 'email' ? 'Email' : 'Push'} notifications ${value ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update notification preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleTypeToggle = async (typeId: string) => {
    if (!preferences) return;

    try {
      setSaving(true);
      const newTypes = preferences.types.includes(typeId)
        ? preferences.types.filter(t => t !== typeId)
        : [...preferences.types, typeId];

      const updatedPreferences = {
        ...preferences,
        types: newTypes
      };

      await notificationService.updatePreferences(updatedPreferences);
      setPreferences(updatedPreferences);
      
      const type = NOTIFICATION_TYPES.find(t => t.id === typeId);
      if (type) {
        toast.success(`${type.label} ${newTypes.includes(typeId) ? 'enabled' : 'disabled'}`);
      }
    } catch (error) {
      console.error('Error updating notification types:', error);
      toast.error('Failed to update notification types');
    } finally {
      setSaving(false);
    }
  };

  const openBrowserSettings = () => {
    if (pushPermission === 'denied') {
      toast.custom((t) => (
        <div className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Enable Push Notifications
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  1. Click the lock icon in your browser's address bar
                  <br />
                  2. Find "Notifications" in the permissions list
                  <br />
                  3. Change the setting to "Allow"
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none"
            >
              Close
            </button>
          </div>
        </div>
      ), { duration: 8000 });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load preferences</h3>
        <button
          onClick={loadPreferences}
          className="text-indigo-600 hover:text-indigo-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Channels</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-600">Receive notifications via email</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('email', !preferences.email)}
              disabled={saving}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.email ? 'bg-indigo-600' : 'bg-gray-200'
              } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.email ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Push Notifications</p>
                <p className="text-sm text-gray-600">
                  Receive notifications in your browser
                  {pushPermission === 'denied' && (
                    <button
                      onClick={openBrowserSettings}
                      className="ml-2 text-indigo-600 hover:text-indigo-700"
                    >
                      <Settings className="h-4 w-4 inline-block" />
                      <span className="ml-1">Enable in browser</span>
                    </button>
                  )}
                </p>
              </div>
            </div>
            {!('Notification' in window) ? (
              <span className="text-sm text-red-600">Not supported in your browser</span>
            ) : (
              <button
                onClick={() => handleToggle('push', !preferences.push)}
                disabled={saving || pushPermission === 'denied'}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.push ? 'bg-indigo-600' : 'bg-gray-200'
                } ${(saving || pushPermission === 'denied') ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.push ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            )}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Types</h2>
        <div className="space-y-4">
          {NOTIFICATION_TYPES.map((type) => (
            <div
              key={type.id}
              className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200"
            >
              <div>
                <p className="font-medium text-gray-900">{type.label}</p>
                <p className="text-sm text-gray-600">{type.description}</p>
              </div>
              <button
                onClick={() => handleTypeToggle(type.id)}
                disabled={saving}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.types.includes(type.id) ? 'bg-indigo-600' : 'bg-gray-200'
                } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.types.includes(type.id) ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}