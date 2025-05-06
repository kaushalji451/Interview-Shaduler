"use client";
import { useState, useEffect } from "react";

export default function Page() {
  const [form, setForm] = useState({
    candidateName: "",
    email: "",
    position: "",
    interviewDate: "",
    interviewer: "",
  });
  const [resume, setResume] = useState(null);
  const [msg, setMsg] = useState("");
  const [interviews, setInterviews] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [viewResumeUrl, setViewResumeUrl] = useState("");

  const limit = 6;

  useEffect(() => {
    loadInterviews(1);
  }, []);

  const loadInterviews = async (pageToLoad) => {
    const res = await fetch(`/api/hr/interview?page=${pageToLoad}`);
    const data = await res.json();
    console.log(data);
   
    if (pageToLoad === 1) {
      setInterviews(data.interviews);
    } else {
      setInterviews((prev) => [...prev, ...data.interviews]);
    }
    setTotal(data.total);
    setPage(pageToLoad);
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    for (let key in form) {
        if (key === "interviewer") {
            const arr = form[key].split(",").map((i) => i.trim());
            arr.forEach((name) => fd.append("interviewer", name));
          } else {
            fd.append(key, form[key]);
          }          
    }

    if (resume) fd.append("resume", resume);
    const res = await fetch("/api/hr/interview", {
      method: "POST",
      body: fd,
    });

    const data = await res.json();
    setMsg(data.message);
    // setForm({
    //   candidateName: "",
    //   email: "",
    //   position: "",
    //   interviewDate: "",
    //   interviewer: "",
    // });
    setResume(null);
    loadInterviews(1);
  };

  const handleStatusChange = async (id, newStatus) => {
    const res = await fetch(`/api/hr/interview`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });

    const data = await res.json();
    setMsg(data.message);
    loadInterviews(1);
  };

  const deleteOne = async(id) => {
    await fetch(`/api/hr/interview`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
      });
      loadInterviews(1);
  }

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-500">
        <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Interview Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white shadow p-6 rounded"
      >
        <h2 className="text-xl font-bold">Schedule Interview</h2>
        <input
          name="candidateName"
          placeholder="Candidate Name"
          value={form.candidateName}
          onChange={handleChange}
          required
          className="w-full p-2 border"
        />
        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full p-2 border"
        />
        <input
          name="position"
          placeholder="Position"
          value={form.position}
          onChange={handleChange}
          required
          className="w-full p-2 border"
        />
        <input
          name="interviewDate"
          type="date"
          value={form.interviewDate}
          onChange={handleChange}
          required
          className="w-full p-2 border"
        />
        <input
          name="interviewer"
          placeholder="Interviewer Names (comma separated)"
          value={form.interviewer}
          onChange={handleChange}
          required
          className="w-full p-2 border"
        />
        <input
          type="file"
          onChange={(e) => setResume(e.target.files[0])}
          required
          className="w-full"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Submit
        </button>
        {msg && <p className="text-green-600">{msg}</p>}
      </form>

      {/* Interview List */}
      <div className="bg-gray-50 p-4 rounded shadow">
        <h2 className="text-lg font-bold mb-4">Scheduled Interviews</h2>
        <ul className="space-y-3">
          {interviews.map((item) => (
            <li key={item._id} className="p-4 border rounded bg-white">
              <p>
                <strong>Name:</strong> {item.candidateName}
              </p>
              <p>
                <strong>Email:</strong> {item.email}
              </p>
              <p>
                <strong>Position:</strong> {item.position}
              </p>
              <p><strong>Interviewers:</strong> {item.interviewer.map((name, idx) => (
                <span key={idx} className="inline-block mr-2 px-2 py-0.5 bg-gray-200 rounded">{name.trim()}</span>
              ))}</p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(item.interviewDate).toLocaleDateString()}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span className="text-blue-600">{item.status}</span>
              </p>
              <div className="flex items-center gap-2 mt-2">
                <select
                  defaultValue={item.status}
                  onChange={(e) => handleStatusChange(item._id, e.target.value)}
                  className="border p-1"
                >
                  <option value="Pending">Pending</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <button
                  onClick={() => deleteOne(item._id)}
                  className="bg-red-600 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </div>
              <div className="flex items-center gap-4 mt-2">
                <a
                  href={item.resumeDownloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-green-600 text-white px-2 py-1 rounded"
                >
                  Download Resume
                </a>
                <button
                  onClick={() => setViewResumeUrl(item.resumePreviewUrl)}
                  className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
                >
                  View
                </button>
              </div>
            </li>
          ))}
        </ul>
        {interviews.length < total && (
          <button
            onClick={() => loadInterviews(page + 1)}
            className="mt-4 px-4 py-2 bg-gray-700 text-white rounded"
          >
            Show More
          </button>
        )}
      </div>

      {/* Resume Viewer */}
      {viewResumeUrl && (
        <div className="mt-6 border rounded overflow-hidden relative">
          <iframe
            src={viewResumeUrl}
            title="Resume Preview"
            width="100%"
            height="600px"
            className="border"
          ></iframe>
          <button className="bg-red-600 p-3 rounded-md absolute top-0 right-1/2 text-white" onClick={() => setViewResumeUrl("")}>close</button>
        </div>
      )}
     
    </div>
    </div>
  );
}
