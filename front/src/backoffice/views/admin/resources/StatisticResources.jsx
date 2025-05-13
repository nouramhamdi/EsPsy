import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import resourceService from '../../../../Services/ResourceService';

// Enregistrer les composants nécessaires de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const StatisticResources = () => {
  const [statistics, setStatistics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await resourceService.getResourceStatsByType();
        console.log('Statistics response:', response); // Debug log
        if (response && response.statsByType) {
          setStatistics(response.statsByType);
        } else {
          setError('Invalid data format');
        }
      } catch (error) {
        console.error('Error fetching statistics:', error);
        setError('Error fetching statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  const chartData = {
    labels: statistics.map(stat => stat.type),
    datasets: [
      {
        label: 'Number of likes',
        data: statistics.map(stat => stat.totalLikes),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'the most liked resources by type',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of likes',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Resource type',
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-red-500">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (statistics.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-gray-500">
          <p>No statistical data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Statistics of Resources</h2>
        <div className="h-[400px]">
          <Bar data={chartData} options={options} />
        </div>
      </div>
    </div>
  );
};

export default StatisticResources;