let handleEmailPostRequest = async(to,subject,text)=>{
    let res = await fetch("http://localhost:3000/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, subject, text }),
      });
    
      let result = await res.json();
      if(result){
          console.log("work is done");
      }
}

export default handleEmailPostRequest;