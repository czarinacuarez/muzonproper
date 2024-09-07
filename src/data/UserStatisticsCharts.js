import { chartsConfig } from "@/configs";
import { FetchUserPointsReport } from './UserPointsReport'; 
import { FetchUserRedeemReport } from './UserPointsRedeemed'; 

const getPointsReportData = async () => {
    try {
      const data = await FetchUserPointsReport();
      return data;
    } catch (error) {
      console.error("Error fetching chart data: ", error);
      return [0, 0, 0, 0, 0, 0, 0]; 
    }
  };

  const getRedeemedReportData = async () => {
    try {
      const redeemedDataP = await FetchUserRedeemReport();
      return redeemedDataP;
    } catch (error) {
      console.error("Error fetching chart data: ", error);
      return [0, 0, 0, 0, 0, 0, 0]; 
    }
  };

const getPointsReportChart = async () => {
    const data = await getPointsReportData();
    return {
        type: "bar",
        height: 220,
        series: [
            {
            name: "Points",
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

const getRedeemReportChart = async () => {
  const redeemedDataP = await getRedeemedReportData();
  return {
      type: "bar",
      height: 220,
      series: [
          {
          name: "Points",
          data: redeemedDataP,
          },
      ],
      options: {
        ...chartsConfig,
        colors: "#388e3c",
        plotOptions: {
        bar: {
            columnWidth: "40%",
        },
        },
        xaxis: {
        ...chartsConfig.xaxis,
        categories: ["S", "M", "T", "W", "T", "F", "S"],
        },
    },
  };
};

const completedTaskChart = {
  type: "line",
  height: 220,
  series: [
    {
      name: "Sales",
      data: [50, 40, 300, 320, 500, 350, 200, 230, 500],
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
      categories: [
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


export const userStatisticsCharts = async () => {
    const ViewPointsReport = await getPointsReportChart();
    const ViewRedeemedReport = await getRedeemReportChart();
    return [
        {
            color: "white",
            title: "Added Points",
            description: "Points Added",
            footer: "Points Added Per Day",
            chart: ViewPointsReport,
        },
        {
            color: "white",
            title: "Redeemed Points",
            description: "Redeemed Points",
            footer: "Redeemed Points Per Day",
            chart: ViewRedeemedReport,
        },
        {
            color: "white",
            title: "Total Bottle",
            description: "Bottle Added",
            footer: "Bottle Added Per Day",
            chart: completedTaskChart,
        },
    ]
};

export default userStatisticsCharts;