import { Routes, Route } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";

import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";

import Dashboard from "../pages/Dashboard/Dashboard";
import Papers from "../pages/Papers/Papers";
import Analysis from "../pages/Analysis/Analysis";
import Workspace from "../pages/Workspace/Workspace";
import Compare from "../pages/Compare/Compare";

function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900">
          ResearchFlow AI
        </h1>

        <p className="mt-3 text-slate-500">
          AI-powered research paper analysis
        </p>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>

      {/* Public Routes */}

      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
      </Route>


      {/* Authentication Routes */}

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>


      {/* Application Routes */}

      <Route element={<DashboardLayout />}>

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/papers"
          element={<Papers />}
        />

        <Route
          path="/analysis"
          element={<Analysis />}
        />

        <Route
          path="/workspace"
          element={<Workspace />}
        />

        <Route
          path="/compare"
          element={<Compare />}
        />

      </Route>

    </Routes>
  );
}

export default AppRoutes;