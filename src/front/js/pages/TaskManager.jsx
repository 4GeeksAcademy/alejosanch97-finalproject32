import React, { useEffect, useContext } from 'react';
import { Context } from "../store/appContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';


export const TaskManager = () => {
    const { store, actions } = useContext(Context);

  useEffect(() => {
    actions.getProjectProgress();
    actions.getTaskCompletionRate();
    actions.getTaskDistribution();
    actions.getUserProductivity();
    actions.getGanttData();
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

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
          <h2>Task Completion Rate</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={store.taskCompletionRate}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="rate" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-6">
          <h2>Task Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={Object.entries(store.taskDistribution).map(([key, value]) => ({ name: key, value }))}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {Object.entries(store.taskDistribution).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="col-md-6">
          <h2>User Productivity</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={store.userProductivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="user_name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="completed_tasks" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-12">
          <h2>Project Timeline (Gantt Chart)</h2>
          {/* Note: A full Gantt chart implementation is complex and may require a specialized library */}
          <p>Gantt chart would be displayed here.</p>
        </div>
      </div>
    </div>
  );
};
