import React, { useMemo } from "react";
import { FiCalendar, FiClock, FiSliders } from "react-icons/fi";

const formatDayLabel = (date) => date.toLocaleDateString(undefined, { weekday: "short", day: "numeric" });

const parseLocalDate = (value) => {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export default function CalendarView({ assignments = [] }) {
  const today = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }, []);

  const windowDays = useMemo(() => {
    return Array.from({ length: 14 }, (_, index) => {
      const date = new Date(today);
      date.setDate(date.getDate() + index);
      return date;
    });
  }, [today]);

  const dayBlocks = windowDays.map((day) => {
    const dueAssignments = assignments.filter((assignment) => {
      const due = parseLocalDate(assignment.dueDate);
      return due && due.getFullYear() === day.getFullYear() && due.getMonth() === day.getMonth() && due.getDate() === day.getDate();
    });

    return {
      day,
      dueAssignments,
    };
  });

  const dueTodayCount = dayBlocks[0]?.dueAssignments.length || 0;
  const dueSoonCount = dayBlocks.slice(1, 5).reduce((sum, block) => sum + block.dueAssignments.length, 0);

  return (
    <div className="calendar-card panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Deadline calendar</p>
          <h2>Next 14 days</h2>
        </div>
        <FiCalendar className="panel-icon" />
      </div>

      <div className="calendar-grid">
        {dayBlocks.map((block) => {
          const isToday = block.day.getTime() === today.getTime();
          return (
            <div key={block.day.toISOString()} className={`calendar-cell ${isToday ? "calendar-today" : ""}`}>
              <span className="calendar-date">{formatDayLabel(block.day)}</span>
              <span className="calendar-count">{block.dueAssignments.length} due</span>
              {block.dueAssignments.slice(0, 2).map((assignment) => (
                <p key={assignment.id} className="calendar-item">
                  {assignment.title} <span>{assignment.student}</span>
                </p>
              ))}
            </div>
          );
        })}
      </div>

      <div className="calendar-summary">
        <div>
          <span className="summary-label">Today</span>
          <strong>{dueTodayCount} assignments</strong>
        </div>
        <div>
          <span className="summary-label">Due soon</span>
          <strong>{dueSoonCount} assignments</strong>
        </div>
        <div>
          <span className="summary-label">Plan ahead</span>
          <strong>{assignments.length} total tracked</strong>
        </div>
      </div>
    </div>
  );
}
