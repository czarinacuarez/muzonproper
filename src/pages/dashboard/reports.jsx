import React, { useState, useEffect } from "react";
import {
  Typography,
  Card,
  CardBody,
  CardHeader,
} from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import { FirebaseFirestore } from "@/firebase";
import { StatisticsChart } from "@/widgets/charts";
import { StatisticsCard } from "@/widgets/cards";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import {
  BanknotesIcon,
  CheckCircleIcon,
  ClockIcon,
  GiftIcon,
  GlobeAsiaAustraliaIcon,
  UserIcon,
} from "@heroicons/react/24/solid";
import { reportsChartsData } from "@/data/reports-charts-data";

export function Reports() {
  const [bottlesCount, setBottlesCount] = useState(0);

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
  const [chartsData, setChartsData] = useState([]);
  const [projectsTableData, setProjectsTableData] = useState([]);
  const [topUsers, setTopUsers] = useState([]);

  useEffect(() => {
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
    );

    const pointsAddedQuery = query(
      collection(FirebaseFirestore, "pointsAddedHistory"),
    );

    const unsubscribePointsAdded = onSnapshot(pointsAddedQuery, (snapshot) => {
      let total = 0;
      snapshot.forEach((doc) => {
        const data = doc.data();
        total += data.points;
      });
      setStatusCount(total);
    });
    const bottlesAddedQuery = query(
      collection(FirebaseFirestore, "pointsAddedHistory"),
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

    // Query for verified users
    const verifiedUsersQuery = query(
      collection(FirebaseFirestore, "users"),
      where("type", "==", "user"),
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
        const data = await reportsChartsData();
        setChartsData(data);
      } catch (error) {
        console.error("Error fetching statistics charts data: ", error);
      }
    };

    // Reference to the pointsAddedHistory collection
    const pointsCollectionRef = collection(
      FirebaseFirestore,
      "pointsAddedHistory",
    );

    // Real-time listener for pointsAddedHistory collection
    const unsubscribe = onSnapshot(pointsCollectionRef, async (snapshot) => {
      const userBottleMap = {};

      // Group transactions by userId and accumulate totalBottles per user
      snapshot.docs.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        const { userId, totalBottles } = data;

        if (!userBottleMap[userId]) {
          userBottleMap[userId] = {
            totalBottles: 0,
            transactionCount: 0,
          };
        }

        userBottleMap[userId].totalBottles += totalBottles;
        userBottleMap[userId].transactionCount += 1;
      });

      // Calculate the average totalBottles for each user
      const usersWithAverage = Object.keys(userBottleMap).map((userId) => {
        const { totalBottles, transactionCount } = userBottleMap[userId];
        return {
          userId,
          averageBottles: totalBottles,
        };
      });

      // Sort the users by averageBottles in descending order and take top 10
      const sortedTopUsers = usersWithAverage
        .sort((a, b) => b.averageBottles - a.averageBottles)
        .slice(0, 10);

      // Merge user data from the 'users' collection
      const userPromises = sortedTopUsers.map(async (user) => {
        const userRef = doc(FirebaseFirestore, "users", user.userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          return {
            ...user,
            user: userDoc.data(),
          };
        }
        return null;
      });

      // Wait for all user data to resolve
      const resolvedUsers = await Promise.all(userPromises);
      const finalTopUsers = resolvedUsers.filter((user) => user !== null);

      // Update state with the final top users
      setTopUsers(finalTopUsers);
    });

    fetchData();

    return () => {
      unsubscribePointsAdded();
      unsubscribePointsReduction();
      unsubscribeBottlesAdded();
      unsubscribeVerifiedUsers();
      unsubscribe();
    };
  }, []); // Empty dependency array ensures the effect runs once

  return (
    <div className="mt-12">
      <div className="mb-12 grid gap-x-6 gap-y-10 md:grid-cols-2 xl:grid-cols-4">
        <StatisticsCard
          value={verifiedCount}
          title="Total Users"
          color="green"
          icon={React.createElement(UserIcon, {
            className: "w-6 h-6 text-white",
          })}
          footer={
            <Typography className="text-sm font-normal text-blue-gray-600">
              No. of people who created an account
            </Typography>
          }
        />

        <StatisticsCard
          value={statusCount}
          title="Points Earned"
          color="green"
          icon={React.createElement(BanknotesIcon, {
            className: "w-6 h-6 text-white",
          })}
          footer={
            <Typography className="text-sm font-normal text-blue-gray-600">
              Overall points earned by the all users
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
              Overall total bottles collected
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
              Overall points redeemed by all users
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
                Top Users by Total Bottles Donated
              </Typography>
              <Typography
                variant="small"
                className="flex items-center gap-1 font-normal text-blue-gray-600"
              >
                <CheckCircleIcon
                  strokeWidth={3}
                  className="h-4 w-4 text-blue-gray-200"
                />
                Top 10 Users who frequently donated bottles
              </Typography>
            </div>
          </CardHeader>
          <CardBody className="overflow-x-auto px-0 pb-2 pt-0">
            <table className="w-full min-w-[640px] table-auto">
              <thead>
                <tr>
                  {["Rank", "User", "Total Bottles"].map((el) => (
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
                  ))}
                </tr>
              </thead>
              <tbody>
                {topUsers.map((userData, key) => {
                  const className = `py-3 px-5 ${
                    key === topUsers.length - 1
                      ? ""
                      : "border-b border-blue-gray-50"
                  }`;

                  return (
                    <tr key={userData.userId}>
                      <td className={className}>
                        <Typography className="text-sm font-semibold text-blue-gray-600">
                          {key + 1}
                        </Typography>
                      </td>
                      <td className={className}>
                        <div className="flex items-center gap-4">
                          <Typography className="text-sm font-semibold text-blue-gray-600">
                            {userData.user?.firstname} {userData.user?.lastname}
                          </Typography>
                        </div>
                      </td>
                      <td className={className}>
                        <Typography
                          variant="small"
                          className="text-xs font-medium text-blue-gray-600"
                        >
                          {userData.averageBottles.toFixed(2)}
                        </Typography>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default Reports;
