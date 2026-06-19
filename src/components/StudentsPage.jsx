import React, { useMemo } from "react";
import { FiUsers, FiStar, FiUserCheck, FiUserX } from "react-icons/fi";

const parseLocalDate = (value) => {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export default function StudentsPage({ assignments = [] }) {
  const studentData = useMemo(() => {
    const map = {};
    assignments.forEach((assignment) => {
      const student = assignment.student || "Unknown";
      if (!map[student]) {
        map[student] = { name: student, total: 0, submitted: 0, pending: 0, late: 0, assignments: [] };
      }
      map[student].total += 1;
      map[student].assignments.push(assignment);
      map[student][assignment.status.toLowerCase()] += 1;
    });
    return Object.values(map).sort((a, b) => b.submitted - a.submitted);
  }, [assignments]);

  return (
    <div className="students-page">
      <div className="page-intro panel">
        <div>
          <p className="eyebrow">Student profiles</p>
          <h1>Class performance and workload</h1>
          <p className="description">Review student progress with assignment summaries, completion rate and pending action items.</p>
        </div>
        <div className="student-metrics">
          <div className="metric-card">
            <span className="metric-label">Students</span>
            <strong>{studentData.length}</strong>
          </div>
          <div className="metric-card">
            <span className="metric-label">Total assignments</span>
            <strong>{assignments.length}</strong>
          </div>
          <div className="metric-card">
            <span className="metric-label">Average submitted</span>
            <strong>{studentData.length ? Math.round(assignments.filter((a) => a.status === "Submitted").length / studentData.length) : 0}</strong>
          </div>
        </div>
      </div>

      <div className="students-grid panel">
        {studentData.length === 0 ? (
          <div className="empty-state">No students have been added yet. Assignments will populate the roster automatically.</div>
        ) : (
          studentData.map((student) => {
            const completion = student.total ? Math.round((student.submitted / student.total) * 100) : 0;
            return (
              <article key={student.name} className="student-card">
                <div className="student-card-header">
                  <div>
                    <h3>{student.name}</h3>
                    <p>{student.total} assignments</p>
                  </div>
                  <span className="student-score">{completion}%</span>
                </div>
                <div className="student-stats">
                  <div><FiUserCheck /> Submitted {student.submitted}</div>
                  <div><FiStar /> Pending {student.pending}</div>
                  <div><FiUserX /> Late {student.late}</div>
                </div>
                <div className="student-progress">
                  <span style={{ width: `${completion}%` }} />
                </div>
                <details>
                  <summary>Assignments</summary>
                  <ul>
                    {student.assignments.map((assignment) => (
                      <li key={assignment.id}>{assignment.title} • {assignment.subject} • {assignment.status}</li>
                    ))}
                  </ul>
                </details>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
