import React from "react";

export default function StudentsDetails({ assignments = [] }) {
  const students = assignments.reduce((acc, a) => {
    const key = a.student || "Unknown";
    acc[key] = acc[key] || { name: key, count: 0, assignments: [] };
    acc[key].count += 1;
    acc[key].assignments.push(a);
    return acc;
  }, {});

  const list = Object.values(students).sort((a, b) => b.count - a.count);

  return (
    <section className="students-details">
      <div className="panel panel-dashboard">
        <h2>Students</h2>

        {list.length === 0 ? (
          <p>No students yet. Add assignments to populate this list.</p>
        ) : (
          <div className="students-grid">
            {list.map((s) => (
              <div key={s.name} className="student-card">
                <h3>{s.name}</h3>
                <p>{s.count} assignment{s.count === 1 ? "" : "s"}</p>
                <details>
                  <summary>Assignments</summary>
                  <ul>
                    {s.assignments.map((a) => (
                      <li key={a.id}>{a.title} — {a.subject} — {a.dueDate}</li>
                    ))}
                  </ul>
                </details>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
