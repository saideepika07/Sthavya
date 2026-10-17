import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { getCurrentUser, onAuthStateChanged, type SthavyaUser } from "./services/auth";

// Dedicated Pages
import LandingPage from "./pages/LandingPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import RequirementsWizardPage from "./pages/RequirementsWizardPage";
import BlueprintResultPage from "./pages/BlueprintResultPage";

/**
 * ProtectedRoute: Enforces authentication. Logged-out users are redirected to /login.
 */
function ProtectedRoute({
  user,
  loading,
  children,
}: {
  user: SthavyaUser | null;
  loading: boolean;
  children: React.ReactNode;
}) {
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F3ED] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white border border-[#181614]/10 shadow-lg flex items-center justify-center mb-4">
          <svg className="animate-spin h-8 w-8 text-[#B88555]" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        </div>
        <p className="text-xs font-mono font-bold uppercase tracking-widest text-[#7A7268]">
          Verifying STHAVYA Session...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

/**
 * PublicOnlyRoute: Logged-in users who open / or /login or /register are redirected to /dashboard.
 */
function PublicOnlyRoute({
  user,
  loading,
  children,
}: {
  user: SthavyaUser | null;
  loading: boolean;
  children: React.ReactNode;
}) {
  if (loading) {
    return null;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  const [user, setUser] = useState<SthavyaUser | null>(getCurrentUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial check and subscription to auth state changes
    const unsubscribe = onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing: Logged-in users redirected to /dashboard */}
        <Route
          path="/"
          element={
            <PublicOnlyRoute user={user} loading={loading}>
              <LandingPage />
            </PublicOnlyRoute>
          }
        />

        {/* Public Register: Logged-in users redirected to /dashboard */}
        <Route
          path="/register"
          element={
            <PublicOnlyRoute user={user} loading={loading}>
              <RegisterPage />
            </PublicOnlyRoute>
          }
        />

        {/* Public Login: Logged-in users redirected to /dashboard */}
        <Route
          path="/login"
          element={
            <PublicOnlyRoute user={user} loading={loading}>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />

        {/* Protected Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user} loading={loading}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Protected Requirements Wizard */}
        <Route
          path="/plan/new"
          element={
            <ProtectedRoute user={user} loading={loading}>
              <RequirementsWizardPage />
            </ProtectedRoute>
          }
        />

        {/* Protected Blueprint Result & Download */}
        <Route
          path="/plan/:id"
          element={
            <ProtectedRoute user={user} loading={loading}>
              <BlueprintResultPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback Catch-All */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
