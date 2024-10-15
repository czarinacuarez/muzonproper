import {
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
  InformationCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,
  BanknotesIcon,
  ChartBarSquareIcon,
  UserGroupIcon,
  EyeDropperIcon,
  PrinterIcon,
  CircleStackIcon,
} from "@heroicons/react/24/solid";
import {
  Home,
  Profile,
  Tables,
  PointsHistory,
  Transactions,
  Reports,
  RegisteredUsers,
  EditUserPoints,
  Request,
  Accounts,
} from "@/pages/dashboard";
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
        icon: <BanknotesIcon {...icon} />,
        name: "Points History",
        path: "/points",
        element: <PointsHistory />,
      },
      {
        icon: <PrinterIcon {...icon} />,
        name: "Print Rewards",
        path: "/print-requests",
        element: <Transactions />,
      },
      {
        icon: <ChartBarSquareIcon {...icon} />,
        name: "Reports",
        path: "/reports",
        element: <Reports />,
      },
      {
        icon: <UserGroupIcon {...icon} />,
        name: "User Management",
        path: "/users",
        element: <RegisteredUsers />,
      },
      {
        icon: <CircleStackIcon {...icon} />,
        name: "Points Management",
        path: "/edit_points",
        element: <EditUserPoints />,
      },
      // {
      //   icon: <UserCircleIcon {...icon} />,
      //   name: "profile",
      //   path: "/profile",
      //   element: <Profile />,
      // },
      // {
      //   icon: <TableCellsIcon {...icon} />,
      //   name: "tables",
      //   path: "/tables",
      //   element: <Tables />,
      // },
      // {
      //   icon: <InformationCircleIcon {...icon} />,
      //   name: "notifications",
      //   path: "/notifications",
      //   element: <Notifications />,
      // },
      {
        name: "request",
        path: "/request/:id",
        element: <Request />,
      },
      {
        name: "profile",
        path: "/profile/:id",
        element: <Profile />,
      },
      {
        name: "account",
        path: "/account",
        element: <Accounts />,
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
