import React, { useEffect, useContext } from 'react';
import { Context } from "../store/appContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';


const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];


export const TaskManager = () => {
  const { store, actions } = useContext(Context);
  const navigate = useNavigate();

  useEffect(() => {
    actions.getProjectProgress();
    actions.getTasksByStatus();
    actions.getStatusChangesByUser();
    actions.getProjectCompletionTime();
  }, []);


  return (
    <div className="container mt-4">
      <h1>Dashboard</h1>

      <div className="row mb-4">
        <div className="col-md-6">
          <h2>Project Progress</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={store.projectProgress}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="project_name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="progress" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="col-md-6">
          <h2>Tasks by Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={store.taskStatusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {store.taskStatusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-6">
          <h2>Status Changes by User</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={store.userProductivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="changes_count" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* <div className="col-md-6">
      <h2>Project Completion Time</h2>
      <div style={{ height: '300px', overflowY: 'auto' }}>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {store.projectCompletionTime.map((project, index) => (
              <tr key={index}>
                <td>{project.project_name}</td>
                <td>{project.completion_time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div> */}
        <div className="d-flex justify-content-between align-items-center mb-4">
            <button className="btn btn-secondary" onClick={() => navigate(-1)}>
              Return to Profile
            </button>
        </div>
      </div>
    </div>
  );
};