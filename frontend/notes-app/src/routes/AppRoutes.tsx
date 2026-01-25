import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import ProtectedRoutes from "./ProtectedRoutes";
import LandingPage from "@/pages/Landing-Page";
import SignInPage from "@/pages/SignIn-Page";
import { UserAuth } from "@/hooks/userAuth";
import LoadingSpinner from "@/components/ui/loading";

// Lazy load SharedNotePage
const SharedNotePage = lazy(() => import("@/pages/SharedNotePage"));

const AppRoutes = () => {
  const { user, isLoading } = UserAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      {/* Public Routes: Redirect to dashboard if logged in */}
      <Route
        path="/"
        element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />}
      />
      <Route
        path="/signin"
        element={user ? <Navigate to="/dashboard" replace /> : <SignInPage />}
      />

      {/* Shared note route - requires auth but handled in component */}
      <Route
        path="/s/:shareId"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <SharedNotePage />
          </Suspense>
        }
      />

      <Route path="/*" element={<ProtectedRoutes />} />
    </Routes>
  );
};

export default AppRoutes;
