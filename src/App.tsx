import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import AdminAddPlotPage from './admin/AdminAddPlotPage';
import AdminAnalyticsPage from './admin/AdminAnalyticsPage';
import AdminDashboardOverview from './admin/AdminDashboardOverview';
import AdminLayout from './admin/AdminLayout';
import AdminLoginPage from './admin/AdminLoginPage';
import AdminManagePlotsPage from './admin/AdminManagePlotsPage';
import AdminOrdersPage from './admin/AdminOrdersPage';
import AdminSettingsPage from './admin/AdminSettingsPage';
import { AuthProvider } from './context/AuthContext';
import PublicLayout from './layouts/PublicLayout';
import ContactPage from './pages/ContactPage';
import HomePage from './pages/HomePage';
import {
  AboutPage,
  BlocksPage,
  FacilitiesPage,
  LocationPage,
  MasterPlanPage,
} from './pages/InfoPages';
import {
  AnnouncementsPage,
  GalleryPage,
  UpdatesPage,
} from './pages/MediaPages';
import PlotDetailPage from './pages/PlotDetailPage';
import PlotsPage from './pages/PlotsPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Public Housing Colony Website */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/plots" element={<PlotsPage />} />
            <Route path="/plots/:id" element={<PlotDetailPage />} />
            <Route path="/facilities" element={<FacilitiesPage />} />
            <Route path="/location" element={<LocationPage />} />
            <Route path="/master-plan" element={<MasterPlanPage />} />
            <Route path="/blocks" element={<BlocksPage />} />
            <Route path="/updates" element={<UpdatesPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/announcements" element={<AnnouncementsPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Route>

          {/* Separate Admin Dashboard */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardOverview />} />
            <Route path="add-plot" element={<AdminAddPlotPage />} />
            <Route path="manage-plots" element={<AdminManagePlotsPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
