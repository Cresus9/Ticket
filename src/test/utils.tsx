import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { EventProvider } from '../context/EventContext';
import { NotificationProvider } from '../context/NotificationContext';
import { RealtimeProvider } from '../context/RealtimeContext';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <EventProvider>
          <NotificationProvider>
            <RealtimeProvider>
              {children}
            </RealtimeProvider>
          </NotificationProvider>
        </EventProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };