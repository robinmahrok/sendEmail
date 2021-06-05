import React, { useState } from "react";
import axios from "axios";

export default function FileUpload() {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState();
  const [fileName, setFileName] = useState("");

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
    e.preventDefault();
    console.log(e.target.files[0]);
    setFile(e.target.files[0]);
    setFileName(e.target.files[0].name);
  };

  const fileUpload = async (e) => {
    e.preventDefault();
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
        <form>
          <h2>Login</h2>
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
          <label>Attachment : </label>
          <input
            type="file"
            name="fileToUpload"
            id="fileToUpload"
            onChange={handleOnChangeFile}
          />
          <br />
          <br />
          <input type="submit" onClick={fileUpload} />
        </form>
      </header>
    </div>
  );
}
