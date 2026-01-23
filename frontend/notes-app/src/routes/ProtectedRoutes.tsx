import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import LoadingSpinner from "../components/ui/loading";
import { UserAuth } from "@/hooks/userAuth";

const Dashboard = lazy(() => import("../pages/Dashboard"));
const Editor = lazy(() => import("../pages/Editor"));
const ProfilePage = lazy(() => import("../pages/Profile-Page"));

function ProtectedRoutes() {
  const { user, isLoading } = UserAuth();
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Check if user object exists and has the user property (standard Auth.js session structure)
  if (user && user.user) {
    return (
      <Routes>
        <Route
          path="/dashboard"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <Dashboard />
            </Suspense>
          }
        />
        <Route
          path="/editor/:noteId"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <Editor />
            </Suspense>
          }
        />
        <Route
          path="/profile"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <ProfilePage />
            </Suspense>
          }
        />
      </Routes>
    );
  }

  return <Navigate to="/" />;
}
export default ProtectedRoutes;
