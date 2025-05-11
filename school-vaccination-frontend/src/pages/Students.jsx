import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Students.css";

const STUDENTS_API = "http://localhost:5000/api/students";
const DRIVES_API = "http://localhost:5000/api/drives";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({ studentId: "", name: "", class: "" });
  const [search, setSearch] = useState({ name: "", class: "", id: "", vaccinated: "" });
  const [drives, setDrives] = useState([]);
  const [selectedDrive, setSelectedDrive] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [editForm, setEditForm] = useState({ id: "", name: "", class: "" });
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      const cleanParams = {};
      Object.entries(search).forEach(([key, val]) => {
        if (val !== "") cleanParams[key] = val;
      });
      const res = await axios.get(STUDENTS_API, { params: cleanParams });
      setStudents(res.data);
    };
    fetchStudents();
  }, [search]);

  useEffect(() => {
    const fetchDrives = async () => {
      const res = await axios.get(DRIVES_API);
      setDrives(res.data);
    };
    fetchDrives();
  }, []);

  const refreshStudents = async () => {
    const res = await axios.get(STUDENTS_API);
    setStudents(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post(STUDENTS_API, form);
    setForm({ studentId: "", name: "", class: "" });
    refreshStudents();
  };

  const handleVaccinate = async (studentId, driveId, action) => {
    try {
      const url = `${STUDENTS_API}/${action === "register" ? "register" : "vaccinate"}`;
      await axios.post(url, { studentId, driveId });

      setSelectedDrive((prev) => {
        const updated = { ...prev };
        delete updated[`${studentId}_${driveId}`];
        return updated;
      });

      await refreshStudents();
      return true;
    } catch (err) {
      alert(err.response?.data?.error || "Action failed");
      return false;
    }
  };

  const openEditModal = (student) => {
    setEditForm({ id: student._id, name: student.name, class: student.class });
    setShowModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    await axios.put(`${STUDENTS_API}/${editForm.id}`, {
      name: editForm.name,
      class: editForm.class,
    });
    setShowModal(false);
    refreshStudents();
  };

  return (
    <div className="students-page">
      <div className="students-container">
        <div className="students-header">
          <h1>🎓 Manage Students</h1>
          <p className="desc">
            Add students manually or import bulk records. Track vaccine eligibility and progress across all scheduled drives.
          </p>
        </div>

        <button onClick={() => navigate("/dashboard")} className="action-button mb-4">
          ← Back to Dashboard
        </button>

        <div className="section">
          <h2>➕ Add New Student</h2>
          <form onSubmit={handleSubmit} className="students-form grid gap-4 md:grid-cols-4">
            <input name="studentId" placeholder="Student ID" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} required />
            <input name="name" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input name="class" placeholder="Class" value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })} required />
            <button type="submit">Add Student</button>
          </form>
        </div>

        <div className="section bulk-upload">
          <h2>📁 Bulk Import via CSV</h2>
          <form onSubmit={async (e) => {
            e.preventDefault();
            const file = e.target.elements.csvFile.files[0];
            if (!file) return;
            const formData = new FormData();
            formData.append("file", file);
            setUploading(true);
            setUploadMessage("");
            try {
              const res = await axios.post(`${STUDENTS_API}/upload`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
              });
              setUploadMessage(`✅ ${res.data.message}`);
              refreshStudents();
            } catch (err) {
              setUploadMessage(`❌ Upload failed: ${err.response?.data?.error || "Unknown error"}`);
            } finally {
              setUploading(false);
              e.target.reset();
            }
          }}>
            <input type="file" name="csvFile" accept=".csv" required />
            <button type="submit" disabled={uploading}>
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </form>
          {uploadMessage && <p className="mt-2 text-sm">{uploadMessage}</p>}
        </div>

        <div className="section table-wrapper">
          <h2>📋 Student List & Vaccination Status</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Class</th>
                {drives.map((d) => (
                  <th key={d._id}>
                    {d.vaccineName}<br /><span style={{ fontSize: "0.75rem" }}>{new Date(d.date).toLocaleDateString()}</span>
                  </th>
                ))}
                <th>Edit</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s._id}>
                  <td>{s.studentId}</td>
                  <td>{s.name}</td>
                  <td>{s.class}</td>
                  {drives.map((d) => {
                    const isEligible = d.applicableClasses.includes(s.class);
                    const isVaccinated = s.vaccinated.some(v => v.vaccineId === d._id);
                    const isRegistered = s.registeredDrives?.some(rid => String(rid) === String(d._id));
                    const driveKey = `${s._id}_${d._id}`;
                    const selected = selectedDrive[driveKey] || "";

                    if (!isEligible) return <td key={d._id}>🚫 Not Eligible</td>;
                    if (isVaccinated) return <td key={d._id}>✅ Vaccinated</td>;
                    if (isRegistered) return <td key={d._id}>🟡 Registered</td>;

                    return (
                      <td key={d._id}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                          <select
                            value={selected}
                            onChange={(e) =>
                              setSelectedDrive({ ...selectedDrive, [driveKey]: e.target.value })
                            }
                          >
                            <option value="">Select</option>
                            <option value="register">📋 Register</option>
                            <option value="vaccinate">💉 Vaccinate</option>
                          </select>
                          <button
                            disabled={!selected}
                            className="action-button"
                            onClick={async () => {
                              const action = selectedDrive[driveKey];
                              if (!action) {
                                alert("Please select an action.");
                                return;
                              }
                              const success = await handleVaccinate(s.studentId, d._id, action);
                              if (success) {
                                const label = action === "register" ? "registered" : "vaccinated";
                                alert(`✅ ${s.name} ${label} for ${d.vaccineName}`);
                              }
                            }}
                          >
                            Submit
                          </button>
                        </div>
                      </td>
                    );
                  })}
                  <td>
                    <button onClick={() => openEditModal(s)} className="action-button edit">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Edit Student</h2>
              <form onSubmit={handleEditSubmit}>
                <input
                  name="name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                />
                <input
                  name="class"
                  value={editForm.class}
                  onChange={(e) => setEditForm({ ...editForm, class: e.target.value })}
                  required
                />
                <div className="modal-actions">
                  <button type="button" onClick={() => setShowModal(false)} className="cancel">
                    Cancel
                  </button>
                  <button type="submit" className="save">Save</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
