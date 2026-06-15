import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import "./QandAForm.css";
import Header from '../Header/Header';
import Footer from '../Footer/Footer';

const URL = "http://localhost:5000/QandA";

function QandAForm() {
  const [QandA, setQandA] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [expanded, setExpanded] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(URL).then((res) => {
      setQandA(res.data.QandA);
    });
  }, []);

  const toggleAnswer = (id) => setExpanded(expanded === id ? null : id);

  const filteredQandA = QandA.filter(
    (item) =>
      item.question.toLowerCase().includes(search.toLowerCase()) &&
      (category === "all" || item.category === category)
  );

  // Inline background style
  const backgroundStyle = {
    background: `url("/images/form.jpg") no-repeat center center/cover`
  };

  return (
    <>
      <Helmet>
        <title>AgroSphere | Q&A</title>
      </Helmet>

      <div className="page-layout">
        <Header />

        <main className="qanda-form-container" style={backgroundStyle}>
          <h1 className="qanda-form-header">🌾 Agriculture Q&A Forum</h1>

          <div className="qanda-search-filter">
            <input
              type="text"
              placeholder="Search questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="qanda-search-input"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="qanda-filter-select"
            >
              <option value="all">All Categories</option>
              <option value="SoilHealth">Soil Health</option>
              <option value="WaterManagement">Water Management</option>
              <option value="OrganicFarming">Organic Farming</option>
              <option value="ClimateChange">Climate Change</option>
              <option value="Sustainability">Sustainability</option>
            </select>
          </div>

          <div className="qanda-qa-list">
            {filteredQandA.map((qa) => (
              <div key={qa._id} className="qanda-qa-card">
                <div className="qanda-qa-header" onClick={() => toggleAnswer(qa._id)}>
                  <h3>{qa.question}</h3>
                  <button className="qanda-toggle-btn">
                    {expanded === qa._id ? "−" : "+"}
                  </button>
                </div>
                {expanded === qa._id && <p className="qanda-qa-answer">{qa.answer}</p>}
                <span className="qanda-qa-category">#{qa.category}</span>
              </div>
            ))}
          </div>

          <div className="qanda-create-btn-container">
            <button onClick={() => navigate("/post/create")} className="qanda-create-btn">
              ➕ Create Post
            </button>
          </div>

          <button className="qanda-chatbot-icon" onClick={() => navigate("/advisor")}>
            💬
          </button>
        </main>

        <Footer />
      </div>
    </>
  );
}

export default QandAForm;