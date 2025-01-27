import React, { useEffect, useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { CategoryScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, LinearScale } from 'chart.js';
import Chart from 'chart.js/auto';
import Layout from '@/layout';
import { userSessions } from '@/data/store';
import ChatHeader from '@/components/header';
import { readChatResponse } from '@/utils/util';

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
  const [synopsis, setSynopsis] = useState('Loading synopsis...');
  const [userSynopsis, setUserSynopsis] = useState('');
  const [selectedUser, setSelectedUser] = useState('');

  const [phqData] = useState(() => {
    if (!userSessions || userSessions.length === 0) {
      console.warn('No user sessions available');
      return [];
    }
    return userSessions.map((session) => ({
      name: session.user.split(':')[1],
      phqScore: parseInt(session.scores.phq9_score, 10),
      bdiScore: parseInt(session.scores.bdi_score, 10)
    }));
  });
  const totalUsers = phqData.length;
  const averagePHQScore = (phqData.reduce((acc, item) => acc + item.phqScore, 0) / totalUsers || 0).toFixed(2);
  const averageBDIScore = (phqData.reduce((acc, item) => acc + item.bdiScore, 0) / totalUsers || 0).toFixed(2);

  useEffect(() => {
    const fetchSynopsis = async () => {
      try {
        const response = await fetch('/api/synopsis', {
          method: 'POST',
          body: JSON.stringify({ phqScore: averagePHQScore, bdiScore: averageBDIScore}),
        });
        const reader = response.body?.getReader();
        const chatText = await readChatResponse(reader); 
        setSynopsis(chatText);
      } catch (error) {
        console.error('Error fetching synopsis:', error);
        setSynopsis('Error fetching synopsis.');
      }
    };

    fetchSynopsis();
  }, []);
  
  const handleUserChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const userName = event.target.value;
    setSelectedUser(userName);

    try {
      const response = await fetch('/api/synopsis1', {
        method: 'POST',
        body: JSON.stringify({ name: userName}),
      });
      const reader = response.body?.getReader();
      const chatText = await readChatResponse(reader); 
      setUserSynopsis(chatText);
    } catch (error) {
      console.error('Error fetching synopsis:', error);
      setSynopsis('Error fetching synopsis.');
    }
  };

  const chartData = {
    labels: phqData.map(item => item.name),
    datasets: [
      {
        label: 'PHQ-9 Scores',
        data: phqData.map(item => item.phqScore),
        borderColor: '#5999ab',
        backgroundColor: 'rgba(89, 153, 171, 0.3)',
        pointBackgroundColor: '#5999ab',
        fill: true,
        tension: 0.4
      },
      {
        label: 'BDI Scores',
        data: phqData.map(item => item.bdiScore),
        borderColor: '#ab5959',
        backgroundColor: 'rgba(171, 89, 89, 0.3)',
        pointBackgroundColor: '#ab5959',
        fill: true,
        tension: 0.4
      }
    ]
  };
  const mildCount:number = phqData.filter(user => user.phqScore < 14).length;
  const moderateCount:number = phqData.filter(user => user.phqScore >= 14 && user.phqScore < 20).length;
  const severeCount:number = phqData.filter(user => user.phqScore >= 20).length;
  const barChartData = {
    labels: ['Mild', 'Moderate', 'Severe'],
    datasets: [
      {
        label: 'Boys',
        data: [mildCount, moderateCount, severeCount],
        backgroundColor: 'rgba(89, 153, 171, 0.7)',
        borderColor: '#5999ab',
        borderWidth: 1
      },
      {
        label: 'Girls',
        data: [mildCount, moderateCount, severeCount],
        borderColor: '#ab5959',
        backgroundColor: 'rgba(171, 89, 89, 0.3)',
        borderWidth: 1
      }
    ]
  };

  const handleExport = () => {
    const csvData = phqData.map(item => `$${item.name},${item.phqScore},${item.bdiScore}`).join('\n');
    const blob = new Blob([`ID,Name,PHQ-9 Score,BDI Score\n${csvData}`], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'analytics_data.csv';
    link.click();
  };

  return (
    <Layout>
      <div className="flex flex-col h-screen bg-primary p-5">
        <div className="max-w-7xl mx-auto w-full flex flex-col flex-1" style={{ height: '100%' }}>
          <ChatHeader stars={0} level={0} profile={JSON.parse('{}')} messages={[]} />
          <div className="flex-1 bg-lightest rounded-lg p-5 overflow-y-auto mb-5" style={{ height: '100%' }}>
            <div className="bg-lightest rounded-lg p-5 shadow-md mb-6 flex gap-6">
              <div className="w-1/3">
                <h2 className="text-lg font-semibold text-darkest mb-3">Overview</h2>
                <div className="flex flex-col gap-4">
                  <div>
                    <h3 className="text-md text-text">Total Users</h3>
                    <p className="text-xl font-semibold text-darkest">{totalUsers}</p>
                  </div>
                  <div>
                    <h3 className="text-md text-text">Average PHQ-9 Score</h3>
                    <p className="text-xl font-semibold text-darkest">{averagePHQScore}</p>
                  </div>
                  <div>
                    <h3 className="text-md text-text">Average BDI Score</h3>
                    <p className="text-xl font-semibold text-darkest">{averageBDIScore}</p>
                  </div>
                </div>
              </div>

              <div className="w-2/3">
                <h2 className="text-lg font-semibold text-darkest mb-3">Synopsis</h2>
                <p className="text-text">
                  {synopsis}
                </p>
                <div className="mt-4">
                  <select
                    id="userDropdown"
                    className="px-4 py-2 border rounded-lg bg-lighter text-text focus:ring-2 focus:ring-[#5999ab]"
                    value={selectedUser}
                    onChange={handleUserChange}
                  >
                    <option value="" disabled>
                      Choose Student
                    </option>
                    {Array.from(
                      new Map(phqData.map((user) => [user.name, user])).values()
                    ).map((user) => (
                      <option key={user.name} value={user.name}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-text">
                    {userSynopsis}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-between gap-4 bg-lightest rounded-lg p-5 shadow-md mb-5">
              {/* Line Chart */}
              <div className="flex-1 min-w-[45%]">
                <h2 className="text-lg font-semibold text-darkest mb-3">Scores Comparison</h2>
                <Line data={chartData} options={{ responsive: true }} />
              </div>

              {/* Bar Chart */}
              <div className="flex-1 min-w-[45%]">
                <h2 className="text-lg font-semibold text-darkest mb-3">PHQ9 Distribution</h2>
                <Bar
                  data={barChartData}
                  options={{
                    indexAxis: 'x',
                    responsive: true,
                    scales: {
                      x: {
                        title: {
                          display: true,
                          text: 'PHQ-9 Bands',
                        },
                        min: 0,
                        max: 11,
                        ticks: {
                          stepSize: 1,
                        },
                      },
                      y: {
                        title: {
                          display: true,
                          text: 'Number of Users',
                        },
                        min: 0,
                        ticks: {
                          stepSize: 1,
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>


            <div className="bg-lightest rounded-lg p-5 shadow-md">
              <h2 className="text-lg font-semibold text-darkest mb-3">Details</h2>
              <p className="text-text">
                This page shows the PHQ-9 and BDI ratings for all users. Use the graph above to see the trends in mood ratings.
                You can also export this data for further analysis by clicking the Export Data button.
              </p>
            </div>
            <div className="flex justify-end mt-5">
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-green-500 text-white rounded-lg"
              >
                Export Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AnalyticsPage;
