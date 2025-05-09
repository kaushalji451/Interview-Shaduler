import handleEmailPostRequest from "./emailpost";

let handelemail = async (form) => {
  let to = form.email;
  let subject = `Interview Invitation for ${form.position} at Niveshjano`;
  let text = `We are pleased to inform you that you have been shortlisted for an interview for the position of ${form.position} at Niveshjano.
  
Here are the interview details:
Interview Date: ${form.interviewDate}
Position: ${form.position}
Please confirm your availability by replying to this email. We look forward to speaking with you.

Best regards,
Abhiskek kumar kaushal
HR Manager
Niveshjano
nj@gmail.com`;


 
     // handle email post request
     handleEmailPostRequest(to,subject,text);
};

export default handelemail;