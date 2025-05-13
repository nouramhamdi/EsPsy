import React, { useEffect, useState } from "react";
import PieChart from "../../../../components/charts/PieChart";
import Card from "../../../../components/card";
import userServices from "../../../../../Services/UserService";

const TestParticipationPieChart = () => {
  const [passedUsers, setPassedUsers] = useState(0);
  const [notPassedUsers, setNotPassedUsers] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    const fetchTestParticipationStats = async () => {
      try {
        const stats = await userServices.getTestParticipationStats();
        setPassedUsers(stats.data.passedUsers);
        setNotPassedUsers(stats.data.notPassedUsers);
        setTotalUsers(stats.data.passedUsers + stats.data.notPassedUsers);
      } catch (error) {
        console.error('Error loading test participation stats:', error);
      }
    };

    fetchTestParticipationStats();
  }, []);

  const pieChartOptions = {
    labels: ['Passed Test', 'Not Passed Test'],
    colors: ["#4318FF", "#6AD2FF"],
    chart: {
      width: "50px",
    },
    states: {
      hover: {
        filter: {
          type: "none",
        },
      },
    },
    legend: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
    hover: { mode: null },
    plotOptions: {
      donut: {
        expandOnClick: false,
        donut: {
          labels: {
            show: false,
          },
        },
      },
    },
    fill: {
      colors: ["#4318FF", "#6AD2FF", "#7551ff"],
    },
    tooltip: {
      enabled: true,
      theme: "dark",
      style: {
        fontSize: "12px",
        fontFamily: undefined,
        backgroundColor: "#000000"
      },
    },
  };

  return (
    <Card extra="rounded-[20px] p-3">
      <div className="flex flex-row justify-between px-3 pt-2">
        <div>
          <h4 className="text-lg font-bold text-navy-700 dark:text-white">
            Test Participation Statistics
          </h4>
        </div>
        {/* Add empty div to match header structure */}
        <div className="mb-6 flex items-center justify-center">
          <span className="mb-3 mr-2 flex items-center justify-center text-sm font-bold text-gray-600 hover:cursor-pointer dark:!bg-navy-800 dark:text-white"></span>
        </div>
      </div>

      {/* Keep chart container the same */}
      <div className="mb-auto flex h-[220px] w-full items-center justify-center">
        <PieChart options={pieChartOptions} series={[passedUsers, notPassedUsers]} />
      </div>

      {/* Update legend section to match 3-column layout */}
      <div className="flex flex-row !justify-center rounded-2xl px-6 py-3 shadow-2xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
        <div className="flex flex-col items-center justify-center mr-10">
          <div className="flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-brand-500" />
            <p className="ml-1 text-sm font-normal text-gray-600">Passed Test</p>
          </div>
          <p className="mt-px text-xl font-bold text-blueSecondary dark:text-white">
            {totalUsers > 0 ? ((passedUsers / totalUsers * 100).toFixed(2)) : 0}%
          </p>
        </div>

        <div className="h-11 w-px bg-gray-300 dark:bg-white/10" />

        <div className="flex flex-col items-center justify-center ml-10">
          <div className="flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-[#6AD2FF]" />
            <p className="ml-1 text-sm font-normal text-gray-600">Not Passed</p>
          </div>
          <p className="mt-px text-xl font-bold text-cyan-500 dark:text-white">
            {totalUsers > 0 ? ((notPassedUsers / totalUsers * 100).toFixed(2)) : 0}%
          </p>
        </div>

        {/* Add empty div to maintain 3-column layout */}

      </div>
    </Card>
  );
};

export default TestParticipationPieChart;