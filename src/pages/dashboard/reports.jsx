import React, { useState, useEffect } from "react";
import { Typography } from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import { FirebaseFirestore } from "@/firebase";
import { StatisticsChart } from "@/widgets/charts";
import { StatisticsCard } from "@/widgets/cards";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import {
  BanknotesIcon,
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

    fetchData();

    return () => {
      unsubscribePointsAdded();
      unsubscribePointsReduction();
      unsubscribeBottlesAdded();
      unsubscribeVerifiedUsers();
    };
  }, []); // Empty dependency array ensures the effect runs once

  return (
    <div className="mt-12">
      <div className="mb-12 grid gap-x-6 gap-y-10 md:grid-cols-2 xl:grid-cols-4">
        <StatisticsCard
          value={verifiedCount}
          title="Total Users"
          color="gray"
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
          color="gray"
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
    </div>
  );
}

export default Reports;
