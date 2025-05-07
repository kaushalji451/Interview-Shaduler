let handelemailStatusUpdate = async (item) => {
  let to = item.email;
  let subject = `Interview Process Update ${item.position} at Niveshjano`;
  let text = `Dear ${item.candidateName},
I hope you're doing well.
We wanted to update you on the status of your interview process with Niveshjano.
Current Status: ${item.status}
If Scheduled: Your interview is scheduled for ${item.interviewDate} with ${item.interviewer}.
If Pending: We are currently reviewing your profile and will reach out soon with the next steps.
If Completed: Thank you for completing your interviews. We will get back to you shortly with the outcome.
If Rejected: We appreciate your interest in Niveshjano, but we have decided not to proceed further with your application at this time.
If you have any questions, feel free to reach out.
Best regards,
Abhishek kumar kaushal
Web devloper
Niveshjano

`;
  let res = await fetch("http://localhost:3000/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to, subject, text }),
  });

  let data = await res.json();
};

export default handelemailStatusUpdate;
