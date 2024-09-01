import {
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
  InformationCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,
} from "@heroicons/react/24/solid";
import { Home, Profile, Tables, Notifications, Transactions, Reports, RegisteredUsers, Request } from "@/pages/dashboard";
import { SignIn, SignUp } from "@/pages/auth";

const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    layout: "dashboard",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "dashboard",
        path: "/home",
        element: <Home />,
      },
      {
        icon: <InformationCircleIcon {...icon} />,
        name: "Print Rewards",
        path: "/print-requests",
        element: <Transactions />,
      },
      {
        icon: <InformationCircleIcon {...icon} />,
        name: "Reports",
        path: "/reports",
        element: <Reports />,
      },
      {
        icon: <InformationCircleIcon {...icon} />,
        name: "User Management",
        path: "/registered-users",
        element: <RegisteredUsers />,
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "profile",
        path: "/profile",
        element: <Profile />,
      },
      {
        icon: <TableCellsIcon {...icon} />,
        name: "tables",
        path: "/tables",
        element: <Tables />,
      },
      {
        icon: <InformationCircleIcon {...icon} />,
        name: "notifications",
        path: "/notifications",
        element: <Notifications />,
      },
      {
        name: "request",
        path: "/request/:id",
        element: <Request />,
      },
    ],
  },
  // {
  //   title: "other pages",
  //   layout: "auth",
  //   pages: [
  //     {
  //       icon: <ServerStackIcon {...icon} />,
  //       name: "None",
  //       path: "/sign-in",
  //       element: <SignIn />,
  //     },
  //     {
  //       icon: <RectangleStackIcon {...icon} />,
  //       name: "None",
  //       path: "/sign-up",
  //       element: <SignUp />,
  //     },
  //   ],
  // },
];

export default routes;
