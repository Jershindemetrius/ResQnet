import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';

/**
 * ResQNet Application Root
 * Protected by AuthProvider (RBAC session & token context)
 * Routed by AppRoutes (Public Portal, Driver MDT Hub, and Admin Center)
 */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
