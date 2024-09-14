import React, { useState, useEffect } from "react";
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
  Progress,
  Chip,
} from "@material-tailwind/react";
import { EllipsisVerticalIcon, ArrowUpIcon } from "@heroicons/react/24/outline";
import { StatisticsCard } from "@/widgets/cards";
import { StatisticsChart } from "@/widgets/charts";
import {
  statisticsCardsData,
  statisticsChartsData,
  projectsTableData,
  ordersOverviewData,
} from "@/data";
import {
  CheckCircleIcon,
  ClockIcon,
  EnvelopeIcon,
  EyeIcon,
  GifIcon,
  GiftIcon,
  GlobeAsiaAustraliaIcon,
  MinusCircleIcon,
  PlusCircleIcon,
  UserIcon,
} from "@heroicons/react/24/solid";
import fetchLatestRequests from "@/data/LatestRequestFile";
import { useNavigate } from "react-router-dom";
import { FirebaseFirestore } from "@/firebase";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";

export function Home() {
  const [chartsData, setChartsData] = useState([]);
  const [projectsTableData, setProjectsTableData] = useState([]);
  const [mergedHistory, setMergedHistory] = useState([]);

  const navigate = useNavigate();
  const truncate = (str, max) =>
    str.length > max ? `${str.slice(0, max)}...` : str;

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Loading...";

    const date = new Date(timestamp);

    const options = {
      year: "numeric",
      month: "long",
      day: "2-digit",
      hour: "numeric",
      minute: "2-digit",
      hour12: true, // Use 12-hour time format with AM/PM
    };

    return date.toLocaleString("en-US", options);
  };
  const moveRequest = (id) => {
    navigate(`/dashboard/request/${id}`);
  };
  const [verifiedCount, setVerifiedCount] = useState(0);
  const [totalPointsDeducted, setTotalPointsDeducted] = useState(0);
  const [statusCount, setStatusCount] = useState(0);
  const [bottlesCount, setBottlesCount] = useState(0);

  useEffect(() => {
    // Exclude certain statuses for requests query
    const excludedStatuses = ["received", "rejected", "cancelled"];

    const requestsQuery = query(
      collection(FirebaseFirestore, "requests"),
      where("status", "not-in", excludedStatuses),
    );

    // Real-time listener for requests
    const unsubscribeRequests = onSnapshot(requestsQuery, (snapshot) => {
      const count = snapshot.size;
      setStatusCount(count);
    });

    // Get the start and end of the current month for points queries
    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    );
    const endOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      0,
      23,
      59,
      59,
    );

    const pointsReductionQuery = query(
      collection(FirebaseFirestore, "pointsReductionHistory"),
      where("timestamp", ">=", startOfMonth),
      where("timestamp", "<=", endOfMonth),
      orderBy("timestamp", "desc"),
    );

    // Real-time listener for points reduction history
    const unsubscribePointsReduction = onSnapshot(
      pointsReductionQuery,
      (snapshot) => {
        let total = 0;
        snapshot.forEach((doc) => {
          const data = doc.data();
          total += data.points_deducted;
        });
        setTotalPointsDeducted(total);
      },
    );

    const bottlesAddedQuery = query(
      collection(FirebaseFirestore, "pointsAddedHistory"),
      where("timestamp", ">=", startOfMonth),
      where("timestamp", "<=", endOfMonth),
      orderBy("timestamp", "desc"),
    );

    const unsubscribeBottlesAdded = onSnapshot(
      bottlesAddedQuery,
      (snapshot) => {
        let total = 0;
        snapshot.forEach((doc) => {
          const data = doc.data();
          total += data.totalBottles;
        });
        setBottlesCount(total);
      },
    );

    // Query for verified users
    const verifiedUsersQuery = query(
      collection(FirebaseFirestore, "users"),
      where("verified", "==", true),
    );

    // Real-time listener for verified users
    const unsubscribeVerifiedUsers = onSnapshot(
      verifiedUsersQuery,
      (snapshot) => {
        setVerifiedCount(snapshot.size);
      },
    );

    // Fetch statistics chart data
    const fetchData = async () => {
      try {
        const data = await statisticsChartsData();
        setChartsData(data);
      } catch (error) {
        console.error("Error fetching statistics charts data: ", error);
      }
    };

    const getUserNameById = async (userId) => {
      console.log("Fetching user data for ID:", userId); // Log userId
      if (!userId) {
        console.error("User ID is undefined or null");
        return "Unknown User";
      }
      try {
        const userDocRef = doc(FirebaseFirestore, "users", userId);
        console.log("User Document Reference:", userDocRef); // Log doc reference
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const { firstname, lastname } = userDoc.data();
          const userDisplay = `${firstname || ""} ${lastname || ""}`.trim();
          return userDisplay || "Unknown User";
        }

        return "Unknown User";
      } catch (error) {
        console.error("Error fetching user data:", error);
        return "Unknown User";
      }
    };

    const mergeAndUpdateHistory = async (newData, type) => {
      console.log("New Data:", newData); // Log newData to check userId presence
      const historyWithUserNames = await Promise.all(
        newData.map(async (item) => {
          console.log("Processing item:", item); // Log item to check userId
          const userName = await getUserNameById(item.userId); // Fetch user name
          return {
            ...item,
            type, // Set the type to "added" or "redeemed"
            message:
              type === "added"
                ? `${userName} submitted ${item.totalBottles || 0} bottles`
                : `${userName} redeemed ${item.points_deducted || 0} points`,
          };
        }),
      );

      // Update state as before
      setMergedHistory((prev) => {
        const updated = [...prev, ...historyWithUserNames];
        const unique = Array.from(
          new Map(updated.map((item) => [item.id, item])).values(),
        );
        // Sort by timestamp in descending order and limit to 5 most recent
        return unique
          .sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis())
          .slice(0, 5);
      });
    };

    // Query for points added (ensure the correct setup for this query)
    const pointsAddedQuery = query(
      collection(FirebaseFirestore, "pointsAddedHistory"),
      orderBy("timestamp", "desc"),
    );

    const unsubscribePointsAdded = onSnapshot(pointsAddedQuery, (snapshot) => {
      const pointsAddedData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        pointsAdded: doc.data().points_added, // Ensure correct field name
        userId: doc.data().userId, // Ensure correct field name
        timestamp: doc.data().timestamp, // Ensure correct field name
      }));

      mergeAndUpdateHistory(pointsAddedData, "added");
    });

    const unsubscribePointsReductionUser = onSnapshot(
      pointsReductionQuery,
      (snapshot) => {
        const pointsReductionData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          points_deducted: doc.data().points_deducted, // Ensure correct field name
          userId: doc.data().userId, // Ensure correct field name
          timestamp: doc.data().timestamp, // Ensure correct field name
        }));

        mergeAndUpdateHistory(pointsReductionData, "redeemed");
      },
    );

    fetchData(); // Fetch data on mount

    // Cleanup all listeners when the component unmounts
    return () => {
      unsubscribeRequests();
      unsubscribePointsReduction();
      unsubscribeBottlesAdded();
      unsubscribeVerifiedUsers();
      unsubscribePointsAdded();
      unsubscribePointsReductionUser();
    };
  }, []); // Empty dependency array ensures the effect runs once

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchLatestRequests();
      setProjectsTableData(data);
    };

    loadData();
  }, []);

  return (
    <div className="mt-12">
      <div className="mb-12 grid gap-x-6 gap-y-10 md:grid-cols-2 xl:grid-cols-4">
        <StatisticsCard
          value={verifiedCount}
          title="Verified Users"
          color="green"
          icon={React.createElement(UserIcon, {
            className: "w-6 h-6 text-white",
          })}
          footer={
            <Typography className="text-sm font-normal text-blue-gray-600">
              No. of people who answered SK Profiling
            </Typography>
          }
        />

        <StatisticsCard
          value={statusCount}
          title="Pending Requests"
          color="green"
          icon={React.createElement(EnvelopeIcon, {
            className: "w-6 h-6 text-white",
          })}
          footer={
            <Typography className="text-sm font-normal text-blue-gray-600">
              Current no. of requests awaiting for admin's approval
            </Typography>
          }
        />

        <StatisticsCard
          value={bottlesCount}
          title="Accumulated Bottles"
          color="green"
          icon={React.createElement(GlobeAsiaAustraliaIcon, {
            className: "w-6 h-6 text-white",
          })}
          footer={
            <Typography className="text-sm font-normal text-blue-gray-600">
              Total bottles collected this month
            </Typography>
          }
        />

        <StatisticsCard
          value={totalPointsDeducted}
          title="Points Redeemed"
          color="green"
          icon={React.createElement(GiftIcon, {
            className: "w-6 h-6 text-white",
          })}
          footer={
            <Typography className="text-sm font-normal text-blue-gray-600">
              Total points used for rewards this month
            </Typography>
          }
        />
      </div>
      <div className="mb-6 grid grid-cols-1 gap-x-6 gap-y-12 md:grid-cols-2 xl:grid-cols-3">
        {chartsData.map((props) => (
          <StatisticsChart
            key={props.title}
            {...props}
            footer={
              <Typography
                variant="small"
                className="flex items-center font-normal text-blue-gray-600"
              >
                <ClockIcon
                  strokeWidth={2}
                  className="h-4 w-4 text-blue-gray-400"
                />
                &nbsp;{props.footer}
              </Typography>
            }
          />
        ))}
      </div>

      <div className="mb-4 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="overflow-hidden border border-blue-gray-100 shadow-sm xl:col-span-2">
          <CardHeader
            floated={false}
            shadow={false}
            color="transparent"
            className="m-0 flex items-center justify-between p-6"
          >
            <div>
              <Typography variant="h5" color="green" className="mb-1">
                Latest Request
              </Typography>
              <Typography
                variant="small"
                className="flex items-center gap-1 font-normal text-blue-gray-600"
              >
                <CheckCircleIcon
                  strokeWidth={3}
                  className="h-4 w-4 text-blue-gray-200"
                />
                List of recent rewards request.
              </Typography>
            </div>
            <Menu placement="left-start">
              {/* <MenuHandler>
                <IconButton size="sm" variant="text" color="blue-gray">
                  <EllipsisVerticalIcon
                    strokeWidth={3}
                    fill="currenColor"
                    className="h-6 w-6"
                  />
                </IconButton>
              </MenuHandler>
              <MenuList>
                <MenuItem>Action</MenuItem>
                <MenuItem>Another Action</MenuItem>
                <MenuItem>Something else here</MenuItem>
              </MenuList> */}
            </Menu>
          </CardHeader>
          <CardBody className="overflow-x-scroll px-0 pb-2 pt-0">
            <table className="w-full min-w-[640px] table-auto">
              <thead>
                <tr>
                  {["User", "Document Name", "Deadline", "Status", ""].map(
                    (el) => (
                      <th
                        key={el}
                        className="border-b border-blue-gray-50 px-6 py-3 text-left"
                      >
                        <Typography
                          variant="small"
                          className="text-[11px] font-medium uppercase text-blue-gray-400"
                        >
                          {el}
                        </Typography>
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {projectsTableData.map(
                  (
                    {
                      firstname,
                      lastname,
                      document_name,
                      deadline,
                      id,
                      status,
                    },
                    key,
                  ) => {
                    const className = `py-3 px-5 ${
                      key === projectsTableData.length - 1
                        ? ""
                        : "border-b border-blue-gray-50"
                    }`;

                    return (
                      <tr key={name}>
                        <td className={className}>
                          <div className="flex items-center gap-4">
                            <Typography className="text-sm font-semibold text-blue-gray-500">
                              {firstname} {lastname}
                            </Typography>
                          </div>
                        </td>
                        <td className={className}>
                          <div className="flex items-center gap-4">
                            <Typography className="text-sm font-semibold text-blue-gray-600">
                              {truncate(document_name)}
                            </Typography>
                          </div>
                        </td>
                        <td className={className}>
                          <Typography
                            variant="small"
                            className="text-xs font-medium text-blue-gray-600"
                          >
                            {" "}
                            {deadline.toLocaleDateString()}
                          </Typography>
                        </td>
                        <td className={className}>
                          <div className="w-max">
                            <Chip
                              size="sm"
                              variant="ghost"
                              value={status}
                              color={
                                status === "received"
                                  ? "green"
                                  : status === "cancelled"
                                  ? "red"
                                  : status === "rejected"
                                  ? "red"
                                  : "amber"
                              }
                            />
                          </div>
                        </td>
                        <td>
                          <Tooltip content="View Request">
                            <IconButton
                              variant="text"
                              onClick={() => moveRequest(id)}
                            >
                              <EyeIcon className="h-4 w-4" />
                            </IconButton>
                          </Tooltip>
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </CardBody>
        </Card>
        <Card className="border border-blue-gray-100 shadow-sm">
          <CardHeader
            floated={false}
            shadow={false}
            color="transparent"
            className="m-0 p-6"
          >
            <Typography variant="h5" color="green" className="mb-2">
              Recent Points History
            </Typography>
            <Typography
              variant="small"
              className="flex items-center gap-1 font-normal text-blue-gray-600"
            >
              {/* Optionally, display other stats here */}
            </Typography>
          </CardHeader>
          <CardBody className="pt-0">
            {mergedHistory.map(
              ({ message, points, timestamp, type }, index) => (
                <div key={index} className="flex items-start gap-4 py-3">
                  <div
                    className={`relative p-1 after:absolute after:-bottom-6 after:left-2/4 after:w-0.5 after:-translate-x-2/4 after:bg-blue-gray-50 after:content-[''] ${
                      index === mergedHistory.length - 1
                        ? "after:h-0"
                        : "after:h-4/6"
                    }`}
                  >
                    {type === "added" ? (
                      <PlusCircleIcon className="!h-5 !w-5 text-green-500" />
                    ) : (
                      <MinusCircleIcon className="!h-5 !w-5 text-blue-gray-500" />
                    )}
                  </div>
                  <div>
                    <Typography
                      variant="small"
                      color={type === "added" ? "green" : "blue-gray"}
                      className="block font-medium"
                    >
                      {message
                        ? message
                        : `${points || 0} points ${
                            type === "added" ? "added" : "redeemed"
                          }`}
                    </Typography>
                    <Typography
                      as="span"
                      variant="small"
                      className="text-xs font-medium text-blue-gray-500"
                    >
                      {timestamp
                        ? formatTimestamp(timestamp.toDate())
                        : "No timestamp"}
                    </Typography>
                  </div>
                </div>
              ),
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default Home;
