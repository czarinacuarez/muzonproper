// KUNG SAAN NAKAPLACE ANG SIDEBAR, NAVBAR NG DASHBOARD

import { Routes, Route , useNavigate } from "react-router-dom";
import { Cog6ToothIcon } from "@heroicons/react/24/solid";
import { IconButton } from "@material-tailwind/react";
import {
  Sidenav,
  DashboardNavbar,
  Configurator,
  Footer,
} from "@/widgets/userlayout";
import routes from "@/userroutes";
import { useMaterialTailwindController, setOpenConfigurator } from "@/context";
import { useUser } from "../context/AuthContext";
import { useState , useEffect  } from "react";

export function UserDashboard() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavType } = controller;
  const {  user, userType , userInfo } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
   if (userType === 'admin') {
      navigate('/dashboard/home');
    }
  }, [userType, navigate]);
  return (
    <div className="min-h-screen bg-blue-gray-50/50">

      {/* ADMIN SIDEBAR */}
      <Sidenav
        routes={routes}
        brandImg={
          sidenavType === "dark" ? "/img/logo-ct.png" : "/img/logo-ct-dark.png"
        }
      />

      
      <div className="p-4 xl:ml-80">

        {/* DASHBOARD NAVBAR */}
        <DashboardNavbar />
        <Configurator />
        <IconButton
          size="lg"
          color="white"
          className="fixed bottom-8 right-8 z-40 rounded-full shadow-blue-gray-900/10"
          ripple={false}
          onClick={() => setOpenConfigurator(dispatch, true)}
        >
          <Cog6ToothIcon className="h-5 w-5" />
        </IconButton>
        <Routes>
          {routes.map(
            ({ layout, pages }) =>
              layout === "userdashboard" &&
              pages.map(({ path, element }) => (
                <Route exact path={path} element={element} />
              ))
          )}
        </Routes>
        <div className="text-blue-gray-600">
          <Footer />
        </div>
      </div>
    </div>
  );
}

UserDashboard.displayName = "/src/layout/userdashboard.jsx";

export default UserDashboard;
