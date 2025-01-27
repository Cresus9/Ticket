import React from 'react';

export function mapNotificationToDisplayType(type: string): string {
  switch (type) {
    case 'SUCCESS':
      return 'success';
    case 'ERROR':
      return 'error';
    case 'WARNING':
      return 'warning';
    case 'INFO':
    default:
      return 'info';
  }
}

export function getNotificationIcon(type: string): string {
  switch (type) {
    case 'SUCCESS':
      return 'check-circle';
    case 'ERROR':
      return 'alert-circle';
    case 'WARNING':
      return 'alert-triangle';
    case 'INFO':
    default:
      return 'info';
  }
}