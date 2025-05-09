"use client";
import { useState, useEffect } from "react";
import handelemail from "./components/emailFunc1";
import handelemailStatusUpdate from "./components/emailFunc2";
import handelemailInterviewer from "./components/emailFunc3";
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
    if (data != null) {
      handelemail(form); //funcition call for the 1 email
    }

    // calling  the interviewer email
    handleInterviewerEmail(form);

    setMsg(data.message);
    setForm({
      candidateName: "",
      email: "",
      position: "",
      interviewDate: "",
      interviewer: "",
    });
    setResume(null);
    loadInterviews(1);
  };

  const handleStatusChange = async (item, newStatus) => {
    let id = item._id;
    const res = await fetch(`/api/hr/interview`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });
    const data = await res.json();
    setMsg(data.message);
    loadInterviews(1);
    // calling the candidate email
    handelemailStatusUpdate(item);
  };

  const deleteOne = async (id) => {
    await fetch(`/api/hr/interview`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadInterviews(1);
  };

  // for edit resume
  const [editRes, seteditRes] = useState(false);
  let handleEdit = async () => {
    seteditRes(true);
  };
  let handleEditSubmit = async (id, name) => {
    const fd = new FormData();
    if (resume) fd.append("resume", resume);
    if (id) fd.append("id", id);
    if (name) fd.append("name", name);
    const res = await fetch("/api/hr/interview", {
      method: "PUT",
      body: fd,
    });
    let data = await res.json();
    if (data.message === "Resume Updated") {
      seteditRes(false);
      setResume(null);
      loadInterviews(1);
    }
  };

  let handleInterviewerEmail = async (form) => {
    console.log("got it");
    handelemailInterviewer(form);
  };


  const [drop, setdrop] = useState(false);
  let handleDropDown = ()=>{
   if(drop === false){
     setdrop(true);
   }else{
    setdrop(false);
   }
  }
  let hrArr = [`${process.env.NEXT_PUBLIC_HrHead}`, `${process.env.NEXT_PUBLIC_HrRecruiter}`];
  let handleAddHr = (hr) => {
    if (hr === "hrHead") {
      form.interviewer += hrArr[0] + ",";
    } else {
      form.interviewer += hrArr[1] + ",";
    }
     setdrop(false);
  };
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

          <p onClick={handleDropDown} className="cursor-pointer bg-blue-600 w-fit px-4 py-1 rounded-md text-white">
            Add Interviewer
          </p>

        {drop === true && (
           <div className="flex flex-col gap-2 bg-white w-35 rounded-md  border border-slate-400 pt-2 text-center -mt-4 absolute">
            <p
              className=" rounded-md px-2 py-1 cursor-pointer  border-b"
              onClick={() => handleAddHr("hrHead")}
            >
              Add hr Head
            </p>
            <p
              className=" rounded-md px-2 py-1 cursor-pointer  border-b"
              onClick={() => handleAddHr("hrRecruiter")}
            >
              Add hr Recruiter
            </p>
          </div>
        )}


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
                <p>
                  <strong>Interviewers:</strong>{" "}
                  {item.interviewer.map((name, idx) => (
                    <span
                      key={idx}
                      className="inline-block mr-2 px-2 py-0.5 bg-gray-200 rounded"
                    >
                      {name.trim()}
                    </span>
                  ))}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(item.interviewDate).toLocaleDateString()}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span className="text-blue-600">{item.status}</span>
                </p>
                <div className="flex items-center max-sm:flex-col gap-2 mt-2">
                  <div className="flec items-center gap-2 mt-2">
                    <select
                      defaultValue={item.status}
                      onChange={(e) => handleStatusChange(item, e.target.value)}
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

                  {/* edit input form */}
                  <div>
                    {editRes && (
                      <input
                        type="file"
                        required
                        className="w-full"
                        onChange={(e) => setResume(e.target.files[0])}
                      />
                    )}
                    {!editRes ? (
                      <button
                        className="bg-blue-500 text-white px-2 py-1 rounded"
                        onClick={handleEdit}
                      >
                        Edit
                      </button>
                    ) : (
                      <button
                        className="bg-blue-500 text-white px-2 py-1 rounded"
                        onClick={() =>
                          handleEditSubmit(item._id, item.candidateName)
                        }
                      >
                        Submit
                      </button>
                    )}
                  </div>
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
            <button
              className="bg-red-600 p-3 rounded-md absolute top-0 right-1/2 text-white"
              onClick={() => setViewResumeUrl("")}
            >
              close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
