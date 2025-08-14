import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ErrorBoundary from './components/ui/ErrorBoundary';
import AuthPage from './pages/AuthPage';
import DashboardLayout from './components/layout/DashboardLayout';

import DashboardPage from './pages/DashboardPage'; 
import UsersPage from './pages/UsersPage'; 
import RolesPage from './pages/RolesPage';
import CleaningPage from './pages/CleaningPage';
import CasePaperPage from './pages/CasePaperPage';
import MenuPage from './pages/MenuPage';
import FeedingRecordPage from './pages/FeedingRecordPage';
import MediaPage from './pages/MediaPage';
import InventoryPage from './pages/InventoryPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import SettingsPage from './pages/SettingsPage';
import SimpleAuthPage from './pages/SimpleAuthPage';
import PermanentAnimalsPage from './pages/PermanentAnimalsPage';
import MaintenancePage from './pages/MaintenancePage';
import SpecialEventsMediaPage from './pages/SpecialEventsMediaPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary-500"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        
        {/* Root redirect based on authentication */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
          } 
        />
        
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Routes>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/users" element={<UsersPage />} />
                  <Route path="/roles" element={<RolesPage />} />
                  <Route path="/casepaper" element={<CasePaperPage />} />
                  <Route path="/menu" element={<MenuPage />} />
                  <Route path="/feedingrecord" element={<FeedingRecordPage />} />
                  <Route path="/cleaning" element={<CleaningPage />} />
                  <Route path="/media" element={<MediaPage />} />
                  <Route path="/specialevents" element={<SpecialEventsMediaPage />} />
                  <Route path="/inventory" element={<InventoryPage />} />
                  <Route path="/maintenance" element={<MaintenancePage />} />
                  <Route path="/permanentanimals" element={<PermanentAnimalsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/changepassword" element={<ChangePasswordPage />} />
                </Routes>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;