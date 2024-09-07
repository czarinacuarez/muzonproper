import React, { useState } from "react";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  IconButton,
  Chip,
  Tooltip,
  CardFooter,
  Button,
} from "@material-tailwind/react";
import { StatisticsCard } from "@/widgets/cards";
import { StatisticsChart } from "@/widgets/charts";
import {
  statisticsCardsData,
  userStatisticsCharts,
  projectsTableData,
  ordersOverviewData,
} from "@/data";
import {
  CheckCircleIcon,
  CircleStackIcon,
  ClockIcon,
  EyeDropperIcon,
  EyeIcon,
  GifIcon,
  GiftIcon,
  KeyIcon,
  MinusCircleIcon,
  PlusCircleIcon,
  PrinterIcon,
  RocketLaunchIcon,
} from "@heroicons/react/24/solid";
import { useUser } from "@/context/AuthContext";
import { FirebaseFirestore } from "@/firebase";
import {
  collection,
  onSnapshot,
  query,
  where,
  doc,
  orderBy,
  limit,
} from "firebase/firestore";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
export function UserHome() {
  const [chartsData, setChartsData] = useState([]);
  const { user, userVerify } = useUser();
  const [uid, setUid] = useState("");
  const navigate = useNavigate();
  const [recentRequests, setRecentRequests] = useState([]);
  const [mergedHistory, setMergedHistory] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [currentPoints, setCurrentPoints] = useState(0);
  const timestamp = new Date(); // Get current date and time
  const truncate = (str, max) =>
    str.length > max ? `${str.slice(0, max)}...` : str;

  const moveProfile = () => {
    navigate(`/userdashboard/profiling`);
  };

  const moveRedeem = () => {
    navigate(`/userdashboard/print`);
  };

  const moveRequest = (id) => {
    navigate(`/userdashboard/request/${id}`);
  };
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
  useEffect(() => {
    if (user?.uid) {
      const userId = user.uid;
      console.log("User ID:", userId); // Check that userId is correctly retrieved
      setUid(userId);
      const pointsReductionRef = collection(
        FirebaseFirestore,
        "pointsReductionHistory",
      );
      const pointsAddedRef = collection(
        FirebaseFirestore,
        "pointsAddedHistory",
      );
      const pointsReductionQuery = query(
        pointsReductionRef,
        where("userId", "==", userId),
      );

      const pointsAddedQuery = query(
        pointsAddedRef,
        where("userId", "==", userId),
      );

      const requestRef = collection(FirebaseFirestore, "requests");
      const requestQuery = query(
        requestRef,
        where("user_id", "==", userId), // Filter by user_id
        orderBy("deadline", "desc"), // Order by deadline (most recent first)
        limit(5), // Limit the results to 5 documents
      );

      const userPointsRef = doc(FirebaseFirestore, "userPoints", userId);

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

      const unsubscribe = onSnapshot(userPointsRef, (doc) => {
        const data = doc.data();
        setCurrentPoints(data?.points || 0); // Use default value if data is not available
      });

      const unsubscribeRequests = onSnapshot(requestQuery, (snapshot) => {
        const recentRequests = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRecentRequests(recentRequests);
        console.log("Recent Requests:", recentRequests);
      });

      // Function to handle merging and updating state (sort by timestamp and limit to 5)
      const mergeAndUpdateHistory = (newData) => {
        setMergedHistory((prev) => {
          const updated = [...prev, ...newData];
          const unique = Array.from(
            new Map(updated.map((item) => [item.id, item])).values(),
          );
          // Sort by timestamp in descending order and limit to 5 most recent
          return unique
            .sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis()) // Ensure timestamp is in milliseconds for sorting
            .slice(0, 5);
        });
      };

      // Listener for pointsAddedHistory
      const unsubscribeAdded = onSnapshot(pointsAddedQuery, (snapshot) => {
        const addedPoints = snapshot.docs.map((doc) => ({
          ...doc.data(),
          type: "added",
          id: doc.id,
          points: doc.data().points,
          timestamp: doc.data().timestamp, // Ensure correct mapping of timestamp
        }));

        mergeAndUpdateHistory(addedPoints); // Merge added points
      });

      // Listener for pointsReductionHistory
      const unsubscribeReduction = onSnapshot(
        pointsReductionQuery,
        (snapshot) => {
          const reducedPoints = snapshot.docs.map((doc) => ({
            ...doc.data(),
            type: "reduced",
            id: doc.id,
            points: doc.data().points_deducted, // Correctly map points_deducted
            timestamp: doc.data().timestamp, // Ensure correct mapping of timestamp
          }));

          mergeAndUpdateHistory(reducedPoints); // Merge reduced points
        },
      );

      return () => {
        unsubscribeReduction();
        unsubscribeAdded();
        unsubscribeRequests();
        unsubscribe();
        unsubscribePointsReduction();
      };
    }
  }, [user?.id]);
  const fetchData = async () => {
    try {
      const data = await userStatisticsCharts();
      setChartsData(data);
    } catch (error) {
      console.error("Error fetching statistics charts data: ", error);
    }
  };

  fetchData();
  return (
    <div className="mt-12">
      <div className="mb-12 grid gap-x-6 gap-y-10 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border border-blue-gray-100 shadow-sm">
          <CardHeader
            variant="gradient"
            color={userVerify ? "green" : "red"}
            floated={false}
            shadow={false}
            className="absolute grid h-12 w-12 place-items-center"
          >
            <Tooltip
              content={
                userVerify ? "Re-answer SK Profiling" : "Answer SK Profiling"
              }
            >
              <IconButton
                onClick={() => moveProfile()}
                className="bg-transparent shadow-none"
              >
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
            <Typography variant="h4" color={userVerify ? "green" : "red"}>
              {userVerify ? "Verified" : "Not Verified"}
            </Typography>
          </CardBody>
          <CardFooter className="border-t border-blue-gray-50 p-4">
            <Typography className="font-normal text-blue-gray-600">
              {userVerify
                ? "Your account is verified."
                : "You must answer SK Profiling. "}
              {!userVerify && <strong>Click on the check icon.</strong>}
            </Typography>
          </CardFooter>
        </Card>

        <StatisticsCard
          value={totalPoints}
          title="Total Bottles Submitted"
          color="gray"
          icon={React.createElement(GiftIcon, {
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
          icon={React.createElement(RocketLaunchIcon, {
            className: "w-6 h-6 text-white",
          })}
          footer={
            <div className="flex items-center justify-center">
              <Button onClick={() => moveRedeem()}>
                Redeem Printing Rewards
              </Button>
            </div>
          }
        />
        <StatisticsCard
          value={totalPoints}
          title="Total Points Redeemed"
          color="gray"
          icon={React.createElement(CircleStackIcon, {
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
                Recent transaction
              </Typography>
              <Typography
                variant="small"
                className="flex items-center gap-1 font-normal text-blue-gray-600"
              >
                {/* <CheckCircleIcon
                  strokeWidth={3}
                  className="h-4 w-4 text-blue-gray-200"
                />
                <strong>30 done</strong> this month */}
              </Typography>
            </div>
            {/* <Menu placement="left-start">
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
            </Menu> */}
          </CardHeader>
          <CardBody className="overflow-x-scroll px-0 pb-2 pt-0">
            <table className="w-full min-w-[640px] table-auto">
              <thead>
                <tr>
                  {["document name", "deadline", "status", "action"].map(
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
                {recentRequests.map(
                  ({ document_name, deadline, status, id }, key) => {
                    const className = `py-3 px-5 ${
                      key === recentRequests.length - 1
                        ? ""
                        : "border-b border-blue-gray-50"
                    }`;

                    return (
                      <tr key={document_name}>
                        <td className={className}>
                          <Typography className="text-sm font-semibold text-blue-gray-600">
                            {truncate(document_name, 25)}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Typography
                            variant="small"
                            className="text-xs font-medium text-blue-gray-600"
                          >
                            {formatTimestamp(deadline.toDate())}{" "}
                            {/* Convert Firestore Timestamp to Date */}
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
                        <td className={className}>
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
              Recent Points History
            </Typography>
            <Typography
              variant="small"
              className="flex items-center gap-1 font-normal text-blue-gray-600"
            >
              {/* <ArrowUpIcon
                strokeWidth={3}
                className="h-3.5 w-3.5 text-green-500"
              />
              <strong>24%</strong> this month */}
            </Typography>
          </CardHeader>
          <CardBody className="pt-0">
            {mergedHistory.map(({ type, points, timestamp }, index) => (
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
                    <MinusCircleIcon className="!h-5 !w-5 text-red-500" />
                  )}
                </div>
                <div>
                  <Typography
                    variant="small"
                    color={type === "added" ? "green" : "red"}
                    className="block font-medium"
                  >
                    {type === "added"
                      ? `${points} points added`
                      : `${points} points redeemed`}
                  </Typography>
                  <Typography
                    as="span"
                    variant="small"
                    className="text-xs font-medium text-blue-gray-500"
                  >
                    {formatTimestamp(timestamp.toDate())}
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

export default UserHome;
