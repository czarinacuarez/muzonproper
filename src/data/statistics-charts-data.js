import { chartsConfig } from "@/configs";
import { fetchTransaction } from "./fetchData";
import { FetchRedeemedData } from "./DeductionReport";
import { FetchRequestFile } from "./RequestFile";

const getWebsiteViewsChartData = async () => {
  try {
    const data = await fetchTransaction();
    return data;
  } catch (error) {
    console.error("Error fetching chart data: ", error);
    return [0, 0, 0, 0, 0, 0, 0];
  }
};

const getRedeemedData = async () => {
  try {
    const redeemedData = await FetchRedeemedData();
    return redeemedData;
  } catch (error) {
    console.error("Error fetching chart data: ", error);
    return [0, 0, 0, 0, 0, 0, 0];
  }
};

const getRequestsData = async () => {
  try {
    const requestData = await FetchRequestFile();
    return requestData;
  } catch (error) {
    console.error("Error fetching chart data: ", error);
    return [0, 0, 0, 0, 0, 0, 0];
  }
};

const getWebsiteViewsChart = async () => {
  const data = await getWebsiteViewsChartData();
  return {
    type: "line",
    height: 220,
    series: [
      {
        name: "Total Bottles",
        data: data,
      },
    ],
    options: {
      ...chartsConfig,
      colors: ["#81c784"],
      stroke: {
        lineCap: "round",
      },
      markers: {
        size: 5,
      },
      xaxis: {
        ...chartsConfig.xaxis,
        categories: ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"],
      },
    },
  };
};

const getRedeemedChart = async () => {
  const redeemedData = await getRedeemedData();
  return {
    type: "line",
    height: 220,
    series: [
      {
        name: "Total Points",
        data: redeemedData,
      },
    ],
    options: {
      ...chartsConfig,
      colors: ["#aed581"],
      stroke: {
        lineCap: "round",
      },
      markers: {
        size: 5,
      },
      xaxis: {
        ...chartsConfig.xaxis,
        categories: ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"],
      },
    },
  };
};

const getRequestChart = async () => {
  const requestData = await getRequestsData();
  return {
    type: "line",
    height: 220,
    series: [
      {
        name: "Requests",
        data: requestData,
      },
    ],
    options: {
      ...chartsConfig,
      colors: ["#81c784"],
      stroke: {
        lineCap: "round",
      },
      markers: {
        size: 5,
      },
      xaxis: {
        ...chartsConfig.xaxis,
        categories: ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"],
      },
    },
  };
};

// const completedTasksChart = {
//   ...completedTaskChart,
//   series: [
//     {
//       name: "Tasks",
//       data: [20, 40, 300, 220, 500, 250, 400, 230, 500],
//     },
//   ],
// };

export const statisticsChartsData = async () => {
  const websiteViewsChart = await getWebsiteViewsChart();
  const dailyRedeemerdRewards = await getRedeemedChart();
  const dailyRequestRewards = await getRequestChart();

  return [
    {
      color: "white",
      title: "Bottle Submission",
      description: "Overview of Bottle Per Day",
      footer: "Transaction Every Week",
      chart: websiteViewsChart,
    },
    {
      color: "white",
      title: "Points Redeemed",
      description: "Overview of Points Redeemed Per Day",
      footer: "Transaction Per Week",
      chart: dailyRedeemerdRewards,
    },
    {
      color: "white",
      title: "User Redeem Requests",
      description: "Overview of User's Reward Request Per Day",
      footer: "Transaction Per Week",
      chart: dailyRequestRewards,
    },
  ];
};

export default statisticsChartsData;
