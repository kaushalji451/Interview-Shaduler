import handleEmailPostRequest from "./emailpost";


let handelemailInterviewer= async (form) => {
    let data = []; 
    for (let key in form) {
      if (key === "interviewer") {
        const arr = form[key].split(",").map((i) => i.trim());
        for(let i =0;i<arr.length;i++){
          data[i]  = arr[i];
         } 
      } 
    }

    let to = data;
    let subject = ` Interview Scheduled: ${form.candidateName} for ${form.position} – ${form.interviewDate}`;
    let text = `Dear Team,
This is to inform you that an interview has been scheduled with the following candidate:
🧑 Candidate Details
Name: ${form.candidateName}
Email: ${form.email}
Role Applied: ${form.position}

📅 Interview Details
Date: ${form.interviewDate}
Duration: 60 minutes
Meeting Link: googleMeet.com

🎯 Your Role as Interviewer

You are requested to:
Join the interview on time.
Assess the candidate based on key evaluation areas, e.g., technical skills, communication, problem-solving.
Share feedback using the internal system or via reply to this email after the interview.
If you are unavailable or need to reschedule, please let us know at your earliest convenience.

Best regards,
HR Department`;


    // handle email post request
    handleEmailPostRequest(to,subject,text);
  };
  
  export default handelemailInterviewer;
  