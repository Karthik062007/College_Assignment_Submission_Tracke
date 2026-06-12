import React, { useState } from "react";

function App() {
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [filter, setFilter] = useState("All");

  const addAssignment = () => {
    if (!title || !subject || !dueDate) {
      alert("Please fill all fields");
      return;
    }

    const today = new Date();
    const due = new Date(dueDate);

    let status = "Pending";

    if (due < today) {
      status = "Late";
    }

    const newAssignment = {
      id: Date.now(),
      title,
      subject,
      dueDate,
      status,
    };

    setAssignments([...assignments, newAssignment]);

    setTitle("");
    setSubject("");
    setDueDate("");
  };

  const markSubmitted = (id) => {
    setAssignments(
      assignments.map((a) =>
        a.id === id ? { ...a, status: "Submitted" } : a
      )
    );
  };

  const deleteAssignment = (id) => {
    setAssignments(assignments.filter((a) => a.id !== id));
  };

  const filteredAssignments =
    filter === "All"
      ? assignments
      : assignments.filter((a) => a.subject === filter);

  const submittedCount = assignments.filter(
    (a) => a.status === "Submitted"
  ).length;

  const pendingCount = assignments.filter(
    (a) => a.status === "Pending"
  ).length;

  const lateCount = assignments.filter(
    (a) => a.status === "Late"
  ).length;

  return (
    <div
      style={{
        backgroundColor: "#f4f6f9",
        minHeight: "100vh",
        padding: "20px",
        fontFamily: "Arial",
      }}
    >
      <h1 style={{ textAlign: "center", color: "#2c3e50" }}>
        College Assignment Submission Tracker
      </h1>

      {/* Dashboard */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "15px",
          margin: "20px 0",
        }}
      >
        <div
          style={{
            backgroundColor: "#27ae60",
            color: "white",
            padding: "20px",
            borderRadius: "10px",
            width: "180px",
            textAlign: "center",
          }}
        >
          <h2>{submittedCount}</h2>
          <p>Submitted</p>
        </div>

        <div
          style={{
            backgroundColor: "#f39c12",
            color: "white",
            padding: "20px",
            borderRadius: "10px",
            width: "180px",
            textAlign: "center",
          }}
        >
          <h2>{pendingCount}</h2>
          <p>Pending</p>
        </div>

        <div
          style={{
            backgroundColor: "#e74c3c",
            color: "white",
            padding: "20px",
            borderRadius: "10px",
            width: "180px",
            textAlign: "center",
          }}
        >
          <h2>{lateCount}</h2>
          <p>Late</p>
        </div>
      </div>

      {/* Add Assignment */}
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 0 10px lightgray",
          marginBottom: "20px",
        }}
      >
        <h2>Add Assignment</h2>

        <input
          type="text"
          placeholder="Assignment Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ padding: "10px", margin: "5px" }}
        />

        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          style={{ padding: "10px", margin: "5px" }}
        />

        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          style={{ padding: "10px", margin: "5px" }}
        />

        <button
          onClick={addAssignment}
          style={{
            backgroundColor: "#3498db",
            color: "white",
            border: "none",
            padding: "10px 15px",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Add Assignment
        </button>
      </div>

      {/* Filter */}
      <h3>Filter By Subject</h3>

      <select
        onChange={(e) => setFilter(e.target.value)}
        style={{ padding: "10px" }}
      >
        <option>All</option>
        {[...new Set(assignments.map((a) => a.subject))].map((sub) => (
          <option key={sub}>{sub}</option>
        ))}
      </select>

      {/* Assignment List */}
      {filteredAssignments.map((a) => (
        <div
          key={a.id}
          style={{
            backgroundColor: "white",
            padding: "15px",
            marginTop: "15px",
            borderRadius: "8px",
            boxShadow: "0 0 5px lightgray",
          }}
        >
          <h3>{a.title}</h3>

          <p>
            <b>Subject:</b> {a.subject}
          </p>

          <p>
            <b>Due Date:</b> {a.dueDate}
          </p>

          <p>
            <b>Status:</b> {a.status}
          </p>

          <button
            onClick={() => markSubmitted(a.id)}
            style={{
              backgroundColor: "#27ae60",
              color: "white",
              border: "none",
              padding: "8px 12px",
              borderRadius: "5px",
              marginRight: "10px",
              cursor: "pointer",
            }}
          >
            Mark Submitted
          </button>

          <button
            onClick={() => deleteAssignment(a.id)}
            style={{
              backgroundColor: "#e74c3c",
              color: "white",
              border: "none",
              padding: "8px 12px",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

export default App;


