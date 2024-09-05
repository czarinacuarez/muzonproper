import { chartsConfig } from "@/configs";
import { fetchTransaction } from './fetchData'; 
import { FetchRedeemedData } from './DeductionReport'; 
import { FetchRequestFile } from './RequestFile'; 

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
    type: "bar",
    height: 220,
    series: [
      {
        name: "Total",
        data: data,
      },
    ],
    options: {
      ...chartsConfig,
      colors: "#388e3c",
      plotOptions: {
        bar: {
          columnWidth: "16%",
          borderRadius: 5,
        },
      },
      xaxis: {
        ...chartsConfig.xaxis,
        categories: ["S", "M", "T", "W", "T", "F", "S"],
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
        name: "Total",
        data: redeemedData,
      },
    ],
    options: {
      ...chartsConfig,
      colors: ["#0288d1"],
      stroke: {
        lineCap: "round",
      },
      markers: {
        size: 5,
      },
      xaxis: {
        ...chartsConfig.xaxis,
        categories: ["S", "M", "T", "W", "T", "F", "S"],
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
        data: requestData
      },
    ],
    options: {
      ...chartsConfig,
      colors: ["#388e3c"],
      stroke: {
        lineCap: "round",
      },
      markers: {
        size: 5,
      },
      xaxis: {
        ...chartsConfig.xaxis,
        categories: ["S", "M", "T", "W", "T", "F", "S"],
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
      title: "Transaction",
      description: "Overview of Transaction Per Day",
      footer: "Transaction Every Week",
      chart: websiteViewsChart,
    },
    {
      color: "white",
      title: "Redeemed Rewards",
      description: "Overview of Redeemed Rewards Per Day",
      footer: "Transaction Per Week",
      chart: dailyRedeemerdRewards,
    },
    {
      color: "white",
      title: "Rerquested File",
      description: "Requested File",
      footer: "Requested File",
      chart: dailyRequestRewards,
    },
  ];
};

export default statisticsChartsData;
