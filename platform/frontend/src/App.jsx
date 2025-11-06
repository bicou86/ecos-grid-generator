import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Layouts
import MainLayout from '@/layouts/MainLayout';
import DashboardLayout from '@/layouts/DashboardLayout';

// Pages
import HomePage from '@/pages/HomePage';
import CatalogPage from '@/pages/CatalogPage';
import CaseDetailPage from '@/pages/CaseDetailPage';
import CaseViewerPage from '@/pages/CaseViewerPage';
import FichesListPage from '@/pages/FichesListPage';
import FicheDetailPage from '@/pages/FicheDetailPage';
import DebugPage from '@/pages/DebugPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import ProgressPage from '@/pages/dashboard/ProgressPage';
import BookmarksPage from '@/pages/dashboard/BookmarksPage';
import StatisticsPage from '@/pages/dashboard/StatisticsPage';
import SubscriptionPage from '@/pages/SubscriptionPage';
import GeneratePage from '@/pages/GeneratePage';
import AboutPage from '@/pages/AboutPage';
import PricingPage from '@/pages/PricingPage';
import NotFoundPage from '@/pages/NotFoundPage';

// Stations SSP Pages
import StationsLaunchpad from '@/pages/stations/StationsLaunchpad';
import StationsListPage from '@/pages/stations/StationsListPage';
import CircuitsListPage from '@/pages/stations/CircuitsListPage';
import CircuitDetailPage from '@/pages/stations/CircuitDetailPage';
import CategoryStationsPage from '@/pages/stations/CategoryStationsPage';

// Guides Pratiques Pages
import GuidesLaunchpad from '@/pages/guides/GuidesLaunchpad';

// Cas Cliniques Pages
import CasesLaunchpad from '@/pages/cases/CasesLaunchpad';

// Protected Route
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Stripe initialization
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Elements stripe={stripePromise}>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/catalog" element={<CatalogPage />} />
              <Route path="/cases/:slug" element={<CaseDetailPage />} />
              <Route path="/fiches" element={<FichesListPage />} />
              <Route path="/fiches/:slug" element={<FicheDetailPage />} />

              {/* Stations SSP Routes */}
              <Route path="/stations" element={<StationsLaunchpad />} />
              <Route path="/stations/list" element={<StationsListPage />} />
              <Route path="/stations/categories" element={<StationsListPage />} />
              <Route path="/stations/category/:id" element={<CategoryStationsPage />} />
              <Route path="/stations/circuits" element={<CircuitsListPage />} />
              <Route path="/stations/circuit/:id" element={<CircuitDetailPage />} />

              {/* Guides Pratiques Routes */}
              <Route path="/guides" element={<GuidesLaunchpad />} />

              {/* Cas Cliniques Routes */}
              <Route path="/cases" element={<CasesLaunchpad />} />

              <Route path="/debug" element={<DebugPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/case/:id/view" element={<CaseViewerPage />} />
              <Route path="/generate" element={<GeneratePage />} />

              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/dashboard/progress" element={<ProgressPage />} />
                <Route path="/dashboard/bookmarks" element={<BookmarksPage />} />
                <Route path="/dashboard/statistics" element={<StatisticsPage />} />
                <Route path="/subscription" element={<SubscriptionPage />} />
              </Route>
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>

        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </Elements>
    </QueryClientProvider>
  );
}

export default App;
