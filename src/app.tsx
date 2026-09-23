import { Routes, Route } from 'react-router-dom';
import { AppProvider } from '@/store/AppProvider';
import LoginPage from '@/pages/Login/LoginPage';
import RegisterPage from './pages/Login/RegisterPage';
import ElderlyLayout from '@/pages/elderly/ElderlyLayout';
import AssistantPage from '@/pages/elderly/AssistantPage';
import HomestaysPage from '@/pages/elderly/HomestaysPage';
import HealthPage from '@/pages/elderly/HealthPage';
import MePage from '@/pages/elderly/MePage';
import HomestayDetailPage from '@/pages/elderly/HomestayDetailPage';
import FamilyLayout from '@/pages/family/FamilyLayout';
import FamilyOverview from '@/pages/family/FamilyOverview';
import FamilyTrips from '@/pages/family/FamilyTrips';
import FamilyHealth from '@/pages/family/FamilyHealth';
import FamilyAlerts from '@/pages/family/FamilyAlerts';
import FamilyBook from '@/pages/family/FamilyBook';
import AdminLayout from '@/pages/admin/AdminLayout';
import DashboardPage from '@/pages/admin/DashboardPage';
import UsersAdminPage from '@/pages/admin/UsersAdminPage';
import HomestaysAdminPage from '@/pages/admin/HomestaysAdminPage';
import BookingsAdminPage from '@/pages/admin/BookingsAdminPage';
import TagsAdminPage from '@/pages/admin/TagsAdminPage';
import NoticesAdminPage from '@/pages/admin/NoticesAdminPage';
import NotFoundPage from '@/pages/NotFoundPage/NotFoundPage';

export default function App() {
  return (
    <AppProvider>
            <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/elder" element={<ElderlyLayout />}>
          <Route index element={<AssistantPage />} />
          <Route path="homestays" element={<HomestaysPage />} />
          <Route path="homestays/:id" element={<HomestayDetailPage />} />
          <Route path="health" element={<HealthPage />} />
          <Route path="me" element={<MePage />} />
        </Route>

        <Route path="/elderly" element={<ElderlyLayout />}>
          <Route index element={<AssistantPage />} />
          <Route path="homestays/:id" element={<HomestayDetailPage />} />
          <Route path="homestays" element={<HomestaysPage />} />
          <Route path="health" element={<HealthPage />} />
          <Route path="me" element={<MePage />} />
        </Route>

        <Route path="/family" element={<FamilyLayout />}>
          <Route index element={<FamilyOverview />} />
          <Route path="trips" element={<FamilyTrips />} />
          <Route path="health" element={<FamilyHealth />} />
          <Route path="alerts" element={<FamilyAlerts />} />
          <Route path="book" element={<FamilyBook />} />
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="users" element={<UsersAdminPage />} />
          <Route path="homestays" element={<HomestaysAdminPage />} />
          <Route path="bookings" element={<BookingsAdminPage />} />
          <Route path="tags" element={<TagsAdminPage />} />
          <Route path="notices" element={<NoticesAdminPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>

        
    </AppProvider>
  );
}
