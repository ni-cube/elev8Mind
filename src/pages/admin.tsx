'use client'
import React, { useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { CategoryScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, LinearScale } from 'chart.js';
import Chart from 'chart.js/auto';
import Layout from '@/layout';


// Register chart.js components
Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AnalyticsPage = () => {
  // Dummy data representing PHQ-9 scores of kids
  const [phqData] = useState([
    { id: 1, name: 'Kid 1', score: 1 },
    { id: 2, name: 'Kid 2', score: 1 },
    { id: 3, name: 'Kid 3', score: 4 },
    { id: 4, name: 'Kid 4', score: 2 },
    { id: 5, name: 'Kid 5', score: 2 },
    { id: 6, name: 'Kid 6', score: 1 },
    { id: 7, name: 'Kid 7', score: 5 },
    { id: 8, name: 'Kid 8', score: 4 }
  ]);

  // State to track the selected chart type (Line or Bar)
  const [chartType, setChartType] = useState('line');

  // Prepare chart data
  const chartData = {
    labels: phqData.map(item => item.name), // Kid names as x-axis labels
    datasets: [
      {
        label: 'PHQ-9 Scores',
        data: phqData.map(item => item.score), // PHQ-9 scores as data
        borderColor: '#5999ab',
        backgroundColor: 'rgba(89, 153, 171, 0.3)',
        pointBackgroundColor: '#5999ab',
        fill: true,
        tension: 0.4
      }
    ]
  };

    // Group the scores and count how many kids got each score
    const scoreCount = phqData.reduce((acc: { [key: number]: number }, item) => {
        acc[item.score] = (acc[item.score] || 0) + 1;
        return acc;
      }, {});
    
    // Prepare chart data for horizontal bar chart
    const barChartData = {
        labels: Object.keys(scoreCount), // PHQ-9 scores as Y-axis labels
        datasets: [
          {
            label: 'Number of Kids',
            data: Object.values(scoreCount), // Number of kids for each score as X-axis values
            backgroundColor: 'rgba(89, 153, 171, 0.7)', // Bar color
            borderColor: '#5999ab',
            borderWidth: 1,
          }
        ]
    };

  // Dummy stats
  const totalUsers = phqData.length;
  const averageScore = (phqData.reduce((acc, item) => acc + item.score, 0) / totalUsers).toFixed(2);

  return (
    <Layout>
    <div className="flex flex-col h-screen bg-primary p-5">
      <div className="max-w-4xl mx-auto w-full flex flex-col flex-1">
        {/* Analytics Header */}
        <div className="mb-5 flex justify-between items-center">
          <h1 className="text-darkest text-3xl font-bold">VibeSpace Analytics 💙</h1>
          <button className="px-4 py-2 rounded-lg bg-lighter text-darkest">Export Data</button>
        </div>

        {/* Analytics Overview */}
        <div className="bg-lightest rounded-lg p-5 shadow-md mb-6">
          <h2 className="text-lg font-semibold text-darkest mb-3">Overview</h2>
          <div className="flex gap-6">
            <div className="flex-1">
              <h3 className="text-md text-text">Total Users</h3>
              <p className="text-xl font-semibold text-darkest">{totalUsers}</p>
            </div>
            <div className="flex-1">
              <h3 className="text-md text-text">Average PHQ-9 Score</h3>
              <p className="text-xl font-semibold text-darkest">{averageScore}</p>
            </div>
          </div>
        </div>

        {/* Chart Type Toggle */}
        <div className="flex justify-between items-center mb-5">
            <button
              onClick={() => setChartType('line')}
              className={`px-4 py-2 rounded-lg ${chartType === 'line' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}
            >
              Line Chart
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-4 py-2 rounded-lg ${chartType === 'bar' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}
            >
              Bar Chart
            </button>
        </div>

        {/* Chart Section */}
        <div className="bg-lightest rounded-lg p-5 shadow-md mb-5">
            <h2 className="text-lg font-semibold text-darkest mb-3">PHQ-9 Scores</h2>
            {chartType === 'line' ? (
                <Line data={chartData} options={{ responsive: true }} />
            ) : (
                <Bar data={barChartData} options={{
                    indexAxis: 'y', // Make it a horizontal bar chart
                    responsive: true,
                    scales: {
                      x: {
                        title: {
                          display: true,
                          text: 'Number of Kids'
                        }
                      },
                      y: {
                        title: {
                          display: true,
                          text: 'PHQ-9 Scores'
                        }
                      }
                    }
                  }} />
            )}
        </div>

        {/* Additional Analytics or Details */}
        <div className="bg-lightest rounded-lg p-5 shadow-md">
          <h2 className="text-lg font-semibold text-darkest mb-3">Details</h2>
          <p className="text-text">
            This page shows the PHQ-9 ratings for all kids who used the bot. Use the graph above to see the trends in mood ratings.
            You can also export this data for further analysis by clicking the Export Data button.
          </p>
        </div>
      </div>
    </div>
    </Layout>
  );
};

export default AnalyticsPage;
