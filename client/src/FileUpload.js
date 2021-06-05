import React, { useState } from "react";
import axios from "axios";
import { Spinner } from 'react-bootstrap';
import { ProgressBar } from 'react-bootstrap';


export default function FileUpload() {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState();
  const [fileName, setFileName] = useState("");
  const [load, setLoad] = useState(false);
  const [completed, setCompleted] = useState(0);
  const [progress, setProgress] = useState(false);
  const [tick, setTick] = useState(false);



  const handleOnChangeEmail = (e) => {
    e.preventDefault();
    setEmail(e.target.value);
  };
  const handleOnChangeSubject = (e) => {
    e.preventDefault();
    setSubject(e.target.value);
  };
  const handleOnChangeMessage = (e) => {
    e.preventDefault();
    setMessage(e.target.value);
  };
  const handleOnChangeFile = (e) => {
    console.log(e.target.files[0]);
    setProgress(true);
    setTimeout(() => setCompleted(60), 500);
    setFile(e.target.files[0]);
    setFileName(e.target.files[0].name);
    setTimeout(() => setCompleted(100), 1500);
    setTimeout(() => setProgress(false), 2500);
    setTimeout(() => setCompleted(0), 2500);
    setTimeout(() => setTick(true), 2500);
  };

  const fileUpload = async (e) => {
    e.preventDefault();
    setLoad(true)
    const formData = new FormData();
    console.log(file);
    formData.append("file", file);
    formData.append("fileName", fileName);

    await axios
      .post("http://localhost:3005/sendPdf", formData, {
        headers: {
          "Content-Type":
            "multipart/form-data;boundary=<calculated when request is sent>",
          receiverEmail: email,
          subject: subject,
          message: message,
        },
      })
      .then((data) => {
        setLoad(false)
        alert("Mail Sent!");
        console.log(data);
      })
      .catch((err) => {
        console.log(err);
      });
    console.log(formData);
    console.log(file);
  };
  return (
    <div className="App">
      <header className="App-header">
      <link
        rel="stylesheet"
        href="https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
        integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T"
        crossorigin="anonymous"
      />
        <form>
          
          <img src="https://zohowebstatic.com/sites/default/files/ogimage/mail-logo.png" width="100px" height="100px"></img>
          <br></br>
         <br></br>
         <h2>Smart Email</h2>
          <br></br>
          <label>Receiver's Email : </label>
          <input
            type="email"
            placeholder="Receiver's Email"
            name="receiverEmail"
            onChange={handleOnChangeEmail}
            value={email}
            required
          />{" "}
          <br />
          <br />
          <label>Subject : </label>
          <input
            type="text"
            placeholder="Subject"
            onChange={handleOnChangeSubject}
            value={subject}
            name="subject"
          />{" "}
          <br />
          <br />
          <label>Message : </label>
          <textarea
            placeholder="Message"
            rows="4"
            cols="50"
            onChange={handleOnChangeMessage}
            value={message}
            name="message"
          />{" "}
          <br />
          <br />
          <div>
          <label>Attachment : </label>
          <input
            type="file"
            name="fileToUpload"
            id="fileToUpload"
            onChange={handleOnChangeFile}
          />  {tick && <span>&#10003;</span>}
          <div style={{width:"200px", marginLeft:"30%"}}>
         {progress&& <ProgressBar now={completed} label={`${completed}%`}/>}
        
         </div>
         </div>
          <br />
          <br />
          <button className="button" onClick={fileUpload}>
      Send
      {load && <Spinner animation="border" variant="primary">
        </Spinner>}
         
      </button>
        </form>
      </header>
    </div>
  );
}
