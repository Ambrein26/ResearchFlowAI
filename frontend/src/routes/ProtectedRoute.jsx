import { Navigate, Outlet, useLocation } from "react-router-dom";

import { LoaderCircle } from "lucide-react";

import { useAuth } from "../context/useAuth";


function ProtectedRoute() {

  const {
    user,
    loading,
  } = useAuth();

  const location = useLocation();


  if (loading) {

    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">

        <div className="flex flex-col items-center gap-3">

          <LoaderCircle
            size={35}
            className="animate-spin text-indigo-600"
          />

          <p className="text-sm text-slate-500">
            Checking authentication...
          </p>

        </div>

      </div>
    );

  }


  if (!user) {

    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );

  }


  return <Outlet />;
}


export default ProtectedRoute;