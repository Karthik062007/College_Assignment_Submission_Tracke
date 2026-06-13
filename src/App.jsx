import React, { useState } from "react";

function App() {
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [studentName, setStudentName] = useState("");
  const [filter, setFilter] = useState("All");

  const addAssignment = () => {
    if (!studentName || !title || !subject || !dueDate) {
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
      student: studentName,
      subject,
      dueDate,
      status,
    };

    setAssignments([...assignments, newAssignment]);
    // Add to students list if not already present
    setStudents((prev) =>
      prev.includes(studentName) ? prev : [...prev, studentName]
    );

    setTitle("");
    setSubject("");
    setDueDate("");
    setStudentName("");
  };

  // helper to format Date -> yyyy-mm-dd for input[type=date]
  const formatDateForInput = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // set due date to one month from today
  const setDueInOneMonth = () => {
    const today = new Date();
    const nextMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      today.getDate()
    );
    setDueDate(formatDateForInput(nextMonth));
  };

  const markSubmitted = (id) => {
    setAssignments(
      assignments.map((a) =>
        a.id === id ? { ...a, status: "Submitted" } : a
      )
    );
  };

  const markPending = (id) => {
    setAssignments(
      assignments.map((a) => (a.id === id ? { ...a, status: "Pending" } : a))
    );
  };

  const markLate = (id) => {
    setAssignments(
      assignments.map((a) => (a.id === id ? { ...a, status: "Late" } : a))
    );
  };

  const deleteAssignment = (id) => {
    setAssignments(assignments.filter((a) => a.id !== id));
  };

  const filteredAssignments =
    filter === "All"
      ? assignments
      : assignments.filter((a) => a.subject === filter);

  // counts per subject for filter display
  const subjectCounts = assignments.reduce((acc, a) => {
    if (!a.subject) return acc;
    acc[a.subject] = (acc[a.subject] || 0) + 1;
    return acc;
  }, {});

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
          placeholder="Student Name"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          style={{ padding: "10px", margin: "5px" }}
        />

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
          onClick={setDueInOneMonth}
          style={{
            backgroundColor: "#8e44ad",
            color: "white",
            border: "none",
            padding: "10px 12px",
            borderRadius: "5px",
            margin: "5px",
            cursor: "pointer",
          }}
        >
          Set Due +1 month
        </button>

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
      <h3>Filter By Subject ({filteredAssignments.length})</h3>

      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{ padding: "10px" }}
      >
        <option key="All" value="All">
          All ({assignments.length})
        </option>
        {Object.keys(subjectCounts).map((sub) => (
          <option key={sub} value={sub}>
            {sub} ({subjectCounts[sub]})
          </option>
        ))}
      </select>

      {/* Assignment List */}
      {filteredAssignments.map((a) => (
        <div key={a.id} className="assignment-card">
          <p className="assignment-sentence">
            {a.title} — {a.student} ({a.subject}) is due on {a.dueDate}.
            <span
              className={`status ${
                a.status ? `status-${a.status.toLowerCase()}` : ""
              }`}
            >
              {a.status}
            </span>
          </p>

          <div>
            <button onClick={() => markSubmitted(a.id)} style={{backgroundColor: "#27ae60", color: "white", border: "none", padding: "8px 12px", borderRadius: "5px", marginRight: "10px", cursor: "pointer"}}>
              Mark Submitted
            </button>

            <button onClick={() => markPending(a.id)} style={{backgroundColor: "#f39c12", color: "white", border: "none", padding: "8px 12px", borderRadius: "5px", marginRight: "10px", cursor: "pointer"}}>
              Mark Pending
            </button>

            <button onClick={() => markLate(a.id)} style={{backgroundColor: "#e74c3c", color: "white", border: "none", padding: "8px 12px", borderRadius: "5px", marginRight: "10px", cursor: "pointer"}}>
              Mark Late
            </button>

            <button onClick={() => deleteAssignment(a.id)} style={{backgroundColor: "#e74c3c", color: "white", border: "none", padding: "8px 12px", borderRadius: "5px", cursor: "pointer"}}>
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;

