import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
console.log("API_BASE_URL",API_BASE_URL);


function App() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    skills: "",
    experience: "",
  });

  const [talents, setTalents] = useState([]);
  const [skillFilter, setSkillFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTalents, setTotalTalents] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchTalents = async (currentPage = 1, skill = "") => {
    try {
      setLoading(true);
      setError("");

      const params = { page: currentPage };
      if (skill.trim()) {
        params.skill = skill.trim();
      }

      const response = await axios.get(`${API_BASE_URL}/api/talents`, { params });

      setTalents(response.data.talents || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalTalents(response.data.totalTalents || 0);
      setPage(Number(response.data.page) || 1);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch talents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTalents(page, skillFilter);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        skills: formData.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter((skill) => skill !== ""),
        experience: Number(formData.experience),
      };

      await axios.post(`${API_BASE_URL}/api/talents`, payload);

      setMessage("Talent added successfully");
      setFormData({
        name: "",
        email: "",
        skills: "",
        experience: "",
      });

      fetchTalents(1, skillFilter);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add talent");
    }
  };

  const handleFilter = () => {
    setPage(1);
    fetchTalents(1, skillFilter);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchTalents(newPage, skillFilter);
  };

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-lg-5 mb-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h2 className="mb-4">Talent Directory</h2>

              {message && <div className="alert alert-success">{message}</div>}
              {error && <div className="alert alert-danger">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Skills</label>
                  <input
                    type="text"
                    name="skills"
                    className="form-control"
                    placeholder="React, Node, MongoDB"
                    value={formData.skills}
                    onChange={handleChange}
                    required
                  />
                  <small className="text-muted">
                    Enter skills separated by commas
                  </small>
                </div>

                <div className="mb-3">
                  <label className="form-label">Experience (years)</label>
                  <input
                    type="number"
                    name="experience"
                    className="form-control"
                    value={formData.experience}
                    onChange={handleChange}
                    required
                    min="0"
                  />
                </div>

                <button type="submit" className="btn btn-primary w-100">
                  Add Talent
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 gap-2">
                <h3 className="mb-0">Talent List</h3>
                <span className="badge bg-secondary">
                  Total: {totalTalents}
                </span>
              </div>

              <div className="row g-2 mb-4">
                <div className="col-md-9">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Filter by skill, e.g. React"
                    value={skillFilter}
                    onChange={(e) => setSkillFilter(e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <button className="btn btn-dark w-100" onClick={handleFilter}>
                    Filter
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status"></div>
                </div>
              ) : talents.length === 0 ? (
                <div className="alert alert-warning mb-0">No talents found</div>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="table table-bordered table-hover align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Skills</th>
                          <th>Experience</th>
                        </tr>
                      </thead>
                      <tbody>
                        {talents.map((talent) => (
                          <tr key={talent._id}>
                            <td>{talent.name}</td>
                            <td>{talent.email}</td>
                            <td>{talent.skills.join(", ")}</td>
                            <td>{talent.experience} years</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <nav className="mt-3">
                    <ul className="pagination justify-content-center mb-0">
                      <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(page - 1)}
                        >
                          Previous
                        </button>
                      </li>

                      {[...Array(totalPages)].map((_, index) => {
                        const pageNumber = index + 1;
                        return (
                          <li
                            key={pageNumber}
                            className={`page-item ${page === pageNumber ? "active" : ""}`}
                          >
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(pageNumber)}
                            >
                              {pageNumber}
                            </button>
                          </li>
                        );
                      })}

                      <li
                        className={`page-item ${page === totalPages ? "disabled" : ""}`}
                      >
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(page + 1)}
                        >
                          Next
                        </button>
                      </li>
                    </ul>
                  </nav>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
