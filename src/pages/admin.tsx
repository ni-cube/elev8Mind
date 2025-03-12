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
  const [synopsis, setSynopsis] = useState('Loading summary...');
  const [userSynopsis, setUserSynopsis] = useState('');
  const [selectedUser, setSelectedUser] = useState('');

  const [phqData] = useState<PHQData[]>(() => {
    if (!userSessions || userSessions.length === 0) {
      console.warn('No user sessions available');
      return [];
    }
  
    // Aggregate data to ensure uniqueness and compute averages
    const userMap = userSessions.reduce((acc: Record<string, PHQData>, session) => {
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
          gender: gender || '',
          grade: grade || '',
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
    }, {} as Record<string, PHQData>);
  
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
        gender: session.scores.gender || '',
        grade: session.scores.grade || '',
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
      phq9BarChartData[`${group}`].map((val, index) => phq9BarChartData[`${group}`][index] = (phq9BarChartData[`${group}`][index]/users.length))

      //phq9BarChartData[`${group}`].map((val, index) => phq9BarChartData[`${group}`][index] = phq9BarChartData[`${group}`][index]*100);
    });
    return phq9BarChartData;
  };
 
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
    labels: ['1','2','3','4','5','6','7'],
    datasets: studentsWithMultipleSessions
  };

  const phq9BarChartDataForSchool = generatePHQ9BarChartData(['1'], () => true);
  const phq9BarChartForSchool = {
    labels: ['Confusion', 'Agressive Behaviors', 'Hopelessness', 'Anhedonia (Loss of Interest)', 'Fatigue and Sleep Disturbances'],
    datasets: [
      {
        label: 'Emotional Categrories',
        data: phq9BarChartDataForSchool['1'],
        backgroundColor: 'rgba(8, 54, 67, 1)',
        borderColor: '#rgba(8, 54, 67, 0.7)',
        borderWidth: 1
      }
    ]
  };




  const generatePHQ9StackedBarChartData = () => {
    const phq9BarChartData: { [key: string]: { total: number; boys: number; girls: number }[] } = {};
    const grades: string[] = ['9', '10', '11', '12'];

    grades.forEach(grade => {
      const users = phqData.filter(user => user.grade===grade);
      const boys = users.filter(user => user.gender=="Male");
      const girls = users.filter(user => user.gender=="Female");
      phq9BarChartData[`${grade}`] = [
        {
          total: users.reduce((acc, user) => acc + parseInt(String(user.phq9Categories.confused || 0), 10), 0)/users.length,
          boys: boys.reduce((acc, user) => acc + parseInt(String(user.phq9Categories.confused || 0), 10), 0)/users.length,
          girls: girls.reduce((acc, user) => acc + parseInt(String(user.phq9Categories.confused || 0), 10), 0)/users.length
        },
        {
          total: users.reduce((acc, user) => acc + parseInt(String(user.phq9Categories.angry || 0), 10), 0)/users.length,
          boys: boys.reduce((acc, user) => acc + parseInt(String(user.phq9Categories.angry || 0), 10), 0)/users.length,
          girls: girls.reduce((acc, user) => acc + parseInt(String(user.phq9Categories.angry || 0), 10), 0)/users.length
        },
        {
          total: users.reduce((acc, user) => acc + parseInt(String(user.phq9Categories.despair || 0), 10) + parseInt(String(user.phq9Categories.hopelessness || 0), 10), 0)/users.length,
          boys: boys.reduce((acc, user) => acc + parseInt(String(user.phq9Categories.despair || 0), 10) + parseInt(String(user.phq9Categories.hopelessness || 0), 10), 0)/users.length,
          girls: girls.reduce((acc, user) => acc + parseInt(String(user.phq9Categories.despair || 0), 10) + parseInt(String(user.phq9Categories.hopelessness || 0), 10), 0)/users.length
        },
        {
          total: users.reduce((acc, user) => acc + parseInt(String(user.phq9Categories.disconnected || 0), 10), 0)/users.length,
          boys: boys.reduce((acc, user) => acc + parseInt(String(user.phq9Categories.disconnected || 0), 10), 0)/users.length,
          girls: girls.reduce((acc, user) => acc + parseInt(String(user.phq9Categories.disconnected || 0), 10), 0)/users.length
        },
        {
          total: users.reduce((acc, user) => acc + parseInt(String(user.phq9Categories.exhausted || 0), 10), 0)/users.length,
          boys: boys.reduce((acc, user) => acc + parseInt(String(user.phq9Categories.exhausted || 0), 10), 0)/users.length,
          girls: girls.reduce((acc, user) => acc + parseInt(String(user.phq9Categories.exhausted || 0), 10), 0)/users.length
        }
      ];
    });
    return phq9BarChartData;
  };

  const phq9BarChartByGender = {
    labels: ['Confusion', 'Agressive Behaviors', 'Hopelessness', 'Anhedonia (Loss of Interest)', 'Fatigue and Sleep Disturbances'],
    datasets: [
      {
        label: 'Boys',
        data: generatePHQ9StackedBarChartData()['9'].map((entry, index) => entry.boys + generatePHQ9StackedBarChartData()['10'][index].boys 
          + generatePHQ9StackedBarChartData()['11'][index].boys + generatePHQ9StackedBarChartData()['12'][index].boys),
        backgroundColor: 'rgba(8, 54, 67, 1)',
        borderColor: '#2c5f66',
        borderWidth: 1
      },
      {
        label: 'Girls',
        data: generatePHQ9StackedBarChartData()['9'].map((entry, index) => entry.girls + generatePHQ9StackedBarChartData()['10'][index].girls 
          + generatePHQ9StackedBarChartData()['11'][index].girls + generatePHQ9StackedBarChartData()['12'][index].girls),
        backgroundColor: 'rgba(171, 89, 130, 1)',
        borderColor: 'rgba(171, 89, 130, 0.7)',
        borderWidth: 1
      }         
    ]
  };

  const phq9BarChartByGrade = {
    labels: ['Confusion', 'Agressive Behaviors', 'Hopelessness', 'Anhedonia (Loss of Interest)', 'Fatigue and Sleep Disturbances'],
    datasets: [
      {
        label: '9',
        data: generatePHQ9StackedBarChartData()['9'].map((entry) => entry.total),
        backgroundColor: 'rgba(8, 54, 67, 1)',
        borderColor: '#2c5f66',
        borderWidth: 1
      },
      {
        label: '10',
        data: generatePHQ9StackedBarChartData()['10'].map((entry) => entry.total),
        backgroundColor: 'rgba(195, 201, 130, 0.7)',
        borderColor: '#1f4d57',
        borderWidth: 1
      },
      {
        label: '11',
        data: generatePHQ9StackedBarChartData()['11'].map((entry) => entry.total),
        backgroundColor: 'rgba(171, 89, 130, 1)',
        borderColor: '#17434a',
        borderWidth: 1
      },
      {
        label: '12',
        data: generatePHQ9StackedBarChartData()['12'].map((entry) => entry.total),
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


  // Example processed data
const rawData = {
  labels: ['Confusion', 'Agressive Behaviors', 'Hopelessness', 'Anhedonia (Loss of Interest)', 'Fatigue and Sleep Disturbances'],
  datasets: [
    {
      label: "9",
      data: generatePHQ9StackedBarChartData()['9']
    },
    {
      label: "10",
      data: generatePHQ9StackedBarChartData()['10']
    },
    {
      label: "11",
      data: generatePHQ9StackedBarChartData()['11']
    },
    {
      label: "12",
      data: generatePHQ9StackedBarChartData()['12']
    },    
  ],
};

const labels = rawData.labels; // PHQ9 categories for X-axis

const datasets: Array<{
  label: string;
  data: number[];
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  stack: string;
}> = [];

rawData.datasets.forEach((grade) => {
  datasets.push({
    label: `${grade.label} - Boys`,
    data: grade.data.map((entry) => entry.boys),
    backgroundColor: 'rgba(8, 54, 67, 1)', // Blue for Boys
    borderColor: "rgba(8, 54, 67, 0.7)",
    borderWidth: 1,
    stack: grade.label, // Ensures boys & girls are stacked within the same grade
  });

  datasets.push({
    label: `${grade.label} - Girls`,
    data: grade.data.map((entry) => entry.girls),
    backgroundColor: "rgba(171, 89, 130, 1)", // Pink for Girls
    borderColor: "rgba(171, 89, 130, 0.7)",
    borderWidth: 1,
    stack: grade.label, // Ensures boys & girls are stacked within the same grade
  });
});

const stackedChartData = {
  labels,
  datasets,
};

  return (
    <Layout>
      <div className="flex flex-col h-screen bg-primary p-5">
        <div className="max-w-7xl mx-auto w-full flex flex-col flex-1" style={{ height: '100%' }}>
          <ChatHeader stars={0} level={0} profile={JSON.parse('{}')} messages={[]} />
          <div className="flex-1 bg-lightest rounded-lg p-5 overflow-y-auto mb-5" style={{ height: '100%' }}>
            <div className="bg-lightest rounded-lg p-5 shadow-md mb-6 flex gap-6">
              <div className="w-1/3">
                <h2 className="text-lg font-bold text-darkest mb-3">Overview</h2>
                <div className="flex flex-col gap-4">
                  <div>
                    <h3 className="text-md text-darkest">Total Users</h3>
                    <p className="text-xl font-bold text-darkest">{totalUsers}</p>
                  </div>
                  <div>
                    <h3 className="text-md text-darkest">Average PHQ-9 Score</h3>
                    <p className="text-xl font-bold text-darkest">{averagePHQScore}</p>
                  </div>
                  <div>
                    <h3 className="text-md text-darkest">Average BDI Score</h3>
                    <p className="text-xl font-bold text-darkest">{averageBDIScore}</p>
                  </div>
                </div>
              </div>

              <div className="w-2/3">
                <h2 className="text-lg font-bold text-darkest mb-3">Summary</h2>
                <p className="text-darkest">
                  {synopsis}
                </p>
                <div className="mt-4">
                  <select
                    id="userDropdown"
                    className="px-4 py-2 border rounded-lg bg-lighter text-darkest focus:ring-2 focus:ring-[#5999ab]"
                    value={selectedUser}
                    onChange={handleUserChange}
                  >
                    <option value="" disabled>
                      Options...
                    </option>
                    {Array.from(
                      new Map(phqData.map((user) => [user.name, user])).values()
                    ).map((user) => (
                      <option key={user.name} value={user.name}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-darkest">
                    {userSynopsis}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-between gap-4 rounded-lg p-5 shadow-md mb-5">
              <div className="w-full sm:w-[45%] bg-white">
                <h2 className="text-lg font-bold bg-lightest text-darkest mb-3">Emotional Comparison</h2>
                <div className="h-full sm:h-[300px]">
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
                            color: "rgba(8, 54, 67, 1)", // Darker tick labels
                            font: {
                              size: 14,
                              weight: 'bold',
                            }
                          },
                        },
                        y: {
                          title: {
                            display: true,
                            text: 'PHQ9-BDI Scores',
                            color: "rgba(8, 54, 67, 1)",
                            font: {
                              size: 14,
                              weight: 'bold',
                            },
                          },
                          min: 0,
                          ticks: {
                            color: "rgba(8, 54, 67, 1)", // Darker tick labels
                            font: {
                              size: 12,
                              weight: 'bold',
                            },
                          },
                        },
                        
                      },
                    }}
                  />
                 </div>
              </div>


              {/* Line Chart */}
              <div className="w-full sm:w-[45%] bg-white">
                <h2 className="text-lg bg-lightest font-bold text-darkest mb-3">Linguistic Drift</h2>
                <div className="h-[300px] sm:h-[400px]">
                  <Line data={driftData} options={{ 
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'PHQ-9 Scores Over Time',
                            color: "rgba(8, 54, 67, 1)",
                            font: {
                              size: 14,
                              weight: 'bold',
                            }
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
                                text: 'Number of Sessions',
                                color: "rgba(8, 54, 67, 1)",
                                font: {
                                  size: 14,
                                  weight: 'bold',
                                }
                            },
                            ticks: {
                              color: "rgba(8, 54, 67, 1)", // Darker tick labels
                              font: {
                                size: 14,
                                weight: 'bold',
                              }
                            },
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'PHQ9-BDI Scores',
                                color: "rgba(8, 54, 67, 1)",
                                font: {
                                  size: 14,
                                  weight: 'bold',
                                }
                            },
                            min: 0, 
                            max: 40,
                            ticks: {
                              color: "rgba(8, 54, 67, 1)", // Darker tick labels
                              font: {
                                size: 14,
                                weight: 'bold',
                              }
                            },
                        }
                    }
                  }} />
                 </div>
              </div>
            </div>


            <div className="flex flex-wrap justify-between gap-4 rounded-lg p-5 shadow-md mb-5">
              {/* Bar Chart */}
              <div className="w-full sm:w-[45%] bg-white">
                <h2 className="text-lg bg-lightest font-bold text-darkest mb-3">PHQ9-BDI Distribution By Gender</h2>
                <div className="h-[300px] sm:h-[400px]">
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
                            color: "rgba(8, 54, 67, 1)",
                            font: {
                              size: 14,
                              weight: 'bold',
                            }
                          },
                          min: 0,
                          max: 11,
                          ticks: {
                            color: "rgba(8, 54, 67, 1)", // Darker tick labels
                            font: {
                              size: 14,
                              weight: 'bold',
                            }
                          },
                        },
                        y: {
                          title: {
                            display: true,
                            text: 'Average Score',
                            color: "rgba(8, 54, 67, 1)",
                            font: {
                              size: 14,
                              weight: 'bold',
                            }
                          },
                          min: 0,
                          ticks: {
                            color: "rgba(8, 54, 67, 1)", // Darker tick labels
                            font: {
                              size: 14,
                              weight: 'bold',
                            }
                          },
                        },
                      },
                    }}
                  />
                </div>  
              </div>

              {/* Bar Chart */}
              <div className="w-full sm:w-[45%] bg-white">
                <h2 className="text-lg font-bold bg-lightest text-darkest mb-3">PHQ9-BDI Distribution By Grades</h2>
                <div className="h-[300px] sm:h-[400px]">
                  <Bar
                    data={phq9BarChartByGrade}
                    options={{
                      indexAxis: 'x',
                      responsive: true,
                      scales: {
                        x: {
                          title: {
                            display: true,
                            text: 'PHQ9-BDI Bands',
                            color: "rgba(8, 54, 67, 1)",
                            font: {
                              size: 14,
                              weight: 'bold',
                            }
                          },
                          min: 0,
                          max: 11,
                          ticks: {
                            color: "rgba(8, 54, 67, 1)", // Darker tick labels
                            font: {
                              size: 14,
                              weight: 'bold',
                            }
                          },
                        },
                        y: {
                          title: {
                            display: true,
                            text: 'Average Scores',
                            color: "rgba(8, 54, 67, 1)",
                            font: {
                              size: 14,
                              weight: 'bold',
                            }
                          },
                          min: 0,
                          ticks: {
                            color: "rgba(8, 54, 67, 1)", // Darker tick labels
                            font: {
                              size: 14,
                              weight: 'bold',
                            }
                          },
                        },
                      },
                    }}
                  />
                </div>  
              </div>
            </div>



            <div className="flex flex-wrap justify-between gap-4 rounded-lg p-5 shadow-md mb-5">
    
              
              {/* Bar Chart */}
              <div className="flex-1 bg-white min-w-[100%]">
                <h2 className="text-lg font-bold bg-lightest text-darkest mb-3">PHQ9-BDI Distribution By Grades & Gender</h2>
                <Bar
                  data={stackedChartData}
                  options={{
                    responsive: true,
                    scales: {
                      x: {
                        stacked: false, // Ensures Grade 9 & Grade 10 bars are side-by-side
                        title: {
                          display: true,
                          text: "PHQ9-BDI Categories",
                          color: "rgba(8, 54, 67, 1)",
                          font: {
                            size: 14,
                            weight: 'bold',
                          }
                        },
                        ticks: {
                          color: "rgba(8, 54, 67, 1)", // Darker tick labels
                          font: {
                            size: 14,
                            weight: 'bold',
                          },
                        },
                      },
                      y: {
                        stacked: true, // Ensures Boys & Girls are stacked within each Grade bar
                        title: {
                          display: true,
                          text: "Average Score",
                          color: "rgba(8, 54, 67, 1)",
                          font: {
                            size: 14,
                            weight: 'bold',
                          },
                        },
                        ticks: {
                          color: "rgba(8, 54, 67, 1)", // Darker tick labels
                          font: {
                            size: 14,
                            weight: 'bold',
                          },
                        },
                      },
                    },
                    plugins: {
                      legend: {
                        position: "top",
                      },
                    },
                  }}
                />
              </div>
            </div>


            <div className="bg-lightest rounded-lg p-5 shadow-md">
              <h2 className="text-lg font-bold text-darkest mb-3">Details</h2>
              <p className="text-darkest">
                This page shows the PHQ-9 and BDI ratings for all users. Use the graph above to see the trends in mood ratings.
                You can also export this data for further analysis by clicking the Export Data button.
              </p>
            </div>
            <div className="flex justify-end mt-5">
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-darker text-white rounded-lg"
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
