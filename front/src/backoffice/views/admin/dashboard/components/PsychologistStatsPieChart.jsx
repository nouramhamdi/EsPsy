import React, { useEffect, useState } from "react";
import PieChart from "../../../../components/charts/PieChart";
import Card from "../../../../components/card";
import userServices from "../../../../../Services/UserService";

const PsychologistStatsPieChart = () => {
  const [psychologists, setPsychologists] = useState([]);
  const [totalRatings, setTotalRatings] = useState(0);

  useEffect(() => {
    const fetchPsychologistStats = async () => {
      try {
        const response = await userServices.getPsychologistStats();
        setPsychologists(response.data);
        const sum = response.data.reduce((acc, curr) => acc + curr.totalRatings, 0);
        setTotalRatings(sum);
      } catch (error) {
        console.error('Error fetching psychologist stats:', error);
      }
    };

    fetchPsychologistStats();
  }, []);

  // Prepare chart data
  const series = psychologists.map(psych => psych.totalRatings);
  const colors = ['#4318FF', '#6AD2FF', '#9F89FF', '#FFB547', '#FF6B6B'];

  const options = {
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
        <h4 className="text-lg font-bold text-navy-700 dark:text-white">
          Psychologists Ratings Distribution
        </h4>
      </div>

      <div className="mb-auto flex h-[220px] w-full items-center justify-center">
        <PieChart options={options} series={series} />
      </div>

      <div className="flex flex-row flex-wrap justify-center gap-4 rounded-2xl px-6 py-3 shadow-2xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
        {psychologists.map((psych, index) => (
          <div key={psych._id} className="flex flex-col items-center justify-center mx-2">
            <div className="flex items-center justify-center">
              <div 
                className="h-2 w-2 rounded-full mr-1" 
                style={{ backgroundColor: colors[index % colors.length] }} 
              />
              <p className="text-sm font-normal text-gray-600">
                {psych.fullname}
              </p>
            </div>
            <p className="mt-1 text-xl font-bold text-navy-700 dark:text-white">
              {totalRatings > 0 
                ? ((psych.totalRatings / totalRatings * 100).toFixed(2))
                : 0}%
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default PsychologistStatsPieChart;