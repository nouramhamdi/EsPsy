import React, { useEffect, useState } from "react";
import EventServices from "../../../../Services/EventService";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

// Enregistrer les composants Chart.js nécessaires
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const StatiqueEvent = () => {
  const [statistics, setStatistics] = useState({
    eventTypeStats: [],
    totalReservations: 0,
    mostReservedEvent: null,
    upcomingEvents: 0,
    pastEvents: 0,
    activeEvents: 0,
    totalEvents: 0,
    eventsByStatus: {
      active: 0,
      cancelled: 0,
      completed: 0
    },
    summary: {
      mostPopularType: '',
      totalEventTypes: 0,
      averageReservationsPerType: 0
    }
  });

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await EventServices.getEventStatistics();
        setStatistics(response);
      } catch (error) {
        console.error("Error fetching statistics:", error);
      }
    };

    fetchStatistics();
  }, []);

  // Configuration du graphique en barres pour les types d'événements
  const barChartData = {
    labels: statistics.eventTypeStats.map((stat) => stat.eventType),
    datasets: [
      {
        label: "Nombre de réservations",
        data: statistics.eventTypeStats.map((stat) => stat.count),
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Reservations by Event Type",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  // Configuration du graphique en camembert pour la répartition des événements
  const pieChartData = {
    labels: ["Actifs", "Annulés", "Terminés"],
    datasets: [
      {
        data: [
          statistics.eventsByStatus.active,
          statistics.eventsByStatus.cancelled,
          statistics.eventsByStatus.completed
        ],
        backgroundColor: [
          "rgba(75, 192, 192, 0.5)",
          "rgba(255, 99, 132, 0.5)",
          "rgba(153, 102, 255, 0.5)",
        ],
        borderColor: [
          "rgba(75, 192, 192, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(153, 102, 255, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Event Status Distribution",
      },
    },
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Event Statistics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Events</h3>
          <p className="text-3xl font-bold text-blue-600">{statistics.totalEvents}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Reservations</h3>
          <p className="text-3xl font-bold text-green-600">{statistics.totalReservations}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Active Events</h3>
          <p className="text-3xl font-bold text-purple-600">{statistics.activeEvents}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Upcoming Events</h3>
          <p className="text-3xl font-bold text-orange-600">{statistics.upcomingEvents}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Reservations by Event Type</h3>
          <Bar data={barChartData} options={barChartOptions} />
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Status Distribution</h3>
          <Pie data={pieChartData} options={pieChartOptions} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">Statistics Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 className="font-medium text-gray-600">Most Popular Event Type</h4>
            <p className="text-lg font-bold">{statistics.summary.mostPopularType}</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-600">Number of Event Types</h4>
            <p className="text-lg font-bold">{statistics.summary.totalEventTypes}</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-600">Average Reservations per Type</h4>
            <p className="text-lg font-bold">
              {typeof statistics.summary.averageReservationsPerType === 'number' 
                ? statistics.summary.averageReservationsPerType.toFixed(1)
                : '0.0'}
            </p>
          </div>
        </div>
      </div>

      {statistics.mostReservedEvent && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Most Reserved Event</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium text-gray-600">Title</h4>
              <p className="text-lg font-bold">{statistics.mostReservedEvent.title}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-600">Type</h4>
              <p className="text-lg font-bold">{statistics.mostReservedEvent.type}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-600">Number of Reservations</h4>
              <p className="text-lg font-bold">{statistics.mostReservedEvent.count}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatiqueEvent; 