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
  UserIcon,
} from "@heroicons/react/24/solid";
import fetchLatestRequests from "@/data/LatestRequestFile";
import { useNavigate } from "react-router-dom";
import { FirebaseFirestore } from "@/firebase";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";

export function Home() {
  const [chartsData, setChartsData] = useState([]);
  const [projectsTableData, setProjectsTableData] = useState([]);
  const navigate = useNavigate();
  const truncate = (str, max) =>
    str.length > max ? `${str.slice(0, max)}...` : str;

  const moveRequest = (id) => {
    navigate(`/dashboard/request/${id}`);
  };
  const [verifiedCount, setVerifiedCount] = useState(0);
  const [totalPointsDeducted, setTotalPointsDeducted] = useState(0);
  const [statusCount, setStatusCount] = useState(0);

  useEffect(() => {
    const excludedStatuses = ["received", "rejected", "cancelled"];

    const requestsQuery = query(
      collection(FirebaseFirestore, "requests"),
      where("status", "not-in", excludedStatuses),
    );

    // Real-time listener
    const unsubscribeRequests = onSnapshot(requestsQuery, (snapshot) => {
      // Count the number of documents that match the query
      const count = snapshot.size;
      setStatusCount(count);
    });

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

    // Real-time listener
    const unsubscribePointsReduction = onSnapshot(
      pointsReductionQuery,
      (snapshot) => {
        let total = 0;

        snapshot.forEach((doc) => {
          const data = doc.data();
          // Add up all points_deducted
          total += data.points_deducted;
        });

        // Update state with the total points deducted
        setTotalPointsDeducted(total);
      },
    );
    const q = query(
      collection(FirebaseFirestore, "users"),
      where("verified", "==", true),
    );

    // Set up the real-time listener
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      // Update the count based on the number of documents in the querySnapshot
      setVerifiedCount(querySnapshot.size);
    });

    const fetchData = async () => {
      try {
        const data = await statisticsChartsData();
        setChartsData(data);
      } catch (error) {
        console.error("Error fetching statistics charts data: ", error);
      }
    };

    fetchData();

    return () => {
      unsubscribeRequests();
      unsubscribePointsReduction();
      unsubscribe();
    };
  }, []);

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
          color="gray"
          icon={React.createElement(EnvelopeIcon, {
            className: "w-6 h-6 text-white",
          })}
          footer={
            <Typography className="text-sm font-normal text-blue-gray-600">
              Requests awaiting admin approval
            </Typography>
          }
        />

        <StatisticsCard
          value={verifiedCount}
          title="Accumulated Bottles"
          color="gray"
          icon={React.createElement(GlobeAsiaAustraliaIcon, {
            className: "w-6 h-6 text-white",
          })}
          footer={
            <Typography className="text-sm font-normal text-blue-gray-600">
              Overall total bottles collected
            </Typography>
          }
        />

        <StatisticsCard
          value={totalPointsDeducted}
          title="Points Redeemed"
          color="gray"
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
              <Typography variant="h6" color="blue-gray" className="mb-1">
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
                1-5
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
                            <Typography className="text-sm font-semibold text-blue-gray-600">
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
            <Typography variant="h6" color="blue-gray" className="mb-2">
              Recent Bottle Submission
            </Typography>
            <Typography
              variant="small"
              className="flex items-center gap-1 font-normal text-blue-gray-600"
            >
              <ArrowUpIcon
                strokeWidth={3}
                className="h-3.5 w-3.5 text-green-500"
              />
              <strong>24%</strong> this month
            </Typography>
          </CardHeader>
          <CardBody className="pt-0">
            {ordersOverviewData.map(
              ({ icon, color, title, description }, key) => (
                <div key={title} className="flex items-start gap-4 py-3">
                  <div
                    className={`relative p-1 after:absolute after:-bottom-6 after:left-2/4 after:w-0.5 after:-translate-x-2/4 after:bg-blue-gray-50 after:content-[''] ${
                      key === ordersOverviewData.length - 1
                        ? "after:h-0"
                        : "after:h-4/6"
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
                      className="text-xs font-medium text-blue-gray-500"
                    >
                      {description}
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
