import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoutes from "./ProtectedRoutes";
import LandingPage from "@/pages/Landing-Page";
import SignInPage from "@/pages/SignIn-Page";
import { UserAuth } from "@/hooks/userAuth";
import LoadingSpinner from "@/components/ui/loading";

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

      <Route path="/*" element={<ProtectedRoutes />} />
    </Routes>
  );
};

export default AppRoutes;
