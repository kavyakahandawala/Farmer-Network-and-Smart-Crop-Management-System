import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { FaUsers, FaStore, FaComments, FaSignOutAlt, FaTachometerAlt, FaQuestionCircle } from "react-icons/fa";
import "../adminDashboard/adminDashboard.css";
import "./QandADisplay.css"; 
import Header from '../Header/Header';
import Footer from '../Footer/Footer';

const URL = "http://localhost:5000/QandA";

const fetchHandler = async () => {
  return await axios.get(URL).then((res) => res.data);
};

function QandADisplay() {
  const [QandA, setQandA] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHandler().then((data) => setQandA(data.QandA));
  }, []);

  const deleteHandler = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this Q&A?");
    if (!confirmDelete) return;

    await axios.delete(`${URL}/${id}`);
    setQandA(QandA.filter((item) => item._id !== id));
  };

  return (
    <>
      <Helmet>
        <title>AgroSphere | Admin Q&A Display</title>
      </Helmet>
      <Header/>
      <div className="admin-qa-wrapper">
        <div className="admin-qa-layout">
          {/* Sidebar */}
          <div className="admin-qa-sidebar">
            <ul className="admin-qa-menu">
              <li>
                <Link to="/admin">
                  <FaTachometerAlt /> <span>Dashboard</span>
                </Link>
              </li>
              <li>
                <Link to="/admin/dashboard">
                  <FaUsers /> <span>User Management</span>
                </Link>
              </li>
              <li>
                <Link to="/marketwatch">
                  <FaStore /> <span>Market Watch</span>
                </Link>
              </li>
              <li>
                <Link to="/admin/productable">
                  <i className="fa fa-seedling"></i>
                  <span>Add Crop Inputs</span>
                </Link>
              </li>
              <li>
                <Link to="/admin/payment">
                  <i className="fa fa-seedling"></i>
                  <span>Order Management</span>
                </Link>
              </li>
              <li className="admin-qa-active">
                <Link to="/admin/qaforum">
                  <FaComments /> <span>Q & A Forum</span>
                </Link>
              </li>
              <li>
                <Link to="/admin/qapost">
                  <FaQuestionCircle /> <span>Q & A Post</span>
                </Link>
              </li>
              <li>
                <a
                  href="/"
                  onClick={(e) => {
                    if (!window.confirm("Are you sure you want to Logout?")) e.preventDefault();
                  }}
                >
                  <FaSignOutAlt /> <span>Logout</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Main Content */}
          <div className="admin-qa-container">
            <h2 className="admin-qa-title">Q&A Management</h2>
            <button className="admin-qa-create-btn" onClick={() => navigate("/create")}>
              Create New Q&A
            </button>

            <table className="admin-qa-table">
              <thead>
                <tr>
                  <th>Question</th>
                  <th>Answer</th>
                  <th>Category</th>
                  <th>Created Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {QandA &&
                  QandA.map((item) => (
                    <tr key={item._id}>
                      <td>{item.question}</td>
                      <td>{item.answer}</td>
                      <td>{item.category}</td>
                      <td>{new Date(item.createdDate).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="admin-qa-action-btn admin-qa-update-btn"
                          onClick={() => navigate(`/update/${item._id}`)}
                        >
                          Update
                        </button>
                        <button
                          className="admin-qa-action-btn admin-qa-delete-btn"
                          onClick={() => deleteHandler(item._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
        <Footer/>
      </div>
    </>
  );
}

export default QandADisplay;