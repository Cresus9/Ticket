import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { EventProvider } from './context/EventContext';
import { NotificationProvider } from './context/NotificationContext';
import { RealtimeProvider } from './context/RealtimeContext';
import { SecurityProvider } from './context/SecurityContext';
import App from './App';
import './index.css';

// Initialize Supabase client
import './lib/supabase-client';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <EventProvider>
          <NotificationProvider>
            <RealtimeProvider>
              <SecurityProvider>
                <App />
              </SecurityProvider>
            </RealtimeProvider>
          </NotificationProvider>
        </EventProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);