import React from 'react';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AppRoutes from './routes';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 to-indigo-50">
        <Navbar />
        <main className="flex-grow">
          <AppRoutes />
        </main>
        <Footer />
        <Toaster position="top-right" />
      </div>
    </ErrorBoundary>
  );
}

export default App;