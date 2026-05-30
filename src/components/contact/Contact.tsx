import { Loader, useGLTF, Preload } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import React, { useState, ChangeEvent, FormEvent } from "react";
import "./Contact.css";
import ContactModel from "./ContactModel";
import { LOADER_CONFIG } from "../../constants/loaderConfig";

const Contact: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const submitEmail = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const mailtoLink =
      "mailto:saragadamjaishree@gmail.com" +
      `?subject=${encodeURIComponent(subject || "Portfolio enquiry")}` +
      `&body=${encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\n\n${message}`
      )}`;

    window.location.href = mailtoLink;
  };
  const messageModel = useGLTF("/models/message.glb", true);

  return (
    <div className="section">
      <Canvas
        style={{
          height: "100vh",
          width: "50vw",
        }}
        camera={{ fov: 45, near: 0.1, far: 1000, position: [0, 0, 8] }}
        id="canvas-contact"
        // shadows
      >
        {/* @ts-expect-error Weird ts behavior */}
        <ContactModel messageModel={messageModel} />
        <Preload all />
      </Canvas>

      <Loader {...LOADER_CONFIG} />

      <div className="container">
        <div className="right">
          <h2 className="title">Contact Me</h2>
          <p className="tag">
            Leave a message for me. I will be more than happy to hear from you
            :)
          </p>
          <hr />
          <form
            id="contact-form"
            onSubmit={(e) => submitEmail(e)}
            method="POST"
          >
            <div className="form-group">
              <div className="row">
                <div className="col-md-6">
                  <input
                    placeholder="Name"
                    id="name"
                    type="text"
                    className="form-control"
                    required
                    value={name}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setName(e.target.value)
                    }
                  />
                </div>
                <div className="col-md-6">
                  <input
                    placeholder="Email"
                    id="email"
                    type="email"
                    className="form-control"
                    aria-describedby="emailHelp"
                    required
                    value={email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setEmail(e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
            <div className="form-group">
              <input
                placeholder="Subject"
                id="subject"
                type="text"
                className="form-control"
                required
                value={subject}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setSubject(e.target.value)
                }
              />
            </div>
            <div className="form-group">
              <textarea
                placeholder="Message"
                id="message"
                className="form-control"
                rows={3}
                required
                value={message}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  setMessage(e.target.value)
                }
              />
            </div>
            <button
              type="submit"
              className="primary-btn submit"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
