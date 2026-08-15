import { Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";

import ProtectedRoute from "./ProtectedRoute";

import Landing from "../pages/Landing/Landing";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Dashboard from "../pages/Dashboard/Dashboard";
import Papers from "../pages/Papers/Papers";
import Analysis from "../pages/Analysis/Analysis";
import Compare from "../pages/Compare/Compare";
import Workspace from "../pages/Workspace/Workspace";
import Profile from "../pages/Profile/Profile";
import Settings from "../pages/Settings/Settings";
import Search from "../pages/Search/Search";
import Assistant from "../pages/assistant/Assistant";



function AppRoutes() {

  return (

    <Routes>


      {/* =====================================================
          PUBLIC ROUTES
      ===================================================== */}

      <Route element={<MainLayout />}>

        <Route
          path="/"
          element={<Landing />}
        />

      </Route>


      {/* =====================================================
          AUTH ROUTES
      ===================================================== */}

      <Route element={<AuthLayout />}>

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

      </Route>


      {/* =====================================================
          PROTECTED APPLICATION ROUTES
      ===================================================== */}

      <Route element={<DashboardLayout />}>


        <Route element={<ProtectedRoute />}>

          {/* Dashboard */}

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />


          {/* Papers */}

          <Route
            path="/papers"
            element={<Papers />}
          />


          {/* Individual Paper Analysis */}

          <Route
            path="/analysis/:paperId"
            element={<Analysis />}
          />


          {/* Compare Papers */}

          <Route
            path="/compare"
            element={<Compare />}
          />


          {/* Workspace */}

          <Route
            path="/workspace/:paperId"
            element={<Workspace />}
          />


          {/* Search */}

          <Route
            path="/search"
            element={<Search />}
          />


          {/* AI Research Assistant */}

          <Route
            path="/assistant"
            element={<Assistant />}
          />


          {/* Profile */}

          <Route
            path="/profile"
            element={<Profile />}
          />


          {/* Settings */}

          <Route
            path="/settings"
            element={<Settings />}
          />

        </Route>

      </Route>


      {/* =====================================================
          /analysis WITHOUT PAPER ID
          Redirect to My Papers
      ===================================================== */}

      <Route
        path="/analysis"
        element={
          <Navigate
            to="/papers"
            replace
          />
        }
      />


      {/* =====================================================
          UNKNOWN ROUTES
      ===================================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />

    </Routes>

  );

}


export default AppRoutes;