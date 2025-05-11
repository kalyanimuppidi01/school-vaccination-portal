import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Reports.css";

const API = "http://localhost:5000/api/students";

export default function Reports() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 25;

  useEffect(() => {
    const fetchStudents = async () => {
      const res = await axios.get(API);
      setStudents(res.data);
    };
    fetchStudents();
  }, []);

  const normalizedFilter = filter.trim().toLowerCase();

  const records = students.flatMap((student) => {
    if (!student.vaccinated || student.vaccinated.length === 0) {
      return [{
        studentId: student.studentId,
        name: student.name,
        class: student.class,
        vaccineName: "-",
        date: "-"
      }];
    }

    return student.vaccinated.map((v) => ({
      studentId: student.studentId,
      name: student.name,
      class: student.class,
      vaccineName: v.vaccineName,
      date: new Date(v.date).toLocaleDateString()
    }));
  });

  const filteredRecords = normalizedFilter
    ? records.filter((r) =>
        r.vaccineName.toLowerCase().includes(normalizedFilter)
      )
    : records;

  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
  const indexOfLast = currentPage * recordsPerPage;
  const indexOfFirst = indexOfLast - recordsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirst, indexOfLast);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const exportCSV = () => {
    const headers = ["Student ID", "Name", "Class", "Vaccine Name", "Date"];
    const rows = filteredRecords.map((r) => [
      r.studentId,
      r.name,
      r.class,
      r.vaccineName,
      r.date,
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "vaccination_report.csv";
    link.click();
  };

  return (
    <div className="reports-page">
      <div className="reports-container">
        <button onClick={() => navigate("/dashboard")} className="back-button">
          ← Back to Dashboard
        </button>

        <h1 className="reports-title">📈 Vaccination Reports</h1>
        <p className="reports-subtitle">
          View detailed student-level vaccination records across all drives.
          Filter by vaccine type and export data for analysis or reporting.
        </p>

        <div className="reports-controls">
          <input
            type="text"
            placeholder="Filter by vaccine name..."
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setCurrentPage(1);
            }}
          />
          <button onClick={exportCSV}>⬇️ Export CSV</button>
        </div>

        <div className="reports-table">
          <table>
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Class</th>
                <th>Vaccine</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {currentRecords.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center">No records found.</td>
                </tr>
              ) : (
                currentRecords.map((r, i) => (
                  <tr key={i}>
                    <td>{r.studentId}</td>
                    <td>{r.name}</td>
                    <td>{r.class}</td>
                    <td>{r.vaccineName}</td>
                    <td>{r.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredRecords.length > recordsPerPage && (
          <div className="pagination">
          <div>
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
              ⬅ Prev
            </button>
          </div>
          <div className="pagination-center">
            Page {currentPage} of {totalPages}
          </div>
          <div>
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
              Next ➡
            </button>
          </div>
        </div>
        
        )}
      </div>
    </div>
  );
}
