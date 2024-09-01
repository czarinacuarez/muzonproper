import {
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
  InformationCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,
} from "@heroicons/react/24/solid";
import { UserHome, UserProfile, UserTables, UserNotifications, Redeem, UserTransactions , UserRequest } from "@/pages/userdashboard";
import { SignIn, SignUp } from "@/pages/auth";

const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    layout: "userdashboard",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "dashboard",
        path: "/home",
        element: <UserHome />,
      },
      {
        icon: <InformationCircleIcon {...icon} />,
        name: "Points & Transactions",
        path: "/transactions",
        element: <UserTransactions />,
      },
      {
        icon: <InformationCircleIcon {...icon} />,
        name: "Print Rewards",
        path: "/print",
        element: <Redeem />,
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "profile",
        path: "/profile",
        element: <UserProfile />,
      },
      {
        icon: <TableCellsIcon {...icon} />,
        name: "tables",
        path: "/tables",
        element: <UserTables />,
      },
      {
        icon: <InformationCircleIcon {...icon} />,
        name: "notifications",
        path: "/notifications",
        element: <UserNotifications />,
      },
      {
        name: "request",
        path: "/request/:id",
        element: <UserRequest />,
      },
  
    ],
  },
  // {
  //   title: "auth pages",
  //   layout: "auth",
  //   pages: [
  //     {
  //       icon: <ServerStackIcon {...icon} />,
  //       name: "sign in",
  //       path: "/sign-in",
  //       element: <SignIn />,
  //     },
  //     {
  //       icon: <RectangleStackIcon {...icon} />,
  //       name: "sign up",
  //       path: "/sign-up",
  //       element: <SignUp />,
  //     },
  //   ],
  // },
];

export default routes;
