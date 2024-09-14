import { chartsConfig } from "@/configs";
import { fetchMonthlyBottles } from "./fetchMonthlyBottles";
import { fetchYearlyTotals } from "./fetchYearlyBottles";
import { fetchMonthlyRequests } from "./fetchMonthlyRedeemed";

const getWebsiteViewsChartData = async () => {
  try {
    const data = await fetchMonthlyBottles();
    return data;
  } catch (error) {
    console.error("Error fetching chart data: ", error);
    return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  }
};

const getRedeemedData = async () => {
  try {
    const redeemedData = await fetchYearlyTotals();
    return redeemedData;
  } catch (error) {
    console.error("Error fetching chart data: ", error);
    return [0, 0];
  }
};

const getRequestsData = async () => {
  try {
    const requestData = await fetchMonthlyRequests();
    return requestData;
  } catch (error) {
    console.error("Error fetching chart data: ", error);
    return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  }
};

const getWebsiteViewsChart = async () => {
  const data = await getWebsiteViewsChartData(); // This should return an array of monthly data
  return {
    type: "line",
    height: 220,
    series: [
      {
        name: "Total Bottles",
        data: data, // This should be an array with 12 values, one for each month
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
        categories: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
      },
    },
  };
};

const getRedeemedChart = async () => {
  const redeemedData = await getRedeemedData();
  return {
    type: "bar", // Set chart type to 'bar'
    height: 220,
    series: [
      {
        name: "Total Bottles",
        data: redeemedData,
      },
    ],
    options: {
      ...chartsConfig,
      colors: ["#aed581"], // Color for the bar chart
      plotOptions: {
        bar: {
          borderRadius: 4,
          horizontal: false,
        },
      },
      xaxis: {
        ...chartsConfig.xaxis,
        categories: ["Last Year", "This Year"],
      },
      yaxis: {
        title: {},
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
        categories: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
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

export const reportsChartsData = async () => {
  const websiteViewsChart = await getWebsiteViewsChart();
  const dailyRedeemerdRewards = await getRedeemedChart();
  const dailyRequestRewards = await getRequestChart();

  return [
    {
      color: "white",
      title: "Monthly Bottle Submission",
      description: "Overview of Bottle Per Month",
      footer: "Transaction Every Month",
      chart: websiteViewsChart,
    },
    {
      color: "white",
      title: "Yearly Bottle Submission",
      description: "Overview of Bottles Submitted Last & This Year",
      footer: "Transaction Per Year",
      chart: dailyRedeemerdRewards,
    },
    {
      color: "white",
      title: "User Points Redeem",
      description: "Overview of All User's Monthly Points Redeemed",
      footer: "Transaction Per Month as of this year",
      chart: dailyRequestRewards,
    },
  ];
};

export default reportsChartsData;
