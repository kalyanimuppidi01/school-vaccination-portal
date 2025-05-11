import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Drives.css";

const API = "http://localhost:5000/api/drives";

export default function Drives() {
  const [form, setForm] = useState({
    vaccineName: "",
    date: "",
    availableDoses: "",
    applicableClasses: "",
  });
  const [drives, setDrives] = useState([]);
  const [editModal, setEditModal] = useState(false);
  const [editDrive, setEditDrive] = useState(null);
  const navigate = useNavigate();

  const fetchDrives = async () => {
    const res = await axios.get(API);
    setDrives(res.data);
  };

  useEffect(() => {
    fetchDrives();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dateDiff = (new Date(form.date) - new Date()) / (1000 * 60 * 60 * 24);
    if (dateDiff < 15) {
      alert("Drive date must be at least 15 days from today.");
      return;
    }

    const payload = {
      ...form,
      applicableClasses: form.applicableClasses.split(",").map((c) => c.trim()),
      availableDoses: parseInt(form.availableDoses),
    };

    try {
      await axios.post(API, payload);
      setForm({ vaccineName: "", date: "", availableDoses: "", applicableClasses: "" });
      fetchDrives();
    } catch (err) {
      alert(err.response?.data?.error || "Error creating drive");
    }
  };

  const handleEdit = (drive) => {
    setEditDrive({ ...drive });
    setEditModal(true);
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/${editDrive._id}`, editDrive);
      setEditModal(false);
      fetchDrives();
    } catch (err) {
      alert(err.response?.data?.error || "Update failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this drive?")) return;
    try {
      await axios.delete(`${API}/${id}`);
      fetchDrives();
    } catch (err) {
      alert(err.response?.data?.error || "Delete failed");
    }
  };

  const upcomingDrives = drives.filter((d) => !d.isExpired);
  const pastDrives = drives.filter((d) => d.isExpired);

  return (
    <div className="drives-page">
      <div className="drives-container">

        <button onClick={() => navigate("/dashboard")} className="back-button mb-6">
          ← Back to Dashboard
        </button>

        <h1 className="drives-title">💉 Vaccination Drive Management</h1>
        <p className="drives-subtitle">
          This section allows you to create, view, and manage all school vaccination drives. 
          Ensure vaccines are planned in advance, target the right classes, and maintain accurate drive records.
        </p>

        {/* Create Drive Form */}
        <div className="form-section">
          <h2>Create Vaccination Drive</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="vaccineName"
              placeholder="Vaccine Name"
              value={form.vaccineName}
              onChange={handleChange}
              required
            />
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
            />
            <input
              type="number"
              name="availableDoses"
              placeholder="Available Doses"
              value={form.availableDoses}
              onChange={handleChange}
              required
            />
            <input
              name="applicableClasses"
              placeholder="Applicable Classes (comma separated)"
              value={form.applicableClasses}
              onChange={handleChange}
              required
            />
            <button type="submit">Create Drive</button>
          </form>
        </div>

        {/* Upcoming Drives */}
        <div className="table-section">
          <h2>Upcoming Vaccination Drives</h2>
          {upcomingDrives.length === 0 ? (
            <p>No upcoming drives</p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Vaccine</th>
                    <th>Date</th>
                    <th>Classes</th>
                    <th>Doses</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingDrives.map((d) => (
                    <tr key={d._id}>
                      <td>{d.vaccineName}</td>
                      <td>{new Date(d.date).toLocaleDateString()}</td>
                      <td>{d.applicableClasses.join(", ")}</td>
                      <td>{d.availableDoses}</td>
                      <td>
                        <span onClick={() => handleEdit(d)} className="edit-button">Edit</span>
                        <span onClick={() => handleDelete(d._id)} className="delete-button">Delete</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Past Drives */}
        <div className="table-section">
          <h2>Past Vaccination Drives</h2>
          {pastDrives.length === 0 ? (
            <p>No past drives</p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Vaccine</th>
                    <th>Date</th>
                    <th>Classes</th>
                    <th>Doses</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pastDrives.map((d) => (
                    <tr key={d._id}>
                      <td>{d.vaccineName}</td>
                      <td>{new Date(d.date).toLocaleDateString()}</td>
                      <td>{d.applicableClasses.join(", ")}</td>
                      <td>{d.availableDoses}</td>
                      <td>✅ Completed</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {editModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Edit Drive</h2>
              <form onSubmit={submitEdit}>
                <input
                  name="vaccineName"
                  value={editDrive.vaccineName}
                  onChange={(e) => setEditDrive({ ...editDrive, vaccineName: e.target.value })}
                  required
                />
                <input
                  type="date"
                  name="date"
                  value={editDrive.date?.split("T")[0]}
                  onChange={(e) => setEditDrive({ ...editDrive, date: e.target.value })}
                  required
                />
                <input
                  type="number"
                  name="availableDoses"
                  value={editDrive.availableDoses}
                  onChange={(e) => setEditDrive({ ...editDrive, availableDoses: e.target.value })}
                  required
                />
                <input
                  name="applicableClasses"
                  value={editDrive.applicableClasses?.join(", ") || ""}
                  onChange={(e) =>
                    setEditDrive({
                      ...editDrive,
                      applicableClasses: e.target.value.split(",").map((c) => c.trim())
                    })}
                  required
                />
                <div className="modal-actions">
                  <button type="button" className="cancel" onClick={() => setEditModal(false)}>Cancel</button>
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
