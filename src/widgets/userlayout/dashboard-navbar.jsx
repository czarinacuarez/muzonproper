import { useLocation, Link, useNavigate } from "react-router-dom";
import { FirebaseAuth, FirebaseFirestore } from "../../firebase";
import {
  Navbar,
  Typography,
  Button,
  IconButton,
  Breadcrumbs,
  Input,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar,
} from "@material-tailwind/react";
import {
  UserCircleIcon,
  Cog6ToothIcon,
  BellIcon,
  ClockIcon,
  CreditCardIcon,
  Bars3Icon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  HeartIcon,
} from "@heroicons/react/24/solid";
import {
  useMaterialTailwindController,
  setOpenConfigurator,
  setOpenSidenav,
} from "@/context";
import { useUser } from "../../context/AuthContext";
import Generateqr from "@/pages/userdashboard/Generateqr";
import { onSnapshot, doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

export function DashboardNavbar() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { fixedNavbar, openSidenav } = controller;
  const { pathname } = useLocation();
  const [layout, page] = pathname.split("/").filter((el) => el !== "");
  const { userInfo, user } = useUser();
  const navigate = useNavigate();

  const moveAccount = () => {
    navigate(`/userdashboard/account`);
  };

  const moveProfile = () => {
    navigate(`/userdashboard/profile`);
  };

  const moveRequest = async (id, notificationId, viewed) => {
    try {
      if (!viewed) {
        const notificationRef = doc(
          FirebaseFirestore,
          "notifications",
          user.uid,
        );

        await updateDoc(notificationRef, {
          [`${notificationId}.viewed`]: true, // Dynamic path to the nested field
        });
      }

      navigate(`/userdashboard/request/${id}`);
    } catch (error) {
      console.error("Error updating notification: ", error);
    }
  };
  const [notifications, setNotifications] = useState([]);
  const [unviewedCount, setUnviewedCount] = useState(0);
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Loading...";

    const date = new Date(timestamp.toDate()); // Convert Firestore Timestamp to JavaScript Date
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };

    return date.toLocaleString("en-US", options);
  };
  useEffect(() => {
    if (!user?.uid) return; // Ensure user is available

    const unsubscribe = onSnapshot(
      doc(FirebaseFirestore, "notifications", user.uid), // Listen to notifications document for this user
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const notificationsMap = docSnapshot.data();
          let count = 0;
          const notificationData = [];

          // Loop through the notifications map
          Object.keys(notificationsMap).forEach((key) => {
            const notification = notificationsMap[key];

            if (notification.viewed === false) {
              count += 1; // Increment count for unviewed notifications
            }

            // Add notification to array
            notificationData.push({
              ...notification,
              id: key, // Use key as the notification ID
            });
          });

          notificationData.sort((a, b) => b.timestamp - a.timestamp);

          setUnviewedCount(count); // Update state with the unviewed notification count
          setNotifications(notificationData); // Update the notifications state
        }
      },
    );

    return () => unsubscribe(); // Cleanup listener on component unmount
  }, [user?.uid]);

  return (
    <Navbar
      color={fixedNavbar ? "white" : "transparent"}
      className={`rounded-xl transition-all ${
        fixedNavbar
          ? "sticky top-4 z-40 py-3 shadow-md shadow-blue-gray-500/5"
          : "px-0 py-1"
      }`}
      fullWidth
      blurred={fixedNavbar}
    >
      <div className="flex flex-col-reverse justify-between gap-6 md:flex-row md:items-center">
        <div className="capitalize">
          <Breadcrumbs
            className={`bg-transparent p-0 transition-all ${
              fixedNavbar ? "mt-1" : ""
            }`}
          >
            <Typography
              variant="small"
              color="blue-gray"
              className="font-normal opacity-50 transition-all hover:text-blue-500 hover:opacity-100"
            >
              User
            </Typography>
            <Typography
              variant="small"
              color="blue-gray"
              className="font-normal"
            >
              {page}
            </Typography>
          </Breadcrumbs>
          <Typography variant="h6" color="blue-gray">
            {page}
          </Typography>
        </div>
        <div className="flex items-center">
          <div className="mr-auto md:mr-4 md:w-56"></div>
          <IconButton
            variant="text"
            color="blue-gray"
            className="grid xl:hidden"
            onClick={() => setOpenSidenav(dispatch, !openSidenav)}
          >
            <Bars3Icon strokeWidth={3} className="h-6 w-6 text-blue-gray-500" />
          </IconButton>

          <Menu>
            <MenuHandler>
              <Button
                variant="text"
                color="blue-gray"
                className="flex items-center gap-1 px-4 normal-case xl:flex"
              >
                <UserCircleIcon className="h-5 w-5 text-blue-gray-500" />
                <span className="hidden md:block">{userInfo?.firstname}</span>
              </Button>
            </MenuHandler>
            <MenuList className="w-max border-0">
              <MenuItem
                onClick={() => moveProfile()}
                className="flex items-center gap-3"
              >
                <div className="grid place-items-center rounded-full bg-gradient-to-tr">
                  <UserCircleIcon className="h-6 w-6 text-black/70" />
                </div>
                <div>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className=" font-normal "
                  >
                    Profile
                  </Typography>
                </div>
              </MenuItem>
              <MenuItem
                onClick={() => moveAccount()}
                className="flex items-center gap-3"
              >
                <div className="grid place-items-center rounded-full bg-gradient-to-tr">
                  <UserCircleIcon className="h-6 w-6 text-black/70" />
                </div>
                <div>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className=" font-normal "
                  >
                    Account Settings
                  </Typography>
                </div>
              </MenuItem>

              <MenuItem
                onClick={() => FirebaseAuth.signOut()}
                className="flex items-center gap-4"
              >
                <div className="grid place-items-center rounded-full bg-gradient-to-tr">
                  <ArrowRightOnRectangleIcon className="h-6 w-6 text-black/70" />
                </div>
                <div>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className=" font-normal "
                  >
                    Logout
                  </Typography>
                </div>
              </MenuItem>
            </MenuList>
          </Menu>
          <Menu>
            <MenuHandler>
              <IconButton variant="text" color="blue-gray">
                <BellIcon className="h-6 w-6 text-blue-gray-500" />
                {unviewedCount > 0 && (
                  <span className="absolute right-0 top-0 inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500 p-2 text-xs font-bold text-white">
                    {unviewedCount}
                  </span>
                )}
              </IconButton>
            </MenuHandler>
            <MenuList className="max-h-72 border-0 shadow-2xl sm:w-96 lg:w-auto w-96">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <MenuItem
                    onClick={() =>
                      moveRequest(
                        notification.transactionId,
                        notification.id,
                        notification.viewed,
                      )
                    }
                    key={notification.id}
                    className="flex items-center gap-3"
                  >
                    <Avatar
                      src="/images/unknown.jpg"
                      alt="item-1"
                      size="sm"
                      variant="circular"
                    />
                    <div>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="mb-1 font-normal"
                      >
                        <strong>{notification.user}</strong>
                        {` ${
                          notification.accepted
                            ? "has accepted your redeem request"
                            : notification.rejected
                            ? "has rejected your redeem request"
                            : notification.printed
                            ? "has printed your document. Kindly retrieve it"
                            : notification.received
                            ? "has already marked your request as completed"
                            : ""
                        }`}
                      </Typography>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="flex items-center gap-1 text-xs font-normal opacity-60"
                      >
                        <ClockIcon className="h-3.5 w-3.5" />{" "}
                        {formatTimestamp(notification.timestamp)}
                      </Typography>

                    </div>
                    <HeartIcon
                      className={`h-4 h-4 rounded-full ${
                        notification.viewed ? "hidden" : " text-green-500"
                      }`}
                    ></HeartIcon>
                  </MenuItem>
                ))
              ) : (
                <div className="mx-6">
                  <div className="m-2 flex justify-center items-center">
                    <div className="p-4 rounded-full bg-green-200">
                      <BellIcon className=" h-16 w-16 text-blue-gray-500 mx-auto" />
                    </div>
                  </div>
                  <Typography
                    variant="large"
                    color="blue-gray"
                    className="font-bold text-center"
                  >
                    No Notifications
                  </Typography>
                </div>
              )}
              {/* <MenuItem className="flex items-center gap-4">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-tr from-blue-gray-800 to-blue-gray-900">
                  <CreditCardIcon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="mb-1 font-normal"
                  >
                    Payment successfully completed
                  </Typography>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="flex items-center gap-1 text-xs font-normal opacity-60"
                  >
                    <ClockIcon className="h-3.5 w-3.5" /> 2 days ago
                  </Typography>
                </div>
              </MenuItem> */}
            </MenuList>
          </Menu>
          <IconButton
            variant="text"
            color="blue-gray"
            onClick={() => setOpenConfigurator(dispatch, true)}
          >
            <Cog6ToothIcon className="h-5 w-5 text-blue-gray-500" />
          </IconButton>
          <Generateqr />
        </div>
      </div>
    </Navbar>
  );
}

DashboardNavbar.displayName = "/src/widgets/userlayout/dashboard-navbar.jsx";

export default DashboardNavbar;
