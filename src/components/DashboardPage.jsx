import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Doughnut, Bar, Line } from "react-chartjs-2";
import { motion } from "framer-motion";
import {
  FiTrendingUp,
  FiBarChart2,
  FiCheckCircle,
  FiBell,
  FiActivity,
  FiPlusSquare,
  FiFileText,
  FiUsers,
  FiDownload,
} from "react-icons/fi";
import CalendarView from "./CalendarView";

export default function DashboardPage({ assignments = [] }) {
  const navigate = useNavigate();

  const summary = useMemo(() => {
    const status = { Submitted: 0, Pending: 0, Late: 0 };
    const subjects = {};
    const upcoming = [];
    const recent = [...assignments].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 6);
    const students = {};

    assignments.forEach((assignment) => {
      const statusKey = assignment.status || "Pending";
      status[statusKey] = (status[statusKey] || 0) + 1;

      const subjectKey = assignment.subject || "Uncategorized";
      subjects[subjectKey] = (subjects[subjectKey] || 0) + 1;

      const studentName = assignment.student || "Student";
      if (!students[studentName]) {
        students[studentName] = { student: studentName, total: 0, submitted: 0, pending: 0, late: 0 };
      }
      students[studentName].total += 1;
      students[studentName][statusKey.toLowerCase()] += 1;

      const due = assignment.dueDate ? new Date(assignment.dueDate) : null;
      if (due) {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const diff = Math.round((due - now) / (1000 * 60 * 60 * 24));
        if (diff >= 0 && diff <= 7) {
          upcoming.push({ ...assignment, days: diff });
        }
      }
    });

    const progress = assignments.length ? Math.round((status.Submitted / assignments.length) * 100) : 0;
    const lateRate = assignments.length ? Math.round((status.Late / assignments.length) * 100) : 0;
    const studentPerformance = Object.values(students).map((student) => ({
      ...student,
      completionRate: student.total ? Math.round((student.submitted / student.total) * 100) : 0,
    }));

    return {
      status,
      subjects,
      upcoming,
      recent,
      progress,
      lateRate,
      studentPerformance,
    };
  }, [assignments]);

  const topStudents = useMemo(
    () => summary.studentPerformance.sort((a, b) => b.completionRate - a.completionRate).slice(0, 5),
    [summary.studentPerformance]
  );

  const pendingStudents = useMemo(
    () => summary.studentPerformance.filter((student) => student.pending > 0).slice(0, 5),
    [summary.studentPerformance]
  );

  const subjectChart = useMemo(
    () => ({
      labels: Object.keys(summary.subjects),
      datasets: [
        {
          label: "Assignments by subject",
          data: Object.values(summary.subjects),
          backgroundColor: ["#60a5fa", "#f97316", "#10b981", "#a855f7", "#facc15", "#38bdf8"],
          borderRadius: 12,
        },
      ],
    }),
    [summary.subjects]
  );

  const statusChart = useMemo(
    () => ({
      labels: ["Submitted", "Pending", "Late"],
      datasets: [
        {
          data: [summary.status.Submitted, summary.status.Pending, summary.status.Late],
          backgroundColor: ["#22c55e", "#f59e0b", "#ef4444"],
          borderWidth: 0,
        },
      ],
    }),
    [summary.status]
  );

  const monthlyChart = useMemo(() => {
    const labels = [];
    const submitted = [];
    const pending = [];
    const late = [];
    const now = new Date();

    for (let i = 5; i >= 0; i -= 1) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(month.toLocaleDateString(undefined, { month: "short", year: "2-digit" }));
      const counters = { Submitted: 0, Pending: 0, Late: 0 };
      assignments.forEach((assignment) => {
        const due = assignment.dueDate ? new Date(assignment.dueDate) : null;
        if (!due) return;
        if (due.getFullYear() === month.getFullYear() && due.getMonth() === month.getMonth()) {
          counters[assignment.status || "Pending"] += 1;
        }
      });
      submitted.push(counters.Submitted);
      pending.push(counters.Pending);
      late.push(counters.Late);
    }

    return {
      labels,
      datasets: [
        { label: "Submitted", data: submitted, borderColor: "#22c55e", backgroundColor: "rgba(34, 197, 94, 0.18)", tension: 0.35, fill: true },
        { label: "Pending", data: pending, borderColor: "#f59e0b", backgroundColor: "rgba(245, 158, 11, 0.18)", tension: 0.35, fill: true },
        { label: "Late", data: late, borderColor: "#ef4444", backgroundColor: "rgba(239, 68, 68, 0.18)", tension: 0.35, fill: true },
      ],
    };
  }, [assignments]);

  const quickActions = [
    { icon: FiPlusSquare, title: "Add Assignment", action: () => navigate("/assignments") },
    { icon: FiFileText, title: "View Reports", action: () => navigate("/reports") },
    { icon: FiUsers, title: "Manage Students", action: () => navigate("/students") },
    { icon: FiDownload, title: "Export Data", action: () => navigate("/reports") },
  ];

  const activityItems = [
    { icon: FiPlusSquare, title: "Assignment Added", value: summary.recent.length },
    { icon: FiCheckCircle, title: "Assignment Submitted", value: summary.status.Submitted },
    { icon: FiFileText, title: "Assignment Updated", value: assignments.filter((a) => a.notes?.trim()).length },
    { icon: FiBell, title: "Assignment Alerts", value: summary.upcoming.length },
  ];

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero panel">
        <div className="hero-copy">
          <p className="eyebrow">Smart Assignment Management System</p>
          <h1>Smart Assignment Management System</h1>
          <p className="hero-description">Track, organize, and manage student assignments efficiently from one modern dashboard.</p>
          <div className="hero-actions">
            <button className="button-primary" onClick={() => navigate("/assignments")}>Add Assignment</button>
            <button className="button-secondary" onClick={() => navigate("/reports")}>View Reports</button>
            <button className="button-secondary" onClick={() => navigate("/students")}>Manage Students</button>
          </div>
        </div>
        <div className="hero-stats">
          <div className="hero-card">
            <span className="hero-card-label">Completion rate</span>
            <h2>{summary.progress}%</h2>
            <p>Steady improvements in student submissions.</p>
          </div>
          <div className="hero-card accent-card">
            <span className="hero-card-label">Upcoming deadlines</span>
            <h2>{summary.upcoming.length}</h2>
            <p>Assignments due in the next 7 days.</p>
          </div>
        </div>
      </section>

      <section className="summary-grid">
        <motion.article className="summary-card" layout whileHover={{ y: -4 }}>
          <div className="card-icon card-icon-blue"><FiTrendingUp /></div>
          <p>Total Assignments</p>
          <h2>{assignments.length}</h2>
          <span>{summary.progress}% completion rate</span>
        </motion.article>
        <motion.article className="summary-card" layout whileHover={{ y: -4 }}>
          <div className="card-icon card-icon-green"><FiCheckCircle /></div>
          <p>Submitted Assignments</p>
          <h2>{summary.status.Submitted}</h2>
          <span>{summary.status.Submitted ? `${Math.round((summary.status.Submitted / Math.max(assignments.length, 1)) * 100)}%` : "0%"}</span>
        </motion.article>
        <motion.article className="summary-card" layout whileHover={{ y: -4 }}>
          <div className="card-icon card-icon-orange"><FiBell /></div>
          <p>Pending Assignments</p>
          <h2>{summary.status.Pending}</h2>
          <span>{summary.upcoming.length} due soon</span>
        </motion.article>
        <motion.article className="summary-card" layout whileHover={{ y: -4 }}>
          <div className="card-icon card-icon-red"><FiBarChart2 /></div>
          <p>Overdue Assignments</p>
          <h2>{summary.status.Late}</h2>
          <span>{summary.lateRate}% overdue</span>
        </motion.article>
      </section>

      <section className="quick-actions-grid">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <motion.div key={action.title} className="quick-action-card" layout whileHover={{ y: -4 }} onClick={action.action}>
              <div className="quick-action-icon"><Icon /></div>
              <div>
                <p>{action.title}</p>
              </div>
            </motion.div>
          );
        })}
      </section>

      <section className="dashboard-grid">
        <motion.div className="panel chart-panel" layout>
          <div className="panel-header">
            <div>
              <p className="eyebrow">Progress Analytics</p>
              <h2>Submission Breakdown</h2>
            </div>
          </div>
          <div className="chart-block">
            <Doughnut data={statusChart} options={{ plugins: { legend: { position: "bottom" } } }} />
          </div>
        </motion.div>

        <motion.div className="panel chart-panel" layout>
          <div className="panel-header">
            <div>
              <p className="eyebrow">Subject Analytics</p>
              <h2>Assignments by Subject</h2>
            </div>
          </div>
          <div className="chart-block">
            <Bar data={subjectChart} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { beginAtZero: true } } }} />
          </div>
        </motion.div>
      </section>

      <section className="dashboard-grid dashboard-main-grid">
        <motion.div className="panel activity-panel" layout>
          <div className="panel-header">
            <div>
              <p className="eyebrow">Recent Activity</p>
              <h2>Latest Events</h2>
            </div>
          </div>
          <div className="activity-list">
            {activityItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="activity-row small">
                  <div className="activity-icon"><Icon /></div>
                  <div>
                    <p>{item.title}</p>
                    <strong>{item.value}</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div className="panel panel-list" layout>
          <div className="panel-header">
            <div>
              <p className="eyebrow">Upcoming Deadlines</p>
              <h2>Next 7 days</h2>
            </div>
          </div>
          {summary.upcoming.length === 0 ? (
            <div className="empty-state">No deadlines set for the next 7 days.</div>
          ) : (
            <ul className="deadline-list">
              {summary.upcoming.slice(0, 7).map((assignment) => (
                <li key={assignment.id || assignment.title}>
                  <div>
                    <strong>{assignment.title}</strong>
                    <p>{assignment.student} • {assignment.subject}</p>
                  </div>
                  <span>{assignment.days === 0 ? "Today" : `in ${assignment.days} day${assignment.days === 1 ? "" : "s"}`}</span>
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      </section>

      <section className="dashboard-grid calendar-stats-grid">
        <CalendarView assignments={assignments} />

        <motion.div className="panel student-performance" layout>
          <div className="panel-header">
            <div>
              <p className="eyebrow">Student Performance Overview</p>
              <h2>Top Performing Students</h2>
            </div>
          </div>
          <div className="student-list">
            {topStudents.length === 0 ? (
              <p className="empty-state">No student performance data available yet.</p>
            ) : (
              topStudents.map((student) => (
                <div key={student.student} className="student-row">
                  <div>
                    <p>{student.student}</p>
                    <span>{student.submitted} submitted</span>
                  </div>
                  <strong>{student.completionRate}%</strong>
                </div>
              ))
            )}
          </div>

          <div className="student-list alternate">
            <div className="panel-header small">
              <p className="eyebrow">Pending Assignments per Student</p>
            </div>
            {pendingStudents.length === 0 ? (
              <p className="empty-state">No pending assignment alerts yet.</p>
            ) : (
              pendingStudents.map((student) => (
                <div key={`${student.student}-pending`} className="student-row">
                  <div>
                    <p>{student.student}</p>
                    <span>{student.total} total</span>
                  </div>
                  <strong>{student.pending} pending</strong>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </section>
    </div>
  );
}
