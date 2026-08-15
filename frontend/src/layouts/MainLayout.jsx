import { Outlet } from "react-router-dom";

import Navbar from "../components/common/Navbar";


function MainLayout() {

  return (

    <div className="min-h-screen bg-slate-50">

      <Navbar />

      <Outlet />

    </div>

  );

}


export default MainLayout;