import { useEffect, useState } from "react";
import { api } from "./api";

const blankJob = {
  title: "",
  description: "",
  category: "",
  location: "",
  employmentType: "FULL_TIME",
  salaryMin: "",
  salaryMax: "",
  closesAt: "",
  questions: [{ label: "Tell us about your experience.", type: "TEXTAREA", required: false, options: "" }]
};

const savedToken = () => localStorage.getItem("niajiri_token") || "";
const parseOptions = (question) => {
  try {
    return JSON.parse(question.options || "[]");
  } catch {
    return [];
  }
};

function Notice({ notice }) {
  return notice ? <p className={`notice ${notice.type}`}>{notice.text}</p> : null;
}

function AuthShell({ title, subtitle, children }) {
  return (
    <main className="auth">
      <section className="brand">
        <div className="mark">N</div>
        <h1>Niajiri</h1>
        <p>Recruit better. Build teams that move Tanzania forward.</p>
        <a href="/chat" className="candidate-link">Looking for work? Meet NiaBot →</a>
      </section>
      <section className="card">
        <span className="eyebrow">EMPLOYER PORTAL</span>
        <h2>{title}</h2>
        <p className="muted">{subtitle}</p>
        {children}
      </section>
    </main>
  );
}

function Login({ onLogin, setScreen }) {
  const [email, setEmail] = useState("employer@niajiri.co.tz");
  const [password, setPassword] = useState("Password123!");
  const [notice, setNotice] = useState();
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setNotice();

    try {
      await onLogin(email, password);
    } catch (error) {
      setNotice({
        type: "error",
        text: error.message.includes("fetch")
          ? "Cannot reach the API. Start the backend on port 5000."
          : error.message
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to manage your hiring pipeline.">
      <form className="form" onSubmit={submit}>
        <label>
          Work email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <button disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
        <button type="button" className="link" onClick={() => setScreen("forgot")}>Forgot your password?</button>
        <button type="button" className="link" onClick={() => setScreen("register")}>Create an employer account</button>
        <Notice notice={notice} />
      </form>
    </AuthShell>
  );
}

function Register({ onRegister, setScreen }) {
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState();
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setNotice();

    try {
      const response = await api.register({ fullName, companyName, email, password });
      onRegister(response.data.token, response.data.employer);
    } catch (error) {
      setNotice({ type: "error", text: error.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Create an employer account" subtitle="Register your company and start posting jobs.">
      <form className="form" onSubmit={submit}>
        <label>
          Full name
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </label>
        <label>
          Company name
          <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
        </label>
        <label>
          Work email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <button disabled={busy}>{busy ? "Registering…" : "Register"}</button>
        <button type="button" className="link" onClick={() => setScreen("login")}>Back to sign in</button>
        <Notice notice={notice} />
      </form>
    </AuthShell>
  );
}

function Forgot({ setScreen }) {
  const [email, setEmail] = useState("");
  const [notice, setNotice] = useState();
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setNotice();

    try {
      const response = await api.forgotPassword(email);
      setNotice({ type: "success", text: response.message });
    } catch (error) {
      setNotice({ type: "error", text: error.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Reset password" subtitle="Enter your email and we’ll send reset instructions.">
      <form className="form" onSubmit={submit}>
        <label>
          Work email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <button disabled={busy}>{busy ? "Sending…" : "Send reset instructions"}</button>
        <button type="button" className="link" onClick={() => setScreen("login")}>Back to sign in</button>
        <Notice notice={notice} />
      </form>
    </AuthShell>
  );
}

function JobQuestion({ index, question, onChange, onRemove, disableRemove }) {
  return (
    <div className="question-row">
      <div className="question-header">
        <strong>Question {index + 1}</strong>
        <button className="outline" type="button" disabled={disableRemove} onClick={onRemove}>Remove</button>
      </div>
      <label>
        Prompt
        <input value={question.label} onChange={(e) => onChange({ ...question, label: e.target.value })} required />
      </label>
      <label>
        Type
        <select value={question.type} onChange={(e) => onChange({ ...question, type: e.target.value })}>
          <option value="TEXT">Short answer</option>
          <option value="TEXTAREA">Long answer</option>
          <option value="YES_NO">Yes / no</option>
          <option value="NUMBER">Number</option>
          <option value="DATE">Date</option>
          <option value="DROPDOWN">Dropdown</option>
        </select>
      </label>
      <label>
        Required
        <select value={question.required ? "true" : "false"} onChange={(e) => onChange({ ...question, required: e.target.value === "true" })}>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </label>
      {question.type === "DROPDOWN" && (
        <label>
          Options
          <input
            placeholder="Comma-separated options"
            value={question.options || ""}
            onChange={(e) => onChange({ ...question, options: e.target.value })}
          />
        </label>
      )}
    </div>
  );
}

function JobForm({ token, onSaved, noticeSetter, selectedJob }) {
  const [job, setJob] = useState(blankJob);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!selectedJob) {
      setJob(blankJob);
      return;
    }

    setJob({
      title: selectedJob.title || "",
      description: selectedJob.description || "",
      category: selectedJob.category || "",
      location: selectedJob.location || "",
      employmentType: selectedJob.employmentType || "FULL_TIME",
      salaryMin: selectedJob.salaryMin ?? "",
      salaryMax: selectedJob.salaryMax ?? "",
      closesAt: selectedJob.closesAt ? selectedJob.closesAt.slice(0, 10) : "",
      questions: (selectedJob.questions || []).map((question) => ({
        label: question.label,
        type: question.type,
        required: question.required,
        options: question.options ? parseOptions(question).join(", ") : ""
      }))
    });
  }, [selectedJob]);

  const resetForm = () => setJob(blankJob);

  const addQuestion = () => {
    setJob((current) => ({
      ...current,
      questions: [...(current.questions || []), { label: "", type: "TEXT", required: true, options: "" }]
    }));
  };

  const updateQuestion = (index, updated) => {
    setJob((current) => ({
      ...current,
      questions: current.questions.map((question, idx) => (idx === index ? updated : question))
    }));
  };

  const removeQuestion = (index) => {
    setJob((current) => ({
      ...current,
      questions: current.questions.filter((_, idx) => idx !== index)
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    noticeSetter();

    try {
      const payload = {
        title: job.title,
        description: job.description,
        category: job.category,
        location: job.location,
        employmentType: job.employmentType,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        closesAt: job.closesAt,
        questions: (job.questions || []).map((question) => ({
          label: question.label,
          type: question.type,
          required: question.required,
          options: question.type === "DROPDOWN"
            ? (question.options || "").split(",").map((item) => item.trim()).filter(Boolean)
            : undefined
        }))
      };

      const response = selectedJob
        ? await api.updateJob(token, selectedJob.id, payload)
        : await api.createJob(token, payload);

      onSaved(response.data.job);
      noticeSetter({ type: "success", text: response.message });
      resetForm();
    } catch (error) {
      noticeSetter({ type: "error", text: error.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="job-form-panel">
      <div className="form-heading">
        <div>
          <h2>{selectedJob ? "Update role" : "Create new role"}</h2>
          <p className="muted">Build job postings with the right screening questions.</p>
        </div>
        <button type="button" className="outline" onClick={resetForm}>Reset form</button>
      </div>

      <form className="job-form" onSubmit={submit}>
        <div className="form-grid">
          <label>
            Job title
            <input value={job.title} onChange={(e) => setJob({ ...job, title: e.target.value })} required />
          </label>
          <label>
            Category
            <input value={job.category} onChange={(e) => setJob({ ...job, category: e.target.value })} required />
          </label>
          <label>
            Location
            <input value={job.location} onChange={(e) => setJob({ ...job, location: e.target.value })} required />
          </label>
          <label>
            Employment type
            <select value={job.employmentType} onChange={(e) => setJob({ ...job, employmentType: e.target.value })}>
              <option value="FULL_TIME">Full-time</option>
              <option value="PART_TIME">Part-time</option>
              <option value="CONTRACT">Contract</option>
              <option value="INTERNSHIP">Internship</option>
              <option value="TEMPORARY">Temporary</option>
            </select>
          </label>
          <label>
            Salary minimum
            <input value={job.salaryMin} onChange={(e) => setJob({ ...job, salaryMin: e.target.value })} />
          </label>
          <label>
            Salary maximum
            <input value={job.salaryMax} onChange={(e) => setJob({ ...job, salaryMax: e.target.value })} />
          </label>
          <label className="full-width">
            Closes at
            <input type="date" value={job.closesAt} onChange={(e) => setJob({ ...job, closesAt: e.target.value })} />
          </label>
          <label className="full-width">
            Description
            <textarea value={job.description} onChange={(e) => setJob({ ...job, description: e.target.value })} required />
          </label>
        </div>

        <div className="questions-section">
          <div className="form-heading">
            <div>
              <h3>Application questions</h3>
              <p className="muted">Ask the questions that matter before review.</p>
            </div>
            <button type="button" className="outline" onClick={addQuestion}>Add question</button>
          </div>

          {(job.questions || []).map((question, index) => (
            <JobQuestion
              key={index}
              index={index}
              question={question}
              onChange={(updated) => updateQuestion(index, updated)}
              onRemove={() => removeQuestion(index)}
              disableRemove={(job.questions || []).length === 1}
            />
          ))}
        </div>

        <button type="submit" className="primary" disabled={busy}>
          {busy ? "Saving role…" : selectedJob ? "Update role" : "Create role"}
        </button>
      </form>
    </section>
  );
}

function JobCard({ job, onEdit, onToggleStatus, onDelete }) {
  const statusLabel = job.status === "OPEN" ? "open" : "closed";

  return (
    <article className="role">
      <div className="job-header">
        <div>
          <h3>{job.title}</h3>
          <span>{job.location} · {job.employmentType.replace("_", " ")} · {job.questions?.length ?? 0} questions</span>
        </div>
        <span className={`pill ${statusLabel}`}>{statusLabel}</span>
      </div>
      <p>{job.description}</p>
      <div className="role-actions">
        <button className="outline" type="button" onClick={() => onEdit(job)}>Edit</button>
        <button className="outline" type="button" onClick={() => onToggleStatus(job)}>{job.status === "OPEN" ? "Close" : "Reopen"}</button>
        <button className="danger" type="button" onClick={() => onDelete(job)}>Delete</button>
      </div>
    </article>
  );
}

function ApplicationModal({ applicationSummary, token, onClose, onUpdated }) {
  const [detail, setDetail] = useState(null);
  const [status, setStatus] = useState(applicationSummary.status);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState();

  useEffect(() => {
    let isMounted = true;
    api.getApplication(token, applicationSummary.id)
      .then((res) => {
        if (isMounted) {
          setDetail(res.data.application);
          setStatus(res.data.application.status);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setNotice({ type: "error", text: err.message });
          setLoading(false);
        }
      });
    return () => { isMounted = false; };
  }, [applicationSummary.id, token]);

  const handleSave = async (e) => {
    e.preventDefault();
    setBusy(true);
    setNotice();

    try {
      await api.updateApplicationStatus(token, applicationSummary.id, status, note.trim() || undefined);
      setNotice({ type: "success", text: "Application status updated successfully! Candidate status page updated." });
      setNote("");
      const updatedRes = await api.getApplication(token, applicationSummary.id);
      setDetail(updatedRes.data.application);
      onUpdated();
    } catch (err) {
      setNotice({ type: "error", text: err.message });
    } finally {
      setBusy(false);
    }
  };

  const getMediaUrl = (path) => path ? (path.startsWith("http") ? path : `${import.meta.env.VITE_API_URL?.replace("/api", "") || "https://niajiri-backend.onrender.com"}${path}`) : "";

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <div>
            <h3>{applicationSummary.applicant.fullName}</h3>
            <span>Applying for: {applicationSummary.job.title}</span>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>×</button>
        </header>

        <div className="modal-body">
          {loading ? (
            <p className="muted" style={{ textAlign: "center", padding: 20 }}>Loading full candidate details…</p>
          ) : (
            <>
              {/* Candidate Info Section */}
              <section className="modal-section">
                <h4>👤 Candidate Details</h4>
                <div className="candidate-info-grid">
                  <div className="candidate-info-item">
                    <strong>Full Name</strong>
                    <span>{detail?.applicant?.fullName}</span>
                  </div>
                  <div className="candidate-info-item">
                    <strong>WhatsApp / Phone</strong>
                    <span>{detail?.applicant?.phone}</span>
                  </div>
                  <div className="candidate-info-item">
                    <strong>Email Address</strong>
                    <span>{detail?.applicant?.email || "N/A"}</span>
                  </div>
                  <div className="candidate-info-item">
                    <strong>Location</strong>
                    <span>{detail?.applicant?.location || "N/A"}</span>
                  </div>
                  <div className="candidate-info-item" style={{ gridColumn: "1 / -1" }}>
                    <strong>Skills</strong>
                    <span>{detail?.applicant?.skills || "Not specified"}</span>
                  </div>
                </div>

                {(detail?.resumeUrl || detail?.applicant?.cvUrl) && (
                  <div style={{ marginTop: 14 }}>
                    <a
                      href={getMediaUrl(detail.resumeUrl || detail.applicant.cvUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="cv-link-btn"
                    >
                      📄 Download / Open Uploaded CV
                    </a>
                  </div>
                )}
              </section>

              {/* Screening Q&A Responses */}
              {detail?.answers?.length > 0 && (
                <section className="modal-section">
                  <h4>📝 Screening Question Responses</h4>
                  <div className="screening-qa-list">
                    {detail.answers.map((answer) => (
                      <div key={answer.id} className="qa-item">
                        <div className="qa-question">{answer.question?.label || "Screening Question"}</div>
                        <div className="qa-answer">{answer.value || "(No answer provided)"}</div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Recruiter Action & Status Update Form */}
              <section className="modal-section" style={{ background: "#ffffff", border: "1.5px solid var(--teal-medium)" }}>
                <h4>⚡ Take Action / Update Status</h4>
                <form className="recruiter-action-form" onSubmit={handleSave}>
                  <label>
                    Pipeline Status
                    <select value={status} onChange={(e) => setStatus(e.target.value)}>
                      <option value="PENDING">Pending (New Applicant)</option>
                      <option value="UNDER_REVIEW">Under Review</option>
                      <option value="SHORTLISTED">Shortlisted</option>
                      <option value="INTERVIEW">Scheduled for Interview</option>
                      <option value="REJECTED">Rejected</option>
                      <option value="HIRED">Hired</option>
                    </select>
                  </label>

                  <label>
                    Recruiter Feedback / Note (Optional)
                    <textarea
                      placeholder="Add recruiter feedback, interview schedule notes, or candidate comments..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </label>

                  <button type="submit" className="primary" disabled={busy}>
                    {busy ? "Updating Action…" : "Save & Update Candidate Action"}
                  </button>
                </form>
                <Notice notice={notice} />
              </section>

              {/* Status History Timeline Log */}
              {detail?.statusHistory?.length > 0 && (
                <section className="modal-section">
                  <h4>📜 Action Audit Trail & Feedback Log</h4>
                  <div className="log-timeline">
                    {detail.statusHistory.map((history) => (
                      <div key={history.id} className="log-item">
                        <div className="log-item-meta">
                          {history.status.replace("_", " ").toLowerCase()}
                          <span>
                            by {history.changedBy?.fullName || "Recruiter"} on {new Date(history.createdAt).toLocaleDateString()} at {new Date(history.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        {history.note && <p className="log-item-note">"{history.note}"</p>}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>

        <footer className="modal-footer">
          <button type="button" className="outline" onClick={onClose}>Close Window</button>
        </footer>
      </div>
    </div>
  );
}

function Dashboard({ employer, token, onLogout }) {
  const [jobs, setJobs] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [applications, setApplications] = useState([]);
  const [notice, setNotice] = useState();
  const [busy, setBusy] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [inspectApplication, setInspectApplication] = useState(null);

  const loadDashboard = async () => {
    if (!token) return;

    try {
      const [jobsResult, dashResult] = await Promise.all([
        api.myJobs(token),
        api.dashboard(token)
      ]);

      setJobs(jobsResult.data.jobs);
      setMetrics(dashResult.data.metrics);
      setApplications(dashResult.data.recentApplications || []);
    } catch (error) {
      setNotice({ type: "error", text: error.message });
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [token]);

  const saveJob = (job) => {
    setJobs((existing) => {
      const updated = existing.find((item) => item.id === job.id);
      if (updated) {
        return existing.map((item) => (item.id === job.id ? job : item));
      }
      return [job, ...existing];
    });
    setSelectedJob(null);
    loadDashboard();
  };

  const editJob = (job) => {
    setSelectedJob(job);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleStatus = async (job) => {
    setBusy(true);
    setNotice();

    try {
      await api.updateJob(token, job.id, { status: job.status === "OPEN" ? "CLOSED" : "OPEN" });
      loadDashboard();
    } catch (error) {
      setNotice({ type: "error", text: error.message });
    } finally {
      setBusy(false);
    }
  };

  const deleteJob = async (job) => {
    if (!window.confirm(`Delete ${job.title}?`)) return;
    setBusy(true);
    setNotice();

    try {
      const response = await api.deleteJob(token, job.id);
      setNotice({ type: "success", text: response.message });
      setJobs((existing) => existing.filter((item) => item.id !== job.id));
      loadDashboard();
    } catch (error) {
      setNotice({ type: "error", text: error.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="manage">
      {inspectApplication && (
        <ApplicationModal
          applicationSummary={inspectApplication}
          token={token}
          onClose={() => setInspectApplication(null)}
          onUpdated={loadDashboard}
        />
      )}

      <section className="dashboard-summary">
        <header className="header-row">
          <div>
            <div className="logo"><span className="mark small">N</span><strong>Niajiri</strong></div>
            <p className="muted">Welcome back, {employer.fullName}</p>
          </div>
          <div className="profile">
            <a href="/chat">Open NiaBot</a>
            <button className="outline" onClick={onLogout}>Sign out</button>
          </div>
        </header>

        <div className="summary-grid">
          <article className="summary-card">
            <span className="eyebrow">Open roles</span>
            <strong>{metrics?.openJobs ?? jobs.filter((job) => job.status === "OPEN").length}</strong>
          </article>
          <article className="summary-card">
            <span className="eyebrow">Closed roles</span>
            <strong>{metrics?.closedJobs ?? jobs.filter((job) => job.status !== "OPEN").length}</strong>
          </article>
          <article className="summary-card">
            <span className="eyebrow">Applicants</span>
            <strong>{metrics?.totalApplicants ?? 0}</strong>
          </article>
          <article className="summary-card">
            <span className="eyebrow">Shortlisted</span>
            <strong>{metrics?.shortlisted ?? 0}</strong>
          </article>
        </div>

        <Notice notice={notice} />
      </section>

      <div className="manage-grid">
        <JobForm token={token} onSaved={saveJob} noticeSetter={setNotice} selectedJob={selectedJob} />

        <section className="roles-panel">
          <div className="form-heading">
            <div>
              <h2>Your jobs</h2>
              <p className="muted">Manage roles, review questions, and track candidate interest.</p>
            </div>
          </div>

          <div className="roles-list">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onEdit={editJob}
                onToggleStatus={toggleStatus}
                onDelete={deleteJob}
              />
            ))}
            {!jobs.length && <p className="muted">No roles yet. Create your first job to start collecting applications.</p>}
          </div>
        </section>
      </div>

      <section className="applications-panel">
        <div className="form-heading">
          <div>
            <h2>Recent applications inbox</h2>
            <p className="muted">Click any application to review candidate screening answers, CV, and update action feedback.</p>
          </div>
        </div>

        <div className="application-list">
          {applications.map((application) => (
            <article key={application.id} className="role" style={{ borderLeft: "4px solid var(--teal-medium)" }}>
              <div className="job-header">
                <div>
                  <h3>{application.applicant.fullName}</h3>
                  <span>{application.job.title} · {application.applicant.email || application.applicant.phone}</span>
                </div>
                <span className={`pill ${application.status === "PENDING" ? "open" : application.status === "REJECTED" ? "closed" : "open"}`}>
                  {application.status.replace("_", " ").toLowerCase()}
                </span>
              </div>
              <p>Submitted: {new Date(application.submittedAt).toLocaleDateString()}</p>
              
              <div style={{ marginTop: 14, display: "flex", gap: 10, alignItems: "center" }}>
                <button
                  type="button"
                  className="primary"
                  style={{ fontSize: 13, padding: "8px 16px" }}
                  onClick={() => setInspectApplication(application)}
                >
                  🔍 Read Application & Take Action
                </button>
                {application.resumeUrl && (
                  <a
                    href={application.resumeUrl.startsWith("http") ? application.resumeUrl : `${import.meta.env.VITE_API_URL?.replace("/api", "") || "https://niajiri-backend.onrender.com"}${application.resumeUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="cv-link-btn"
                    style={{ marginTop: 0 }}
                  >
                    📄 CV
                  </a>
                )}
              </div>
            </article>
          ))}
          {!applications.length && <p className="muted">No applications yet. Candidates will appear here once they apply.</p>}
        </div>
      </section>
    </main>
  );
}

function WhatsAppChatBubble({ message }) {
  const isBot = message.sender === "BOT";
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className={`whatsapp-msg-row ${isBot ? "bot" : "user"}`}>
      <div className={`whatsapp-bubble-box ${isBot ? "bot" : "user"}`}>
        {message.content}
        <div className="whatsapp-msg-meta">
          <span>{timeStr}</span>
          {!isBot && <span className="whatsapp-ticks">✓✓</span>}
        </div>
      </div>
    </div>
  );
}

function NiaBot() {
  const [jobs, setJobs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ fullName: "", phone: "", email: "", language: "EN" });
  const [cvFile, setCvFile] = useState(null);
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [answer, setAnswer] = useState("");
  const [statusQuery, setStatusQuery] = useState({ phone: "", email: "" });
  const [statusResult, setStatusResult] = useState(null);
  const [statusNotice, setStatusNotice] = useState();
  const [statusBusy, setStatusBusy] = useState(false);
  const [notice, setNotice] = useState();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.jobs()
      .then((response) => setJobs(response.data.jobs))
      .catch(() => setNotice({ type: "error", text: "NiaBot cannot reach the API. Please check your connection." }));
  }, []);

  const begin = async (e) => {
    e.preventDefault();
    setNotice();

    if (!selected) return setNotice({ type: "error", text: "Choose a job before starting." });
    if (!form.fullName.trim() || !form.phone.trim()) return setNotice({ type: "error", text: "Full name and phone are required." });

    setBusy(true);

    try {
      let cvUrl = null;
      if (cvFile) {
        const uploadRes = await api.uploadCv(cvFile);
        cvUrl = uploadRes.cvUrl;
      }
      const response = await api.startChat({ jobId: selected.id, cvUrl, ...form });
      setSession({ id: response.data.sessionId, question: response.data.question, complete: response.data.complete });
      setMessages([
        { sender: "BOT", content: response.data.greeting },
        ...(response.data.question ? [{ sender: "BOT", content: response.data.question.label, options: response.data.question.options }] : [])
      ]);
    } catch (error) {
      setNotice({ type: "error", text: error.message });
    } finally {
      setBusy(false);
    }
  };

  const sendAnswerText = async (textToSend) => {
    if (!session) return;
    setBusy(true);
    setNotice();

    try {
      const response = await api.answerChat(session.id, textToSend);
      setMessages((current) => [
        ...current,
        { sender: "USER", content: textToSend || "Skipped" },
        { sender: "BOT", content: response.data.message, options: response.data.question?.options }
      ]);
      setSession({ ...session, question: response.data.question, complete: response.data.complete });
      setAnswer("");
    } catch (error) {
      setNotice({ type: "error", text: error.message });
    } finally {
      setBusy(false);
    }
  };

  const send = async (e) => {
    e.preventDefault();
    sendAnswerText(answer);
  };

  const lookupStatus = async (e) => {
    e.preventDefault();
    setStatusNotice();
    setStatusResult(null);

    if (!statusQuery.phone.trim() && !statusQuery.email.trim()) {
      return setStatusNotice({ type: "error", text: "Enter your phone or email to check application status." });
    }

    setStatusBusy(true);
    try {
      const response = await api.applicationStatus({ phone: statusQuery.phone.trim(), email: statusQuery.email.trim() });
      setStatusResult(response.data);
    } catch (error) {
      setStatusNotice({ type: "error", text: error.message });
    } finally {
      setStatusBusy(false);
    }
  };

  const complete = session?.complete;

  return (
    <main className="bot">
      <header>
        <div className="logo"><span className="mark small">N</span><strong>NiaBot</strong></div>
        <div style={{display: 'flex', gap: 12, alignItems: 'center'}}>
          <a href="/status" className="outline" style={{textDecoration: 'none'}}>Track Application</a>
          <a href="/" className="outline" style={{textDecoration: 'none'}}>Employer sign in</a>
        </div>
      </header>
      <section className="bot-intro">
        <span className="eyebrow">YOUR WHATSAPP JOB SEARCH ASSISTANT</span>
        <h1>Find work. Apply in WhatsApp.</h1>
        <p>Experience an authentic WhatsApp job application conversational flow live in your browser.</p>
      </section>

      {!session ? (
        <section className="bot-start">
          <div className="jobs">
            <h2>Open positions</h2>
            {jobs.map((job) => (
              <button
                key={job.id}
                type="button"
                className={`job-card ${selected?.id === job.id ? "selected" : ""}`}
                onClick={() => setSelected(job)}
              >
                <strong>{job.title}</strong>
                <span>{job.location} · {job.employmentType.replace("_", " ")}</span>
              </button>
            ))}
            {!jobs.length && <p className="muted">No open roles are available right now.</p>}
          </div>

          <div className="candidate-panel">
            <form className="candidate-form" onSubmit={begin}>
              <h2>Start your WhatsApp application</h2>
              <label>
                Full name
                <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
              </label>
              <label>
                WhatsApp phone
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
              </label>
              <label>
                Email (optional)
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </label>
              <label>
                Upload CV (PDF, Word)
                <input type="file" className="file-upload-input" accept=".pdf,.doc,.docx" onChange={(e) => setCvFile(e.target.files[0])} />
              </label>
              <label>
                Language
                <select value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}>
                  <option value="EN">English</option>
                  <option value="SW">Swahili</option>
                </select>
              </label>
              <button disabled={busy}>{busy ? "Opening WhatsApp chat…" : "Start WhatsApp chat"}</button>
              <Notice notice={notice} />
            </form>

            <section className="status-panel">
              <h2>Check application status</h2>
              <p className="muted">Use the phone or email you provided when applying. Or view it on the <a href="/status" style={{color: '#0f766e', fontWeight: 'bold'}}>dedicated status page</a>.</p>
              <form className="status-form" onSubmit={lookupStatus}>
                <label>
                  WhatsApp phone
                  <input value={statusQuery.phone} onChange={(e) => setStatusQuery((current) => ({ ...current, phone: e.target.value }))} placeholder="e.g. +255 674 941 820" />
                </label>
                <label>
                  Email
                  <input type="email" value={statusQuery.email} onChange={(e) => setStatusQuery((current) => ({ ...current, email: e.target.value }))} placeholder="optional" />
                </label>
                <button type="submit" disabled={statusBusy}>{statusBusy ? "Checking…" : "Check status"}</button>
              </form>

              {statusResult && (
                <div className="status-result">
                  {statusResult.applications.length ? (
                    statusResult.applications.map((application) => (
                      <article key={application.id} className="role">
                        <div className="job-header">
                          <div>
                            <h3>{application.job.title}</h3>
                            <span>{application.job.location}</span>
                          </div>
                          <span className={`pill ${application.status === "PENDING" ? "open" : "closed"}`}>{application.status.toLowerCase()}</span>
                        </div>
                        <p>Submitted: {new Date(application.submittedAt).toLocaleDateString()}</p>
                      </article>
                    ))
                  ) : (
                    <p className="muted">No applications found for that phone or email.</p>
                  )}
                </div>
              )}

              <Notice notice={statusNotice} />
            </section>
          </div>
        </section>
      ) : (
        <section className="whatsapp-chat-container">
          {/* Authentic WhatsApp Header */}
          <div className="whatsapp-chat-header">
            <div className="whatsapp-profile-info">
              <div className="whatsapp-avatar">
                N
                <div className="whatsapp-avatar-badge">✓</div>
              </div>
              <div className="whatsapp-title-group">
                <h3>
                  Niajiri Mama · NiaBot
                  <span style={{ color: "#25d366", fontSize: 13 }}>✓</span>
                </h3>
                <span>online • Business Account</span>
              </div>
            </div>
            <div className="whatsapp-header-actions">
              <span>📞</span>
              <span>🔍</span>
              <span>⋮</span>
            </div>
          </div>

          {/* WhatsApp Chat Body */}
          <div className="whatsapp-chat-body">
            <div className="whatsapp-date-divider">TODAY</div>
            {messages.map((message, index) => (
              <div key={index}>
                <WhatsAppChatBubble message={message} />
                {/* Interactive choice chips if bot asks YES_NO or dropdown */}
                {message.sender === "BOT" && index === messages.length - 1 && !complete && (
                  <div className="whatsapp-chips-container">
                    {session?.question?.type === "YES_NO" && (
                      <>
                        <button type="button" className="whatsapp-chip-btn" onClick={() => sendAnswerText("Yes")}>Yes</button>
                        <button type="button" className="whatsapp-chip-btn" onClick={() => sendAnswerText("No")}>No</button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* WhatsApp Footer & Input Bar */}
          <form className="whatsapp-chat-footer" onSubmit={send}>
            <button type="button" className="whatsapp-icon-btn">😊</button>
            <button type="button" className="whatsapp-icon-btn">📎</button>
            <input
              className="whatsapp-input-field"
              placeholder={complete ? "Application submitted ✅" : "Type a message..."}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={busy || complete}
              required={!complete}
            />
            <button type="submit" className="whatsapp-send-btn" disabled={busy || complete}>
              {complete ? "✓" : "➤"}
            </button>
          </form>
          <Notice notice={notice} />
        </section>
      )}
    </main>
  );
}


function CandidateStatusPage() {
  const [query, setQuery] = useState({ phone: "", email: "" });
  const [result, setResult] = useState(null);
  const [notice, setNotice] = useState();
  const [busy, setBusy] = useState(false);

  const lookupStatus = async (e) => {
    e.preventDefault();
    setNotice();
    setResult(null);

    if (!query.phone.trim() && !query.email.trim()) {
      return setNotice({ type: "error", text: "Enter your phone or email to check application status." });
    }

    setBusy(true);
    try {
      const response = await api.applicationStatus({ phone: query.phone.trim(), email: query.email.trim() });
      setResult(response.data);
    } catch (error) {
      setNotice({ type: "error", text: error.message });
    } finally {
      setBusy(false);
    }
  };

  const getStepClass = (status, currentStatus) => {
    const stepsOrder = ["PENDING", "UNDER_REVIEW", "SHORTLISTED", "INTERVIEW", "HIRED"];
    if (currentStatus === "REJECTED" && status === "HIRED") {
      return "rejected-step";
    }
    const currentIdx = stepsOrder.indexOf(currentStatus);
    const stepIdx = stepsOrder.indexOf(status);

    if (currentStatus === "REJECTED" && stepIdx < 4) {
      return "completed";
    }

    if (currentStatus === "REJECTED" && status === "HIRED") {
      return "rejected-step";
    }

    if (stepIdx < currentIdx) return "completed";
    if (stepIdx === currentIdx) return "active";
    return "";
  };

  const getMediaUrl = (path) => path ? (path.startsWith("http") ? path : `${import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000"}${path}`) : "";

  return (
    <main className="status-page">
      <a href="/chat" className="back-home">← Back to NiaBot</a>
      
      <header className="status-header">
        <h1>Application Status</h1>
        <p>Track your recruitment progress in real time.</p>
      </header>

      <section className="status-card-search">
        <h2>Enter your contact details</h2>
        <form className="status-form-row" onSubmit={lookupStatus}>
          <label>
            WhatsApp phone
            <input 
              value={query.phone} 
              onChange={(e) => setQuery((curr) => ({ ...curr, phone: e.target.value }))} 
              placeholder="e.g. +255 674 941 820" 
            />
          </label>
          <label>
            Email address
            <input 
              type="email" 
              value={query.email} 
              onChange={(e) => setQuery((curr) => ({ ...curr, email: e.target.value }))} 
              placeholder="e.g. name@domain.com" 
            />
          </label>
          <button type="submit" disabled={busy}>{busy ? "Checking…" : "Check Status"}</button>
        </form>
        <Notice notice={notice} />
      </section>

      {result && (
        <section className="status-results">
          {result.applications.length ? (
            result.applications.map((app) => {
              const currentStatus = app.status;
              const isRejected = currentStatus === "REJECTED";
              const isHired = currentStatus === "HIRED";
              
              return (
                <article key={app.id} className={`app-status-card ${isRejected ? 'rejected' : isHired ? 'hired' : ''}`}>
                  <header className="app-status-card-header">
                    <div>
                      <h3>{app.job.title}</h3>
                      <span>{app.job.location} · Submitted {new Date(app.submittedAt).toLocaleDateString()}</span>
                    </div>
                    <span className={`pill ${isRejected ? 'closed' : isHired ? 'open' : 'open'}`}>
                      {currentStatus.replace("_", " ").toLowerCase()}
                    </span>
                  </header>

                  <div className="stepper-timeline">
                    <div className={`stepper-step ${getStepClass("PENDING", currentStatus)}`}>
                      <div className="stepper-dot">1</div>
                      <div className="stepper-label">Applied</div>
                    </div>
                    <div className={`stepper-step ${getStepClass("UNDER_REVIEW", currentStatus)}`}>
                      <div className="stepper-dot">2</div>
                      <div className="stepper-label">Reviewing</div>
                    </div>
                    <div className={`stepper-step ${getStepClass("SHORTLISTED", currentStatus)}`}>
                      <div className="stepper-dot">3</div>
                      <div className="stepper-label">Shortlist</div>
                    </div>
                    <div className={`stepper-step ${getStepClass("INTERVIEW", currentStatus)}`}>
                      <div className="stepper-dot">4</div>
                      <div className="stepper-label">Interview</div>
                    </div>
                    <div className={`stepper-step ${isRejected ? 'rejected-step' : getStepClass("HIRED", currentStatus)}`}>
                      <div className="stepper-dot">5</div>
                      <div className="stepper-label">{isRejected ? "Rejected" : "Hired"}</div>
                    </div>
                  </div>

                  {app.resumeUrl && (
                    <div style={{ marginTop: 16 }}>
                      <a href={getMediaUrl(app.resumeUrl)} target="_blank" rel="noreferrer" className="cv-link-btn">
                        📄 View Uploaded CV
                      </a>
                    </div>
                  )}

                  {app.statusHistory.length > 0 && (
                    <div className="status-history-log">
                      <h4>Timeline History</h4>
                      <div className="log-timeline">
                        {app.statusHistory.map((history) => (
                          <div key={history.id} className="log-item">
                            <div className="log-item-meta">
                              {history.status.replace("_", " ").toLowerCase()}
                              <span>{new Date(history.createdAt).toLocaleDateString()} at {new Date(history.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                            {history.note && <p className="log-item-note">{history.note}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </article>
              );
            })
          ) : (
            <p className="muted" style={{ textAlign: 'center', padding: 20 }}>No applications found for that phone or email.</p>
          )}
        </section>
      )}
    </main>
  );
}

export default function App() {
  const isChat = window.location.pathname === "/chat";
  const isStatus = window.location.pathname === "/status";
  const [token, setToken] = useState(savedToken);
  const [employer, setEmployer] = useState(null);
  const [screen, setScreen] = useState("login");
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    api.me(token)
      .then((response) => setEmployer(response.data.employer))
      .catch(() => {
        localStorage.removeItem("niajiri_token");
        setToken("");
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = async (email, password) => {
    const response = await api.login(email, password);
    localStorage.setItem("niajiri_token", response.data.token);
    setEmployer(response.data.employer);
    setToken(response.data.token);
  };

  const register = (tokenValue, employerData) => {
    localStorage.setItem("niajiri_token", tokenValue);
    setEmployer(employerData);
    setToken(tokenValue);
  };

  const logout = async () => {
    try {
      await api.logout(token);
    } finally {
      localStorage.removeItem("niajiri_token");
      setEmployer(null);
      setToken("");
    }
  };

  if (isChat) return <NiaBot />;
  if (isStatus) return <CandidateStatusPage />;
  if (loading) return <div className="loading">Loading Niajiri…</div>;
  if (employer) return <Dashboard employer={employer} token={token} onLogout={logout} />;
  if (screen === "forgot") return <Forgot setScreen={setScreen} />;
  if (screen === "register") return <Register onRegister={register} setScreen={setScreen} />;

  return <Login onLogin={login} setScreen={setScreen} />;
}
