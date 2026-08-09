import { Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";

import Landing from "../pages/Landing/Landing";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Dashboard from "../pages/Dashboard/Dashboard";
import Papers from "../pages/Papers/Papers";
import Analysis from "../pages/Analysis/Analysis";
import Compare from "../pages/Compare/Compare";
import Workspace from "../pages/Workspace/Workspace";
import Settings from "../pages/Settings/Settings";

function AppRoutes() {
  return (
    <Routes>

      {/* =====================================================
          PUBLIC ROUTES
      ===================================================== */}

      <Route element={<MainLayout />}>
        <Route path="/" element={<Landing />} />
      </Route>


      {/* =====================================================
          AUTH ROUTES
      ===================================================== */}

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>


      {/* =====================================================
          DASHBOARD / APPLICATION ROUTES
      ===================================================== */}

      <Route element={<DashboardLayout />}>

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/papers" element={<Papers />} />

        {/* Individual paper analysis */}
        <Route
          path="/analysis/:paperId"
          element={<Analysis />}
        />

        <Route path="/compare" element={<Compare />} />

        <Route path="/workspace/:paperId" element={<Workspace />} />

        <Route path="/settings" element={<Settings />} />


      </Route>


      {/* =====================================================
          ANALYSIS WITHOUT PAPER ID
          Redirect to My Papers
      ===================================================== */}

      <Route
        path="/analysis"
        element={<Navigate to="/papers" replace />}
      />


      {/* =====================================================
          UNKNOWN ROUTES
      ===================================================== */}

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  );
}

export default AppRoutes;