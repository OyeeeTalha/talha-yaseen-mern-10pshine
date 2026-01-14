import { Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import LoadingSpinner from "../components/ui/loading";

const Dashboard = lazy(() => import("../pages/Dashboard"));
const Editor = lazy(() => import("../pages/Editor"));

function ProtectedRoutes() {
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
    </Routes>
  );
}
export default ProtectedRoutes;
