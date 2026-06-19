import React, { useMemo } from "react";

const parseLocalDate = (value) => {
  if (!value) return null;
  const parts = value.split("-").map(Number);
  if (parts.length !== 3) return null;
  return new Date(parts[0], parts[1] - 1, parts[2], 23, 59, 59);
};

const getDaysUntil = (value) => {
  const due = parseLocalDate(value);
  if (!due) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueMidnight = new Date(due.getFullYear(), due.getMonth(), due.getDate(), 0, 0, 0);
  return Math.round((dueMidnight - today) / (1000 * 60 * 60 * 24));
};

export default function DashboardDetails({ assignments = [] }) {
  const summary = useMemo(() => {
    const bySubject = {};
    const byStudent = {};
    const upcoming = [];
    const overdue = [];

    assignments.forEach((a) => {
      bySubject[a.subject || "Unknown"] = (bySubject[a.subject || "Unknown"] || 0) + 1;
      byStudent[a.student || "Unknown"] = (byStudent[a.student || "Unknown"] || 0) + 1;

      const days = getDaysUntil(a.dueDate);
      if (a.status !== "Submitted") {
        if (days < 0) overdue.push(a);
        else if (days <= 7) upcoming.push({ ...a, days });
      }
    });

    return { bySubject, byStudent, upcoming, overdue };
  }, [assignments]);

  return (
    <section className="dashboard-details">
      <div className="panel panel-dashboard">
        <h2>Dashboard details</h2>

        <div className="dashboard-grid">
          <div>
            <h3>Upcoming (7 days)</h3>
            {summary.upcoming.length === 0 ? (
              <p>No upcoming assignments.</p>
            ) : (
              <ul>
                {summary.upcoming.map((a) => (
                  <li key={a.id}>
                    {a.title} — {a.student} — due in {a.days} day{a.days === 1 ? "" : "s"}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h3>Overdue</h3>
            {summary.overdue.length === 0 ? (
              <p>No overdue assignments.</p>
            ) : (
              <ul>
                {summary.overdue.map((a) => (
                  <li key={a.id}>{a.title} — {a.student} — due {a.dueDate}</li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h3>Subjects</h3>
            <ul>
              {Object.entries(summary.bySubject).map(([k, v]) => (
                <li key={k}>{k}: {v}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3>Students</h3>
            <ul>
              {Object.entries(summary.byStudent).map(([k, v]) => (
                <li key={k}>{k}: {v}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
