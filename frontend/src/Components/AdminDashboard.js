import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../axios";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchDistrict, setSearchDistrict] = useState("");
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get("/users");
      setUsers(res.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await API.delete(`/users/${id}`);
      setUsers(users.filter((u) => u._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete user");
    }
  };

  const filteredUsers = users.filter((u) => {
    return (
      u.fullName.toLowerCase().includes(searchName.toLowerCase()) &&
      u.district.toLowerCase().includes(searchDistrict.toLowerCase())
    );
  });

  if (loading) return <p>Loading users...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <style>{`
        .admin-container {
          flex-grow: 1;
          padding: 30px;
          background: #f9fff9;
          border-radius: 12px;
          box-shadow: 0 6px 20px rgba(0,0,0,0.05);
          margin: 20px;
        }
        .admin-title {
          text-align: center;
          font-size: 1.8rem;
          color: #2e7d32;
          margin-bottom: 20px;
          font-weight: 600;
        }
        .search-wrapper {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .search-label {
          font-size: 14px;
          font-weight: 600;
          color: #000000;
        }
        .input-wrapper {
          position: relative;
        }
        .search-bar {
          padding: 8px 35px 8px 10px;
          width: 220px;
          border-radius: 12px;
          border: 2px solid #000000ff;
          outline: none;
        }
        .search-icon {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          width: 18px;
          height: 18px;
          opacity: 0.7;
          pointer-events: none;
        }
        .add-btn {
          padding: 8px 16px;
          cursor: pointer;
          border-radius: 12px;
          border: 2px solid #3b612bff;
          background: #4CAF50;
          color: white;
          font-weight: bold;
          transition: all 0.3s ease;
        }
        .add-btn:hover {
          background: #2e7d32;
          transform: scale(1.05);
        }
        .admin-table {
          width: 100%;
          border-collapse: collapse;
          box-shadow: 0 6px 15px rgba(0,0,0,0.08);
          border-radius: 12px;
          overflow: hidden;
          margin-top: 20px;
        }
        .admin-table th, .admin-table td {
          padding: 12px 15px;
          text-align: left;
          font-size: 14px;
        }
        .admin-table th {
          background: #81c784;
          color: white;
          font-weight: 600;
        }
        .admin-table tr:nth-child(even) {
          background: #f1f8f4;
        }
        .admin-table tr:hover {
          background: #e8f5e9;
        }
        .admin-table td:last-child {
          display: flex;
          gap: 8px;
          justify-content: center;
        }
        .action-btn {
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .edit-btn {
          background-color: #43a047;
          color: white;
        }
        .edit-btn:hover {
          background-color: #2e7d32;
          transform: scale(1.05);
          box-shadow: 0 3px 8px rgba(0,0,0,0.2);
        }
        .delete-btn {
          background-color: #e53935;
          color: white;
        }
        .delete-btn:hover {
          background-color: #c62828;
          transform: scale(1.05);
          box-shadow: 0 3px 8px rgba(0,0,0,0.2);
        }
        .view-btn {
          background-color: #1e88e5;
          color: white;
        }
        .view-btn:hover {
          background-color: #1565c0;
          transform: scale(1.05);
          box-shadow: 0 3px 8px rgba(0,0,0,0.2);
        }
      `}</style>

      <div className="admin-container">
        <h2 className="admin-title"> User Management</h2>

        {/* Search Filters and Add User */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "15px",
            flexWrap: "wrap",
            marginBottom: "20px",
          }}
        >
          <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
            <div className="search-wrapper">
              <span className="search-label">Name</span>
              <div className="input-wrapper">
                <input
                  type="text"
                  placeholder="Search by Name"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="search-bar"
                />
                <img src="/images/search.png" alt="search" className="search-icon" />
              </div>
            </div>

            <div className="search-wrapper">
              <span className="search-label">District</span>
              <div className="input-wrapper">
                <input
                  type="text"
                  placeholder="Search by District"
                  value={searchDistrict}
                  onChange={(e) => setSearchDistrict(e.target.value)}
                  className="search-bar"
                />
                <img src="/images/search.png" alt="search" className="search-icon" />
              </div>
            </div>
          </div>

          <button className="add-btn" onClick={() => navigate("/add-user")}>
            ➕ Add New User
          </button>
        </div>

        {/* Users Table */}
        <table className="admin-table">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Age</th>
              <th>Gender</th>
              <th>District</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Username</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u._id}>
                <td>{u.fullName}</td>
                <td>{u.age}</td>
                <td>{u.gender}</td>
                <td>{u.district}</td>
                <td>{u.email}</td>
                <td>{u.phone}</td>
                <td>{u.username}</td>
                <td>{u.role}</td>
                <td>
                  <button
                    className="action-btn edit-btn"
                    onClick={() => navigate(`/admin/users/${u._id}/edit`)}
                  >
                    Edit
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => handleDelete(u._id)}
                  >
                    Delete
                  </button>
                  <button
                    className="action-btn view-btn"
                    onClick={() => navigate(`/admin/users/${u._id}/lands`)}
                  >
                    View Lands
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboard;
