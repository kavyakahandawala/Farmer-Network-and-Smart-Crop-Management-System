import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import {
  FaUsers,
  FaStore,
  FaComments,
  FaSeedling,
  FaSignOutAlt,
  FaTachometerAlt,
  FaQuestionCircle,
} from "react-icons/fa";
import "../adminDashboard/adminDashboard.css";
import "./QandAPostView.css";
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const URL = "http://localhost:5000/post";

function QandAPostView() {
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(URL);
      setPosts(response.data.post);
    } catch (err) {
      console.error("Error fetching posts:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const filteredPosts = posts.filter((post) => {
    if (filter === "withReplies") return post.reply.length > 0;
    if (filter === "withoutReplies") return post.reply.length === 0;
    return true;
  });

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const green = [46, 125, 50];
    const now = new Date();
    const formattedDate = now.toLocaleString("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(...green);
    doc.text("AgroSphere", 20, 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text("agrosphere@gmail.com", 20, 28);
    doc.text("AgroSphere, Colombo Rd, Kurunegala", 20, 34);

    doc.setFont("helvetica", "italic");
    doc.text(`${formattedDate}`, 20, 42);
    doc.line(20, 46, 190, 46);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Q&A Forum - Posts Report", 105, 55, { align: "center" });

    autoTable(doc, {
      startY: 65,
      head: [["Question", "Creator", "Email", "Phone", "Posted On", "Replies"]],
      body: filteredPosts.map((post) => [
        post.creatorQuestion,
        post.creatorName,
        post.creatorEmail,
        post.creatorPhone,
        new Date(post.postCreatedDate).toLocaleDateString(),
        post.reply.length > 0
          ? post.reply
              .map((r) => `${r.responderName}: ${r.responderAnswer}`)
              .join("\n")
          : "No replies",
      ]),
      theme: "striped",
      headStyles: {
        fillColor: green,
        textColor: 255,
        fontStyle: "bold",
      },
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: "linebreak",
        valign: "middle",
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 25 },
        2: { cellWidth: 35 },
        3: { cellWidth: 20 },
        4: { cellWidth: 20 },
        5: { cellWidth: 45 },
      },
      didDrawPage: (data) => {
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text(
          `Page ${data.pageNumber} of ${pageCount}`,
          105,
          290,
          { align: "center" }
        );
      },
    });

    doc.save(`AgroSphere_QA_Posts_${now.toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <>
      <Helmet>
        <title>AgroSphere | Admin Post Display</title>
      </Helmet>
      <Header/>

      <div className="admin-post-layout">
        {/* Sidebar */}
        <div className="admin-post-sidebar">
          <ul className="admin-post-menu">
            <li><Link to="/admin"><FaTachometerAlt /> <span>Dashboard</span></Link></li>
            <li><Link to="/admin/dashboard"><FaUsers /> <span>User Management</span></Link></li>
            <li><Link to="/marketwatch"><FaStore /> <span>Market Watch</span></Link></li>
            <li><Link to="/admin/productable"><FaSeedling /> <span>Add Crop Inputs</span></Link></li>
            <li><Link to="/admin/payment"><FaSeedling /> <span>Order Management</span></Link></li>
            <li><Link to="/admin/qaforum"><FaComments /> <span>Q & A Forum</span></Link></li>
            <li className="admin-post-active">
              <Link to="/admin/qapost"><FaQuestionCircle /> <span>Q & A Post</span></Link>
            </li>
            <li>
              <a href="/" onClick={(e) => {
                if (!window.confirm("Are you sure you want to Logout?")) e.preventDefault();
              }}>
                <FaSignOutAlt /> <span>Logout</span>
              </a>
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <div className="admin-posts-container">
          <h2 className="admin-post-title">Admin - All Q&A Posts</h2>

          <div className="admin-post-filter-container">
            <button
              className={`admin-post-filter-btn ${filter === "all" ? "admin-post-filter-active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All Posts
            </button>
            <button
              className={`admin-post-filter-btn ${filter === "withReplies" ? "admin-post-filter-active" : ""}`}
              onClick={() => setFilter("withReplies")}
            >
              With Replies
            </button>
            <button
              className={`admin-post-filter-btn ${filter === "withoutReplies" ? "admin-post-filter-active" : ""}`}
              onClick={() => setFilter("withoutReplies")}
            >
              Without Replies
            </button>
            <button onClick={handleDownloadPDF} className="admin-post-pdf-btn">
              Download PDF
            </button>
          </div>

          {filteredPosts.length === 0 ? (
            <p className="admin-post-empty">No posts available.</p>
          ) : (
            <table className="admin-posts-table">
              <thead>
                <tr>
                  <th>Question</th>
                  <th>Creator</th>
                  <th>Email</th>
                  <th>Phone Number</th>
                  <th>Image</th>
                  <th>Posted On</th>
                  <th>Replies</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((post) => (
                  <tr key={post._id}>
                    <td>{post.creatorQuestion}</td>
                    <td>{post.creatorName}</td>
                    <td>{post.creatorEmail}</td>
                    <td>{post.creatorPhone}</td>
                    <td>
                      {post.image ? (
                        <img
                          src={post.image}
                          alt="Post"
                          className="admin-post-img"
                          onClick={() => setSelectedImage(post.image)}
                        />
                      ) : (
                        "No image"
                      )}
                    </td>
                    <td>{new Date(post.postCreatedDate).toLocaleString()}</td>
                    <td>
                      {post.reply.length === 0
                        ? "No replies"
                        : post.reply.map((r, idx) => (
                            <div key={idx} className="admin-post-reply-item">
                              <strong>{r.responderName}:</strong> {r.responderAnswer}
                            </div>
                          ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selectedImage && (
        <div className="admin-post-image-modal" onClick={() => setSelectedImage(null)}>
          <div className="admin-post-image-modal-content">
            <img src={selectedImage} alt="Preview" />
          </div>
        </div>
      )}
       <Footer/>
    </>
  );
}

export default QandAPostView;
