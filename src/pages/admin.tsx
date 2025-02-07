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
interface PHQData {
  name: string;
  phqScore: number;
  bdiScore: number;
  count: number;
  phq9Categories: Record<string, string>;
  gender: string;
  grade: string;
}
const AnalyticsPage = () => {
  const [synopsis, setSynopsis] = useState('Loading synopsis...');
  const [userSynopsis, setUserSynopsis] = useState('');
  const [selectedUser, setSelectedUser] = useState('');

  const [phqData] = useState<PHQData[]>(() => {
    if (!userSessions || userSessions.length === 0) {
      console.warn('No user sessions available');
      return [];
    }

    // Aggregate data to ensure uniqueness and compute averages
    const userMap = userSessions.reduce((acc: Record<string, PHQData>, session: { user: string; scores: { phq9_score: string; bdi_score: string; phq9_categories: Record<string, string>; gender: string; grade: string; }; }) => {
      const name = session.user.split(':')[1];
      const phqScore = parseInt(session.scores.phq9_score, 10);
      const bdiScore = parseInt(session.scores.bdi_score, 10);
      const phq9Categories: { [key: string]: string } = session.scores.phq9_categories;
      const gender = session.scores.gender;
      const grade = session.scores.grade;
  
      if (!acc[name]) {
        acc[name] = {
          name,
          phqScore: 0,
          bdiScore: 0,
          count: 0,
          phq9Categories: {},
          gender,
          grade,
        };
      }
  
      // Sum up scores
      acc[name].phqScore += phqScore;
      acc[name].bdiScore += bdiScore;
      acc[name].count += 1;
  
      // Sum up phq9Categories values
      for (const key in phq9Categories) {
        if (!acc[name].phq9Categories[key]) {
          acc[name].phq9Categories[key] = "0";
        }
        acc[name].phq9Categories[key] = (parseInt(acc[name].phq9Categories[key], 10) + (parseInt(phq9Categories[key], 10) || 0)).toString();
      }
  
      return acc;
    }, {});
  
    // Calculate the averages for phqScore, bdiScore, and phq9Categories
    return Object.values(userMap).map(user => ({
      name: user.name,
      phqScore: Math.round(user.phqScore / user.count), // Average phqScore
      bdiScore: Math.round(user.bdiScore / user.count), // Average bdiScore
      count: user.count, // Include count property
      phq9Categories: Object.fromEntries(
        Object.entries(user.phq9Categories).map(([key, value]) => [
          key, 
          Math.round(parseInt(value, 10) / user.count).toString() // Average phq9Categories values
        ])
      ),
      gender: user.gender,
      grade: user.grade,
    }));
  });
  
  const studentData = (name: string): PHQData[] => {
    const data: PHQData[] = userSessions
      .filter((session) => session.user.split(':')[1] === name)
      .map((session) => ({
        name: session.user.split(':')[1],
        phqScore: parseInt(session.scores.phq9_score, 10),
        bdiScore: parseInt(session.scores.bdi_score, 10),
        phq9Categories: session.scores.phq9_categories,
        gender: session.scores.gender,
        grade: session.scores.grade,
        count: 1,
      }));
    return data;
  };

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
      const response = await fetch('/api/synopsis', {
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

  const generateRandomColor = () => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r}, ${g}, ${b})`;
  }

  type FilterFunction = (user: PHQData, group: string) => boolean;

  const generatePHQ9BarChartData = (groups: string[], filterFn: FilterFunction): Record<string, number[]> => {
    const phq9BarChartData: { [key: string]: number[] } = {};

    groups.forEach(group => {
      const users = phqData.filter(user => filterFn(user, group));
  
      phq9BarChartData[`${group}`] = [
        users.reduce((acc, user) => acc + parseInt(String(user.phq9Categories.confused || 0), 10), 0),
        users.reduce((acc, user) => acc + parseInt(String(user.phq9Categories.angry || 0), 10), 0),
        users.reduce((acc, user) => acc + parseInt(String(user.phq9Categories.despair || 0), 10) + parseInt(String(user.phq9Categories.hopelessness || 0), 10), 0),
        users.reduce((acc, user) => acc + parseInt(String(user.phq9Categories.disconnected || 0), 10), 0),
        users.reduce((acc, user) => acc + parseInt(String(user.phq9Categories.exhausted || 0), 10), 0)
      ];
      
      // calculate average
      // phq9BarChartData[`${group}`].map((val, index) => phq9BarChartData[`${group}`][index] = (phq9BarChartData[`${group}`][index]/users.length))

      phq9BarChartData[`${group}`].map((val, index) => phq9BarChartData[`${group}`][index] = phq9BarChartData[`${group}`][index]*100);
    });
    return phq9BarChartData;
  };

  const phq9DataChartDataForSchool = ['confused', 'angry', 'despair', 'disconnected', 'exhausted', 'hopelessness']
    .map((key) => ({
      label: key,
      data: phqData.map(item => parseInt(item.phq9Categories[key] || "0", 10).toString()),
      borderColor: generateRandomColor(),
      backgroundColor: `${generateRandomColor()}80`,
      pointBackgroundColor: generateRandomColor(),
      fill: false,
      tension: 0.4
    }));
 
  const studentsWithMultipleSessions = phqData.filter(user => user.count > 1)
        .map((item: { name: string}) => ({
          label: item.name,
          data: studentData(item.name).map((item: { phqScore: number; }) => item.phqScore),
          borderColor: generateRandomColor(),
          backgroundColor: `${generateRandomColor()}80`,
          pointBackgroundColor: generateRandomColor(),
          fill: false,
          tension: 0.4
  }));
  




  const driftData = {
    labels: ['1','2','3,','4','5','6','7'],
    datasets: studentsWithMultipleSessions
  };


  const phq9BarChartDataByGender = generatePHQ9BarChartData(['Male', 'Female'], (user, gender) => user.gender===gender);
  const phq9BarChartDataByGrade = generatePHQ9BarChartData(['9', '10', '11', '12'], (user, grade) => user.grade===grade);
  const phq9BarChartDataForSchool = generatePHQ9BarChartData(['1'], () => true);
  const phq9BarChartForSchool = {
    labels: ['Confusion', 'Agressive Behaviors', 'Hopelessness', 'Anhedonia (Loss of Interest)', 'Fatigue and Sleep Disturbances'],
    datasets: [
      {
        label: 'Emotional Categrories',
        data: phq9BarChartDataForSchool['1'],
        backgroundColor: 'rgba(89, 153, 171, 0.7)',
        borderColor: '#5999ab',
        borderWidth: 1
      }
    ]
  };
  const phq9BarChartByGender = {
    labels: ['Confusion', 'Agressive Behaviors', 'Hopelessness', 'Anhedonia (Loss of Interest)', 'Fatigue and Sleep Disturbances'],
    datasets: [
      {
        label: 'Boys',
        data: phq9BarChartDataByGender['Male'],
        backgroundColor: 'rgba(89, 153, 171, 0.7)',
        borderColor: '#5999ab',
        borderWidth: 1
      },
      {
        label: 'Girls',
        data: phq9BarChartDataByGender['Female'],
        backgroundColor: 'rgba(171, 89, 89, 0.3)',
        borderColor: '#ab5959',
        borderWidth: 1
      }         
    ]
  };

  const phq9BarChartByGrade = {
    labels: ['Confusion', 'Agressive Behaviors', 'Hopelessness', 'Anhedonia (Loss of Interest)', 'Fatigue and Sleep Disturbances'],
    datasets: [
      {
        label: '9',
        data: phq9BarChartDataByGrade['9'],
        backgroundColor: 'rgba(15, 103, 128, 0.7)',
        borderColor: '#2c5f66',
        borderWidth: 1
      },
      {
        label: '10',
        data: phq9BarChartDataByGrade['10'],
        backgroundColor: 'rgba(195, 201, 130, 0.7)',
        borderColor: '#1f4d57',
        borderWidth: 1
      },
      {
        label: '11',
        data: phq9BarChartDataByGrade['11'],
        backgroundColor: 'rgba(171, 89, 130, 0.7)',
        borderColor: '#17434a',
        borderWidth: 1
      },
      {
        label: '12',
        data: phq9BarChartDataByGrade['12'],
        backgroundColor: 'rgba(54, 34, 166, 0.7)',
        borderColor: '#0d3840',
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
                <h2 className="text-lg font-semibold text-darkest mb-3">Emotional Comparison</h2>
                <Line data={{
                    labels: phqData.map((val, index) => "#" + index),
                    datasets: phq9DataChartDataForSchool
                }} options={{ responsive: true }} />
              </div>

              {/* Bar Chart */}
              <div className="flex-1 min-w-[45%]">
                <h2 className="text-lg font-semibold text-darkest mb-3">PHQ9 Distribution By Gender</h2>
                <Bar
                  data={phq9BarChartByGender}
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
                          text: 'Average Score',
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

            <div className="flex flex-wrap justify-between gap-4 bg-lightest rounded-lg p-5 shadow-md mb-5">
              {/* Line Chart */}
              <div className="flex-1 min-w-[45%]">
                <h2 className="text-lg font-semibold text-darkest mb-3">Emotional Comparison</h2>
                <Line data={{
                    labels: phqData.map((val, index) => "#" + index),
                    datasets: phq9DataChartDataForSchool
                }} options={{ responsive: true }} />
              </div>
              {/* Line Chart */}
              <div className="flex-1 min-w-[45%]">
                <h2 className="text-lg font-semibold text-darkest mb-3">Emotional Categories Distribution</h2>
                <Bar
                  data={phq9BarChartForSchool}
                  options={{
                    indexAxis: 'x',
                    responsive: true,
                    scales: {
                      x: {
                        min: 0,
                        max: 11,
                        ticks: {
                          stepSize: 1,
                        },
                      },
                      y: {
                        title: {
                          display: true,
                          text: 'PHQ-9 Scores',
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

            <div className="flex flex-wrap justify-between gap-4 bg-lightest rounded-lg p-5 shadow-md mb-5">
              {/* Line Chart */}
              <div className="flex-1 min-w-[45%]">
                <h2 className="text-lg font-semibold text-darkest mb-3">Linguistic Drift</h2>
                <Line data={driftData} options={{ 
                  responsive: true,
                  plugins: {
                      title: {
                          display: true,
                          text: 'PHQ-9 Scores Over Time'
                      },
                      tooltip: {
                          mode: 'index',
                          intersect: false
                      }
                  },
                  scales: {
                      x: {
                          title: {
                              display: true,
                              text: 'Number of Sessions' // Text for the x-axis
                          }
                      },
                      y: {
                          title: {
                              display: true,
                              text: 'PHQ-9 Score' // Text for the y-axis
                          },
                          min: 0, 
                          max: 40 // Adjust according to expected PHQ-9 score range
                      }
                  }
                 }} />
              </div>

              {/* Bar Chart */}
              <div className="flex-1 min-w-[45%]">
                <h2 className="text-lg font-semibold text-darkest mb-3">PHQ9 Distribution By Grades</h2>
                <Bar
                  data={phq9BarChartByGrade}
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
                          text: 'Average Score',
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
