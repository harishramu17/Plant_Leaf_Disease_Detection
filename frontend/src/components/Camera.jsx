import React, { useState } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import { FaCamera } from "react-icons/fa";
import "./Camera.css";

export default function Camera({ onCaptureComplete }) {
  //use state for camera start, capturing state, and error handling
  const [cameraStarted, setCameraStarted] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [error, setError] = useState("");

  // Reference to the webcam component
  const webcam = React.useRef(null);

  // Function to capture image from webcam
  const captureImage = async () => {
    setCapturing(true);

    const imageSrc = webcam.current.getScreenshot();
    if (!imageSrc) return;

    try {
      const response = await fetch(imageSrc);
      // Converting the image to a Binary Large Object
      const blob = await response.blob();
      // Preparing the form data for upload
      const formData = new FormData();
      formData.append("image", blob, "captured.jpg");

      // Uploading the image to the server for prediction
      const uploadResponse = await axios.post("http://127.0.0.1:5000/predict", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (onCaptureComplete) {
        onCaptureComplete(uploadResponse.data);
      }
    } catch (err) {
      console.error("Image upload failed:", err);
      setError("Image upload failed.");
    } finally {
      setCapturing(false);
    }
  };
// Function to start the camera
  const startCamera = () => {
    setCameraStarted(true);
  };

  return (
    <div className="camera-wrapper">
      {error && <p className="error-text">{error}</p>}

      <div className="camera-area">
        {!cameraStarted ? (
          <button onClick={startCamera} className="start-camera-btn">
            <FaCamera style={{ marginRight: "10px" }} />
            Start Camera
          </button>
        ) : (
          <>
            <Webcam
              audio={false}
              ref={webcam}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                facingMode: "user",
              }}
              width="100%"
              height="auto"
              style={{
                borderRadius: "8px",
                border: "2px solid #ccc",
                marginBottom: "10px",
              }}
            />

            <div className="camera-controls">
              <button
                onClick={captureImage}
                disabled={capturing}
                className="capture-btn"
              >
                {capturing ? (
                  <>
                    <div className="flip" style={{ marginRight: "10px" }}></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <FaCamera style={{ marginRight: "10px" }} />
                    Capture & Predict
                  </>
                )}
              </button>

            </div>
          </>
        )}
      </div>
    </div>
  );
}
