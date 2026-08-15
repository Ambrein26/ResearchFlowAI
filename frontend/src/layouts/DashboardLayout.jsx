import { Outlet } from "react-router-dom";

import Sidebar from "../components/layout/Sidebar";


function DashboardLayout() {

  return (

    <div className="flex min-h-screen bg-slate-50">

      <Sidebar />

      <main className="min-w-0 flex-1 overflow-y-auto">

        <Outlet />

      </main>

    </div>

  );

}


export default DashboardLayout;