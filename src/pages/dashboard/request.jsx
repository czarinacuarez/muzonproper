import React from "react";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  IconButton,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar,
  Tooltip,
  CardFooter,
  Button,
  Progress,
} from "@material-tailwind/react";
import {
  EllipsisVerticalIcon,
  ArrowUpIcon,
  ArrowDownTrayIcon,
  TvIcon,
} from "@heroicons/react/24/outline";

import {
  CheckCircleIcon,
  DocumentIcon,
  ClockIcon,
  PencilIcon,
} from "@heroicons/react/24/solid";
import { useParams } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { useState, useEffect } from "react";
import { FirebaseFirestore } from "@/firebase";

export function Request() {
  const { id } = useParams();
  const [orderData, setOrderData] = useState([]);
  const [users, setUser] = useState(null);
  const [requestsInfo, setRequests] = useState(null);

  function formatTimestamp(timestamp) {
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
  }
  function fetchOrder() {
    let unsubscribeRequest = null;
    let unsubscribeUser = null;

    try {
      const requestDocRef = doc(FirebaseFirestore, "requests", id);

      unsubscribeRequest = onSnapshot(requestDocRef, (requestDocSnap) => {
        if (requestDocSnap.exists()) {
          const requestData = requestDocSnap.data();
          setRequests(requestData);

          const initialData = {
            icon: TvIcon,
            color: "text-green-300",
            title: "Requested to redeem reward",
            description: requestData.submissionDate
              ? formatTimestamp(requestData.submissionDate)
              : "No Description",
          };

          let decisionData = [];

          if (requestData.admin_decision.decision_date !== null) {
            if (requestData.admin_decision.accepted) {
              decisionData.push({
                icon: CheckCircleIcon,
                color: "text-green-500",
                title: "Admin Accepted Your Request",
                description: requestData.admin_decision.decision_date
                  ? formatTimestamp(requestData.admin_decision.decision_date)
                  : "No Decision Date",
              });
            } else if (requestData.admin_decision.rejected) {
              decisionData.push({
                icon: XCircleIcon,
                color: "text-red-500",
                title: "Admin Rejected Your Request",
                description: requestData.admin_decision.decision_date
                  ? formatTimestamp(requestData.admin_decision.decision_date)
                  : "No Decision Date",
              });
            }
          }

          setOrderData([initialData, ...decisionData]);

          const userDocRef = doc(
            FirebaseFirestore,
            "users",
            requestData.user_id,
          );

          unsubscribeUser = onSnapshot(userDocRef, (userDocSnap) => {
            if (userDocSnap.exists()) {
              const userData = userDocSnap.data();
              setUser(userData);
            } else {
              console.log("No such user document!");
            }
          });
        } else {
          console.log("No such request document!");
        }
      });

      return () => {
        if (unsubscribeUser) unsubscribeUser();
        if (unsubscribeRequest) unsubscribeRequest();
      };
    } catch (error) {
      console.error("Error fetching order:", error);
    }
  }

  const openDocument = (url) => {
    try {
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error downloading file:", error.message);
      alert("Error downloading file: " + error.message);
    }
  };

  useEffect(() => {
    const unsubscribe = fetchOrder();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [id]);

  return (
    <div className="mt-12">
      <div className="mb-4 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="overflow-hidden border border-blue-gray-100 shadow-sm">
          <CardHeader
            floated={false}
            shadow={false}
            color="transparent"
            className="m-0 flex items-center justify-between p-6"
          >
            <div>
              <Typography variant="h6" color="blue-gray">
                Requester Profile
              </Typography>
              <Typography
                variant="small"
                className="flex items-center gap-1 font-normal text-blue-gray-600"
              >
                {/* <CheckCircleIcon strokeWidth={3} className="h-4 w-4 text-blue-gray-200" /> */}
                {/* <strong>30 done</strong> this month */}
              </Typography>
            </div>
            <Menu placement="left-start">
              <MenuHandler>
                <IconButton size="sm" variant="text" color="blue-gray">
                  <EllipsisVerticalIcon
                    strokeWidth={3}
                    fill="currenColor"
                    className="h-6 w-6"
                  />
                </IconButton>
              </MenuHandler>
              <MenuList>
                <MenuItem>View Profile</MenuItem>
              </MenuList>
            </Menu>
          </CardHeader>
          <CardBody className=" pb-2">
            <div className="flex items-center gap-6">
              <Avatar
                src="/img/bruce-mars.jpeg"
                alt="bruce-mars"
                size="xl"
                variant="rounded"
                className="rounded-lg shadow-lg shadow-blue-gray-500/40"
              />
              <div>
                <Typography variant="h6" color="blue-gray" className="mb-1">
                  {users ? users.firstname : "Loading..."}{" "}
                  {users ? users.lastname : "Loading..."}
                </Typography>
                <Typography
                  variant="small"
                  className="font-normal text-blue-gray-600"
                >
                  Current Points:{" "}
                  {users ? users.userPoints.totalPoints : "Loading..."}
                </Typography>
              </div>
            </div>
            <Card color="transparent" shadow={false}>
              <hr className=" mt-8 border-blue-gray-50" />

              <CardHeader
                color="transparent"
                shadow={false}
                floated={false}
                className="mx-0 mb-4 mt-6 flex items-center justify-between gap-4"
              >
                <Typography variant="h6" color="blue-gray">
                  Profile Information
                </Typography>
              </CardHeader>
              <CardBody className="p-0">
                <ul className="flex flex-col gap-4 p-0">
                  <li className="flex items-center gap-4">
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-semibold capitalize"
                    >
                      Email:
                    </Typography>
                    <Typography
                      variant="small"
                      className="font-normal text-blue-gray-500"
                    >
                      {users ? users.email : "Loading..."}
                    </Typography>
                  </li>
                  <li className="flex items-center gap-4">
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-semibold capitalize"
                    >
                      Gender:
                    </Typography>
                    <Typography
                      variant="small"
                      className="font-normal text-blue-gray-500"
                    >
                      Female
                    </Typography>
                  </li>

                  <li className="flex items-center gap-4">
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-semibold capitalize"
                    >
                      Address:
                    </Typography>
                    <Typography
                      variant="small"
                      className="font-normal text-blue-gray-500"
                    >
                      Blk 54 lot 3 Sarmiento Homes City of San Jose del Monte
                      Bulacan
                    </Typography>
                  </li>

                  <li className="flex items-center gap-4">
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-semibold capitalize"
                    >
                      Contact no.:
                    </Typography>
                    <Typography
                      variant="small"
                      className="font-normal text-blue-gray-500"
                    >
                      09566216696
                    </Typography>
                  </li>

                  <li className="flex items-center gap-4">
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-semibold capitalize"
                    >
                      Civil Status:
                    </Typography>
                    <Typography
                      variant="small"
                      className="font-normal text-blue-gray-500"
                    >
                      Single
                    </Typography>
                  </li>
                </ul>
              </CardBody>
            </Card>

            <Typography
              variant="h6"
              color="blue-gray"
              className="mb-1"
            ></Typography>
          </CardBody>
        </Card>
        <Card className="overflow-hidden border border-blue-gray-100 shadow-sm">
          <CardHeader
            floated={false}
            shadow={false}
            color="transparent"
            className="m-0 flex items-center justify-between p-6"
          >
            <div>
              <Typography variant="h6" color="blue-gray" className="mb-1">
                Request ID: {id}
              </Typography>
              <Typography
                variant="small"
                className="flex items-center gap-1 font-normal text-blue-gray-600"
              >
                <CheckCircleIcon
                  strokeWidth={3}
                  className="h-4 w-4 text-blue-gray-200"
                />
                <strong>
                  {requestsInfo
                    ? formatTimestamp(requestsInfo.submissionDate)
                    : "Loading..."}
                </strong>
              </Typography>
            </div>
          </CardHeader>

          <CardBody className=" pb-2">
            <ul className="flex flex-col gap-4 p-0 pb-4">
              <div className="flex items-center justify-between gap-4 rounded-md border border-blue-gray-100 px-2 py-4 shadow-sm">
                <div className="flex items-center gap-4">
                  <DocumentIcon
                    strokeWidth={3}
                    fill="currenColor"
                    className="h-8 w-8"
                  />
                  <div>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="mb-1 font-semibold"
                    >
                      {requestsInfo ? requestsInfo.document_name : "Loading..."}
                    </Typography>
                    <Typography className="text-xs font-normal text-blue-gray-400">
                      5 pages
                    </Typography>
                  </div>
                </div>
                <Button
                  variant="text"
                  size="sm"
                  onClick={() => openDocument(requestsInfo?.document_url)}
                >
                  open
                </Button>
              </div>

              <li className="flex items-center gap-4">
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-semibold capitalize"
                >
                  Deadline:
                </Typography>
                <Typography
                  variant="small"
                  className="font-normal text-blue-gray-500"
                >
                  {requestsInfo
                    ? formatTimestamp(requestsInfo.deadline)
                    : "Loading..."}
                </Typography>
              </li>
            </ul>

            <div class="pt-3">
              <button
                class="block w-full select-none rounded-lg bg-blue-gray-900/10 px-6 py-3 text-center align-middle font-sans text-xs font-bold uppercase text-blue-gray-900 shadow-none shadow-gray-900/10 transition-all hover:scale-105 hover:shadow-none hover:shadow-gray-900/20 focus:scale-105 focus:opacity-[0.85] focus:shadow-none active:scale-100 active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                type="button"
              >
                ACCEPT
              </button>
            </div>
            <div class="mb-5 pt-3">
              <button
                class="block w-full select-none rounded-lg bg-red-800 px-6 py-3 text-center align-middle font-sans text-xs font-bold uppercase text-white shadow-none shadow-gray-900/10 transition-all hover:scale-105 hover:shadow-none hover:shadow-gray-900/20 focus:scale-105 focus:opacity-[0.85] focus:shadow-none active:scale-100 active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                type="button"
              >
                REJECT
              </button>
            </div>
          </CardBody>
        </Card>
        <Card className="border border-blue-gray-100 shadow-sm">
          <CardHeader
            floated={false}
            shadow={false}
            color="transparent"
            className="m-0 p-6"
          >
            <Typography variant="h6" color="blue-gray">
              Request Progress
            </Typography>
          </CardHeader>
          <CardBody className="pt-0">
            {orderData.map(({ icon, color, title, description }, key) => (
              <div key={title} className="flex items-start gap-4 py-3">
                <div
                  className={`relative p-1 after:absolute after:-bottom-6 after:left-2/4 after:w-0.5 after:-translate-x-2/4 after:bg-blue-gray-50 after:content-[''] ${
                    key === orderData.length - 1 ? "after:h-0" : "after:h-4/6"
                  }`}
                >
                  {React.createElement(icon, {
                    className: `!w-5 !h-5 ${color}`,
                  })}
                </div>
                <div>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="block font-medium"
                  >
                    {title}
                  </Typography>
                  <Typography
                    as="span"
                    variant="small"
                    className="text-sm font-medium text-red-300"
                  ></Typography>
                  <Typography
                    as="span"
                    variant="small"
                    className="text-xs font-medium text-blue-gray-500"
                  >
                    {description}
                  </Typography>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default Request;
