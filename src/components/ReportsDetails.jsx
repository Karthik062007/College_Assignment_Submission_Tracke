import React, { useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import jsPDF from "jspdf";
import "./ReportsDetails.css";

const downloadBlob = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const safeFormat = (value) => (value == null ? "" : String(value));

export default function ReportsDetails({ assignments = [] }) {
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

  const subjectCounts = useMemo(
    () =>
      assignments.reduce((acc, assignment) => {
        const subject = assignment.subject || "Unknown";
        acc[subject] = (acc[subject] || 0) + 1;
        return acc;
      }, {}),
    [assignments]
  );

  const subjectChart = useMemo(
    () => ({
      labels: Object.keys(subjectCounts),
      datasets: [
        {
          data: Object.values(subjectCounts),
          backgroundColor: ["#60a5fa", "#f97316", "#10b981", "#a855f7", "#facc15", "#38bdf8"],
        },
      ],
    }),
    [subjectCounts]
  );

  const statusChart = useMemo(
    () => ({
      labels: ["Submitted", "Pending", "Late"],
      datasets: [
        {
          data: [statusCounts.Submitted, statusCounts.Pending, statusCounts.Late],
          backgroundColor: ["#22c55e", "#f59e0b", "#ef4444"],
        },
      ],
    }),
    [statusCounts]
  );

  const csvExport = () => {
    const headers = ["Title", "Student", "Subject", "Priority", "Status", "Due Date", "Notes"];
    const rows = assignments.map((assignment) => [
      safeFormat(assignment.title),
      safeFormat(assignment.student),
      safeFormat(assignment.subject),
      safeFormat(assignment.priority),
      safeFormat(assignment.status),
      safeFormat(assignment.dueDate),
      safeFormat(assignment.notes),
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.map((value) => `"${value.replace(/"/g, '""')}"`).join(","))
      .join("\n");
    downloadBlob(csvContent, "assignments-report.csv", "text/csv;charset=utf-8;");
  };

  const excelExport = () => {
    const headers = ["Title", "Student", "Subject", "Priority", "Status", "Due Date"];
    const rows = assignments.map((assignment) => [
      safeFormat(assignment.title),
      safeFormat(assignment.student),
      safeFormat(assignment.subject),
      safeFormat(assignment.priority),
      safeFormat(assignment.status),
      safeFormat(assignment.dueDate),
    ]);
    const html = [`<table><tr>${headers.map((header) => `<th>${header}</th>`).join("")}</tr>`].concat(
      rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`)
    );
    const content = `<html><head><meta charset="UTF-8"></head><body>${html.join("")}</body></html>`;
    downloadBlob(content, "assignments-report.xls", "application/vnd.ms-excel;charset=utf-8;");
  };

  const pdfExport = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(18);
    doc.text("Assignment Report", 14, 20);
    doc.setFontSize(11);
    doc.text(`Total assignments: ${assignments.length}`, 14, 30);

    let cursorY = 42;
    doc.setFontSize(10);
    doc.text(["Title", "Student", "Subject", "Priority", "Status", "Due Date"].join(" | "), 14, cursorY);
    cursorY += 6;

    assignments.slice(0, 22).forEach((assignment) => {
      const line = [
        safeFormat(assignment.title),
        safeFormat(assignment.student),
        safeFormat(assignment.subject),
        safeFormat(assignment.priority),
        safeFormat(assignment.status),
        safeFormat(assignment.dueDate),
      ].join(" | ");
      doc.text(line, 14, cursorY);
      cursorY += 6;
      if (cursorY > 178) {
        doc.addPage();
        cursorY = 20;
      }
    });

    doc.save("assignments-report.pdf");
  };

  return (
    <section className="reports-page">
      <div className="page-intro panel">
        <div>
          <p className="eyebrow">Reporting center</p>
          <h1>Generate assignment exports</h1>
          <p className="description">Download assignment activity and student performance in PDF, CSV, or Excel format.</p>
        </div>
      </div>

      <div className="report-actions panel">
        <div className="report-summary">
          <div>
            <h2>Total assignments</h2>
            <strong>{assignments.length}</strong>
          </div>
          <div>
            <h2>Submitted</h2>
            <strong>{statusCounts.Submitted}</strong>
          </div>
          <div>
            <h2>Pending</h2>
            <strong>{statusCounts.Pending}</strong>
          </div>
          <div>
            <h2>Late</h2>
            <strong>{statusCounts.Late}</strong>
          </div>
        </div>

        <div className="export-buttons">
          <button onClick={pdfExport}>Export PDF</button>
          <button onClick={excelExport}>Export Excel</button>
          <button className="secondary" onClick={csvExport}>Export CSV</button>
        </div>
      </div>

      <div className="reports-grid">
        <div className="panel report-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Assignment distribution</p>
              <h2>Status chart</h2>
            </div>
          </div>
          <div className="chart-block">
            <Doughnut data={statusChart} options={{ plugins: { legend: { position: "bottom" } } }} />
          </div>
        </div>

        <div className="panel report-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Subject breakdown</p>
              <h2>Subject chart</h2>
            </div>
          </div>
          <div className="chart-block">
            <Doughnut data={subjectChart} options={{ plugins: { legend: { position: "bottom" } } }} />
          </div>
        </div>
      </div>
    </section>
  );
}
