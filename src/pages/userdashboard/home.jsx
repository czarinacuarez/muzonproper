import React, { useState } from "react";
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
  CardFooter,
  Button,
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
  EyeDropperIcon,
  KeyIcon,
} from "@heroicons/react/24/solid";
import { useUser } from "@/context/AuthContext";
import { FirebaseFirestore } from "@/firebase";
import { collection, onSnapshot, query, where, doc } from "firebase/firestore";
import { useEffect } from "react";
export function UserHome() {
  const { user } = useUser();
  const [uid, setUid] = useState("");

  const [totalBottles, setTotalBottles] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [currentPoints, setCurrentPoints] = useState(0);
  const timestamp = new Date(); // Get current date and time
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Loading...";

    // Convert to Date object if it's a timestamp string or number
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
  useEffect(() => {
    if (user?.uid) {
      const userId = user.uid;
      console.log("User ID:", userId); // Check that userId is correctly retrieved
      setUid(userId);
      const pointsReductionRef = collection(
        FirebaseFirestore,
        "pointsReductionHistory",
      );
      const pointsReductionQuery = query(
        pointsReductionRef,
        where("userId", "==", userId),
      );

      const unsubscribePointsReduction = onSnapshot(
        pointsReductionQuery,
        (snapshot) => {
          let points = 0;
          snapshot.forEach((doc) => {
            const data = doc.data();
            points += data.points_deducted; // Adjust field name if needed
          });
          setTotalPoints(points);
        },
      );

      const userPointsRef = doc(FirebaseFirestore, "userPoints", userId);

      const unsubscribe = onSnapshot(userPointsRef, (doc) => {
        const data = doc.data();
        setCurrentPoints(data?.points || 0); // Use default value if data is not available
      });

      return () => {
        unsubscribePointsReduction();
        unsubscribe();
      };
    }
  }, [user?.id]);

  return (
    <div className="mt-12">
      <div className="mb-12 grid gap-x-6 gap-y-10 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border border-blue-gray-100 shadow-sm">
          <CardHeader
            variant="gradient"
            color="red"
            floated={false}
            shadow={false}
            className="absolute grid h-12 w-12 place-items-center"
          >
            <Tooltip content="Answer SK Profiling">
              <IconButton className="bg-transparent">
                <CheckCircleIcon className="h-6 w-6"></CheckCircleIcon>
              </IconButton>
            </Tooltip>
          </CardHeader>
          <CardBody className="p-4 text-right">
            <Typography
              variant="small"
              className="font-normal text-blue-gray-600"
            >
              Account Status
            </Typography>
            <Typography variant="h4" color="red">
              Not Verified
            </Typography>
          </CardBody>
          <CardFooter className="border-t border-blue-gray-50 p-4">
            <Typography className="font-normal text-blue-gray-600">
              You must answer SK Profiling.{" "}
              <strong className>Click on the check icon.</strong>
            </Typography>
          </CardFooter>
        </Card>

        <StatisticsCard
          value={totalPoints}
          title="Total Bottles Submitted"
          color="gray"
          icon={React.createElement(EyeDropperIcon, {
            className: "w-6 h-6 text-white",
          })}
          footer={
            <Typography className="font-normal text-blue-gray-600">
              <strong></strong>{" "}
              {totalPoints > 1000
                ? "Great job! You've redeemed over 1000 points!"
                : "Keep going to reach more milestones!"}
            </Typography>
          }
        />
        <StatisticsCard
          value={currentPoints}
          title="Current Points"
          color="gray"
          icon={React.createElement(EyeDropperIcon, {
            className: "w-6 h-6 text-white",
          })}
          footer={
            <div className="flex items-center justify-center">
              <Button>Redeem Printing Rewards</Button>
            </div>
          }
        />
        <StatisticsCard
          value={totalPoints}
          title="Total Points Redeemed"
          color="gray"
          icon={React.createElement(EyeDropperIcon, {
            className: "w-6 h-6 text-white",
          })}
          footer={
            <Typography className="font-normal text-blue-gray-600">
              As of
              <strong className=""> {formatTimestamp(timestamp)}</strong>
            </Typography>
          }
        />
      </div>
      <div className="mb-6 grid grid-cols-1 gap-x-6 gap-y-12 md:grid-cols-2 xl:grid-cols-3">
        {statisticsChartsData.map((props) => (
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
                Projects
              </Typography>
              <Typography
                variant="small"
                className="flex items-center gap-1 font-normal text-blue-gray-600"
              >
                <CheckCircleIcon
                  strokeWidth={3}
                  className="h-4 w-4 text-blue-gray-200"
                />
                <strong>30 done</strong> this month
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
                <MenuItem>Action</MenuItem>
                <MenuItem>Another Action</MenuItem>
                <MenuItem>Something else here</MenuItem>
              </MenuList>
            </Menu>
          </CardHeader>
          <CardBody className="overflow-x-scroll px-0 pb-2 pt-0">
            <table className="w-full min-w-[640px] table-auto">
              <thead>
                <tr>
                  {["companies", "members", "budget", "completion"].map(
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
                  ({ img, name, members, budget, completion }, key) => {
                    const className = `py-3 px-5 ${
                      key === projectsTableData.length - 1
                        ? ""
                        : "border-b border-blue-gray-50"
                    }`;

                    return (
                      <tr key={name}>
                        <td className={className}>
                          <div className="flex items-center gap-4">
                            <Avatar src={img} alt={name} size="sm" />
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-bold"
                            >
                              {name}
                            </Typography>
                          </div>
                        </td>
                        <td className={className}>
                          {members.map(({ img, name }, key) => (
                            <Tooltip key={name} content={name}>
                              <Avatar
                                src={img}
                                alt={name}
                                size="xs"
                                variant="circular"
                                className={`cursor-pointer border-2 border-white ${
                                  key === 0 ? "" : "-ml-2.5"
                                }`}
                              />
                            </Tooltip>
                          ))}
                        </td>
                        <td className={className}>
                          <Typography
                            variant="small"
                            className="text-xs font-medium text-blue-gray-600"
                          >
                            {budget}
                          </Typography>
                        </td>
                        <td className={className}>
                          <div className="w-10/12">
                            <Typography
                              variant="small"
                              className="mb-1 block text-xs font-medium text-blue-gray-600"
                            >
                              {completion}%
                            </Typography>
                            <Progress
                              value={completion}
                              variant="gradient"
                              color={completion === 100 ? "green" : "blue"}
                              className="h-1"
                            />
                          </div>
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
              Orders Overview
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

export default UserHome;
