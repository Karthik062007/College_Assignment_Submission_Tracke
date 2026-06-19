import React, { useEffect, useMemo, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import MenuBar from "./components/MenuBar";
import DashboardPage from "./components/DashboardPage";
import AssignmentsPage from "./components/AssignmentsPage";
import StudentsPage from "./components/StudentsPage";
import ReportsDetails from "./components/ReportsDetails";
import AssignmentModal from "./components/AssignmentModal";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Title
);

const STORAGE_KEY = "submissionTracker.assignments";
const THEME_KEY = "submissionTracker.theme";

const parseLocalDate = (value) => {
  if (!value) return null;
  const parts = value.split("-").map(Number);
  if (parts.length !== 3) return null;
  return new Date(parts[0], parts[1] - 1, parts[2], 23, 59, 59);
};

const formatDateForInput = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDaysUntil = (value) => {
  const due = parseLocalDate(value);
  if (!due) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueMidnight = new Date(due.getFullYear(), due.getMonth(), due.getDate(), 0, 0, 0);
  return Math.round((dueMidnight - today) / (1000 * 60 * 60 * 24));
};

const normalizeAssignment = (assignment) => ({
  ...assignment,
  priority: assignment.priority || "Medium",
  notes: assignment.notes || "",
  attachments: assignment.attachments || [],
  status: assignment.status || "Pending",
  createdAt: assignment.createdAt || Date.now(),
});

function App() {
  const [assignments, setAssignments] = useState([]);
  const [theme, setTheme] = useState("dark");
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  useEffect(() => {
    const savedAssignments = localStorage.getItem(STORAGE_KEY);
    const savedTheme = localStorage.getItem(THEME_KEY);

    if (savedAssignments) {
      try {
        const parsed = JSON.parse(savedAssignments);
        if (Array.isArray(parsed)) {
          setAssignments(parsed.map(normalizeAssignment));
        }
      } catch (error) {
        console.warn("Unable to parse saved assignments", error);
      }
    }

    if (savedTheme === "dark" || savedTheme === "light") {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    let updated = false;
    const nextAssignments = assignments.map((assignment) => {
      const due = parseLocalDate(assignment.dueDate);
      if (!due) return assignment;
      const isPastDue = due < now;
      if (assignment.status !== "Submitted" && assignment.status !== "Late" && isPastDue) {
        updated = true;
        return { ...assignment, status: "Late" };
      }
      return assignment;
    });

    if (updated) {
      setAssignments(nextAssignments);
    }
  }, [assignments]);

  const addAssignment = (assignment) => {
    const newAssign = normalizeAssignment(assignment);
    setAssignments((current) => [newAssign, ...current]);
    // Show toast notification on next tick to avoid React errors
    setTimeout(() => {
      try {
        if (typeof toast === 'object' && toast.success) {
          toast.success("Assignment added successfully.");
        }
      } catch (e) {
        console.log("Toast notification skipped");
      }
    }, 0);
  };

  const updateStatus = (id, status) => {
    setAssignments((current) =>
      current.map((assignment) =>
        assignment.id === id ? { ...assignment, status } : assignment
      )
    );
    setTimeout(() => {
      try {
        if (typeof toast === 'object' && toast.info) {
          toast.info(`Assignment marked ${status.toLowerCase()}.`);
        }
      } catch (e) {
        console.log("Toast notification skipped");
      }
    }, 0);
    setSelectedAssignment((current) =>
      current && current.id === id ? { ...current, status } : current
    );
  };

  const deleteAssignment = (id) => {
    setAssignments((current) => current.filter((assignment) => assignment.id !== id));
    setTimeout(() => {
      try {
        if (typeof toast === 'object' && toast.warn) {
          toast.warn("Assignment deleted.");
        }
      } catch (e) {
        console.log("Toast notification skipped");
      }
    }, 0);
    if (selectedAssignment?.id === id) {
      setSelectedAssignment(null);
    }
  };

  const openAssignment = (assignment) => setSelectedAssignment(assignment);
  const closeAssignment = () => setSelectedAssignment(null);
  const toggleTheme = () => setTheme((current) => (current === "dark" ? "light" : "dark"));

  const subjectCounts = useMemo(
    () =>
      assignments.reduce((acc, assignment) => {
        const key = assignment.subject || "Unknown";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {}),
    [assignments]
  );

  const statusCounts = useMemo(
    () =>
      assignments.reduce(
        (acc, assignment) => {
          acc[assignment.status] = (acc[assignment.status] || 0) + 1;
          return acc;
        },
        { Submitted: 0, Pending: 0, Late: 0 }
      ),
    [assignments]
  );

  const totalAssignments = assignments.length;
  const completionRate = totalAssignments
    ? Math.round((statusCounts.Submitted / totalAssignments) * 100)
    : 0;

  return (
    <BrowserRouter>
      <div className="app-shell">
        <MenuBar theme={theme} />

        <main className="content-shell">
          <header className="app-header">
            <div>
              <p className="eyebrow">College Assignment Submission Tracker</p>
              <h1>Modern student assignment dashboard</h1>
              <p className="header-description">
                Track deadlines, files, student progress, and submission health from one unified dashboard.
              </p>
            </div>
            <button className="theme-toggle" type="button" onClick={toggleTheme}>
              {theme === "dark" ? "Switch to Light" : "Switch to Dark"}
            </button>
          </header>

          <Routes>
            <Route path="/" element={<Navigate replace to="/dashboard" />} />
            <Route path="/dashboard" element={<DashboardPage assignments={assignments} />} />
            <Route
              path="/assignments"
              element={
                <AssignmentsPage
                  assignments={assignments}
                  onCreate={addAssignment}
                  onUpdateStatus={updateStatus}
                  onDelete={deleteAssignment}
                  onOpenDetail={openAssignment}
                />
              }
            />
            <Route path="/students" element={<StudentsPage assignments={assignments} />} />
            <Route path="/reports" element={<ReportsDetails assignments={assignments} />} />
            <Route path="*" element={<Navigate replace to="/dashboard" />} />
          </Routes>
        </main>

        <AssignmentModal
          assignment={selectedAssignment}
          onClose={closeAssignment}
          onUpdateStatus={updateStatus}
          onDelete={deleteAssignment}
        />

        <ToastContainer
          position="top-right"
          autoClose={2700}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme={theme === "dark" ? "dark" : "light"}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;

