import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiX, FiDownload, FiTrash2, FiCheckCircle } from "react-icons/fi";

const parseLocalDate = (value) => {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const formatDisplayDate = (value) => {
  const date = parseLocalDate(value);
  if (!date) return "";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getDaysUntil = (value) => {
  const due = parseLocalDate(value);
  if (!due) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueMidnight = new Date(due.getFullYear(), due.getMonth(), due.getDate(), 0, 0, 0);
  return Math.round((dueMidnight - today) / (1000 * 60 * 60 * 24));
};

export default function AssignmentModal({ assignment, onClose, onUpdateStatus, onDelete }) {
  if (!assignment) return null;

  const daysUntil = getDaysUntil(assignment.dueDate);
  const deadlineText =
    daysUntil < 0
      ? `Overdue by ${Math.abs(daysUntil)} day${Math.abs(daysUntil) === 1 ? "" : "s"}`
      : daysUntil === 0
      ? "Due today"
      : `Due in ${daysUntil} day${daysUntil === 1 ? "" : "s"}`;

  const statusClass = assignment.status === "Submitted"
    ? "status-submitted"
    : assignment.status === "Late"
    ? "status-late"
    : "status-pending";

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="modal-card"
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="modal-header">
            <div>
              <p className="eyebrow">Assignment details</p>
              <h2>{assignment.title}</h2>
              <p className="modal-meta">{assignment.student} • {assignment.subject}</p>
            </div>
            <button className="icon-button" onClick={onClose} aria-label="Close details">
              <FiX />
            </button>
          </div>

          <div className="modal-body">
            <div className="modal-grid">
              <div>
                <h3>Status</h3>
                <span className={`status-pill ${statusClass}`}>{assignment.status}</span>
              </div>
              <div>
                <h3>Priority</h3>
                <span className={`priority-pill priority-${assignment.priority?.toLowerCase() || "medium"}`}>
                  {assignment.priority || "Medium"}
                </span>
              </div>
              <div>
                <h3>Due date</h3>
                <p>{formatDisplayDate(assignment.dueDate)}</p>
              </div>
              <div>
                <h3>Deadline</h3>
                <p>{deadlineText}</p>
              </div>
            </div>

            <div className="modal-section">
              <h3>Notes</h3>
              <p>{assignment.notes || "No additional notes were added for this assignment."}</p>
            </div>

            <div className="modal-section">
              <h3>Files</h3>
              {assignment.attachments?.length ? (
                <ul className="attachment-list">
                  {assignment.attachments.map((file) => (
                    <li key={file.id}>
                      <span>{file.name}</span>
                      {file.url ? (
                        <a className="download-link" href={file.url} download={file.name}>
                          <FiDownload /> Download
                        </a>
                      ) : (
                        <span className="attachment-muted">Stored metadata only</span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="attachment-muted">No files uploaded.</p>
              )}
            </div>

            <div className="modal-actions">
              <button onClick={() => onUpdateStatus(assignment.id, "Submitted")}>Mark Submitted</button>
              <button className="secondary" onClick={() => onUpdateStatus(assignment.id, "Pending")}>Mark Pending</button>
              <button className="danger" onClick={() => onUpdateStatus(assignment.id, "Late")}>Mark Late</button>
              <button className="danger outline" onClick={() => onDelete(assignment.id)}>Delete</button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
