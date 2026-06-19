import React, { useMemo, useState } from "react";
import { FiPlusCircle, FiSearch, FiFilter, FiChevronLeft, FiChevronRight } from "react-icons/fi";

const priorityLabels = ["High", "Medium", "Low"];
const parseLocalDate = (value) => {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 23, 59, 59);
};

const formatDisplayDate = (value) => {
  const date = parseLocalDate(value);
  if (!date) return "";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

const getDaysUntil = (value) => {
  const due = parseLocalDate(value);
  if (!due) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueMidnight = new Date(due.getFullYear(), due.getMonth(), due.getDate(), 0, 0, 0);
  return Math.round((dueMidnight - today) / (1000 * 60 * 60 * 24));
};

export default function AssignmentsPage({
  assignments = [],
  onCreate,
  onUpdateStatus,
  onDelete,
  onOpenDetail,
}) {
  const [studentName, setStudentName] = useState("");
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [notes, setNotes] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("dueDate");
  const [sortOrder, setSortOrder] = useState("asc");
  const [page, setPage] = useState(1);
  const [attachments, setAttachments] = useState([]);
  const [formError, setFormError] = useState("");

  const subjects = useMemo(() => {
    const values = assignments.map((item) => item.subject).filter(Boolean);
    return [...new Set(values)].sort();
  }, [assignments]);

  const filtered = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return assignments
      .filter((assignment) => {
        const matchSearch =
          !normalizedSearch ||
          [assignment.title, assignment.student, assignment.subject]
            .join(" ")
            .toLowerCase()
            .includes(normalizedSearch);
        const matchSubject = subjectFilter === "All" || assignment.subject === subjectFilter;
        const matchStatus = statusFilter === "All" || assignment.status === statusFilter;
        return matchSearch && matchSubject && matchStatus;
      })
      .sort((a, b) => {
        const valueA = sortBy === "student" ? a.student : sortBy === "priority" ? a.priority : a.dueDate;
        const valueB = sortBy === "student" ? b.student : sortBy === "priority" ? b.priority : b.dueDate;
        if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
        if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
  }, [assignments, searchTerm, subjectFilter, statusFilter, sortBy, sortOrder]);

  const pageSize = 6;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pagedAssignments = filtered.slice((page - 1) * pageSize, page * pageSize);

  const resetForm = () => {
    setStudentName("");
    setTitle("");
    setSubject("");
    setDueDate("");
    setPriority("Medium");
    setNotes("");
    setAttachments([]);
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files || []);
    const uploaded = files.map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}`,
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file),
    }));
    setAttachments((current) => [...current, ...uploaded]);
    event.target.value = "";
  };

  const handleSubmit = (event) => {
    if (event) event.preventDefault();
    console.log("AssignmentsPage handleSubmit", {
      studentName,
      title,
      subject,
      dueDate,
      priority,
      notes,
      attachments,
      onCreateType: typeof onCreate,
    });
    if (!studentName.trim() || !title.trim() || !subject.trim() || !dueDate) {
      setFormError("Please complete all required fields before adding the assignment.");
      return;
    }
    if (typeof onCreate !== "function") {
      console.warn("AssignmentsPage onCreate is not a function", onCreate);
      setFormError("Unable to save assignment right now. Please try again later.");
      return;
    }
    const newAssignment = {
      id: Date.now(),
      student: studentName.trim(),
      title: title.trim(),
      subject: subject.trim(),
      dueDate,
      priority,
      notes: notes.trim(),
      status: "Pending",
      attachments,
      createdAt: Date.now(),
    };
    onCreate(newAssignment);
    resetForm();
    setPage(1);
    setFormError("");
  };

  const statusCounts = useMemo(() => {
    return assignments.reduce((acc, assignment) => {
      acc[assignment.status] = (acc[assignment.status] || 0) + 1;
      return acc;
    }, { Submitted: 0, Pending: 0, Late: 0 });
  }, [assignments]);

  return (
    <div className="assignments-page">
      <div className="page-intro panel">
        <div>
          <p className="eyebrow">Assignment management</p>
          <h1>Track students, status and deadlines</h1>
          <p className="description">Create assignments, upload files, and keep every student delivery organized with sorting and filters.</p>
        </div>
        <div className="status-pill-wrap">
          <span className="status-pill status-submitted">Submitted {statusCounts.Submitted}</span>
          <span className="status-pill status-pending">Pending {statusCounts.Pending}</span>
          <span className="status-pill status-late">Late {statusCounts.Late}</span>
        </div>
      </div>

      <form className="panel form-panel" onSubmit={handleSubmit}>
        <div className="panel-header">
          <div>
            <p className="eyebrow">New assignment</p>
            <h2>Add a new task</h2>
            {formError && <p className="form-error">{formError}</p>}
          </div>
          <button className="button-primary" type="submit">
            <FiPlusCircle /> Add assignment
          </button>
        </div>

        <div className="form-grid">
          <label>
            Student name
            <input
              type="text"
              value={studentName}
              onChange={(event) => {
                setStudentName(event.target.value);
                if (formError) setFormError("");
              }}
              placeholder="Student name"
              required
            />
          </label>
          <label>
            Assignment title
            <input
              type="text"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                if (formError) setFormError("");
              }}
              placeholder="Assignment title"
              required
            />
          </label>
          <label>
            Subject
            <input
              type="text"
              value={subject}
              onChange={(event) => {
                setSubject(event.target.value);
                if (formError) setFormError("");
              }}
              placeholder="Subject"
              required
            />
          </label>
          <label>
            Due date
            <input
              type="date"
              value={dueDate}
              onChange={(event) => {
                setDueDate(event.target.value);
                if (formError) setFormError("");
              }}
              required
            />
          </label>
          <label>
            Priority
            <select value={priority} onChange={(event) => setPriority(event.target.value)}>
              {priorityLabels.map((item) => (
                <option value={item} key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="span-full">
            Notes
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Optional assignment notes" rows={4} />
          </label>
          <label className="span-full">
            Attach files
            <input type="file" multiple onChange={handleFileUpload} accept=".pdf,.docx,.ppt,.pptx,.zip" />
            {attachments.length > 0 && (
              <ul className="attachment-list">
                {attachments.map((file) => (
                  <li key={file.id}>{file.name} <span>{(file.size / 1024).toFixed(1)} KB</span></li>
                ))}
              </ul>
            )}
          </label>
        </div>
      </form>

      <div className="panel filters-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Search and sort</p>
            <h2>Find assignments quickly</h2>
          </div>
        </div>
        <div className="filters-grid">
          <label>
            Search
            <div className="input-with-icon">
              <FiSearch />
              <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Student, title, or subject" />
            </div>
          </label>
          <label>
            Subject
            <select value={subjectFilter} onChange={(event) => setSubjectFilter(event.target.value)}>
              <option value="All">All subjects</option>
              {subjects.map((item) => (
                <option value={item} key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            Status
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="All">All statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Pending">Pending</option>
              <option value="Late">Late</option>
            </select>
          </label>
          <label>
            Sort by
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="dueDate">Due Date</option>
              <option value="student">Student</option>
              <option value="priority">Priority</option>
            </select>
          </label>
          <label>
            Order
            <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}>
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </label>
        </div>
      </div>

      <div className="assignment-list panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Assignment list</p>
            <h2>{filtered.length} assignments</h2>
          </div>
        </div>
        {filtered.length === 0 ? (
          <div className="empty-state">There are no matching assignments. Adjust the filter or add a new assignment.</div>
        ) : (
          <div className="assignment-cards">
            {pagedAssignments.map((assignment) => {
              const daysUntil = getDaysUntil(assignment.dueDate);
              const title = assignment.title;
              return (
                <article key={assignment.id} className="assignment-card" onClick={() => onOpenDetail(assignment)}>
                  <div className="assignment-card-top">
                    <div>
                      <h3>{title}</h3>
                      <p>{assignment.student} • {assignment.subject}</p>
                    </div>
                    <span className={`status-pill ${assignment.status === "Submitted" ? "status-submitted" : assignment.status === "Late" ? "status-late" : "status-pending"}`}>
                      {assignment.status}
                    </span>
                  </div>
                  <div className="assignment-card-meta">
                    <span>{formatDisplayDate(assignment.dueDate)}</span>
                    <span className={`deadline-tag ${daysUntil < 0 ? "deadline-overdue" : daysUntil <= 2 ? "deadline-soon" : "deadline-normal"}`}>
                      {daysUntil < 0 ? `Overdue by ${Math.abs(daysUntil)}d` : `Due in ${daysUntil}d`}
                    </span>
                    <span className={`priority-pill priority-${assignment.priority?.toLowerCase()}`}>
                      {assignment.priority}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="pagination-row">
          <button className="pager-button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>
            <FiChevronLeft /> Previous
          </button>
          <span className="pager-label">Page {page} of {pageCount}</span>
          <button className="pager-button" disabled={page >= pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))}>
            Next <FiChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
}
