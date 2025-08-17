import React, { useState } from "react";
import axios from "axios";
import "./UploadForm.css";
import Camera from "./Camera";

export default function UploadForm({ onNewPrediction }) {
  // State variables for storing selected file, check whether image uploaded,to handle error, to store predictions,whether image is loaded
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Function to handle file selection
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setError("");
    setResult(null);
    setImageLoaded(false);
  };

  const waitForImage = (url, retries = 10, delay = 500) => {
    //using Promise to resolve when the image is successfully loaded or reject is if the image fails to load after all attempts
    return new Promise((resolve, reject) => {
      // Function to check if the image is available
      // This function will try to load the image and resolve if successful, or retry if it fails till 10 times
      const check = (attempt = 1) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => {
          if (attempt < retries) {
            setTimeout(() => check(attempt + 1), delay);
          } else {
            reject("Image not available");
          }
        };
        img.src = url + "?t=" + new Date().getTime();
      };
      check();
    });
  };

  //Function to handle the upload and prediction
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please select an image first.");
      return;
    }

    setLoading(true);
    setError("");
    setImageLoaded(false);
    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      const res = await axios.post("http://127.0.0.1:5000/predict", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const imageUrl = `http://127.0.0.1:5000/image/${res.data.predicted_image_id}`;
      await waitForImage(imageUrl);

      setResult(res.data);
      setImageLoaded(true);
      if (onNewPrediction) onNewPrediction();
    } catch (err) {
      console.error("Upload error:", err);
      setError("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // This function will be called when the image is captured from the camera
  const handleCameraPrediction = async (data) => {
    setError("");
    const imageUrl = `http://127.0.0.1:5000/image/${data.predicted_image_id}`;
    await waitForImage(imageUrl);
    setResult(data);
    setImageLoaded(true);
    if (onNewPrediction) onNewPrediction();
  };

  return (
    <div className="upload-container">
      <h2>🌿 Leaf Disease Detection</h2>

      <form onSubmit={handleSubmit} className="upload-form">
        <div className="upload-controls">
          <label className="custom-file">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="file-input"
            />
            <span className="file-label">
              {selectedFile ? selectedFile.name : "Choose an image"}
            </span>
          </label>

          <button type="submit" disabled={loading} className="upload-btn">
            {loading ? "Processing..." : "Upload & Predict"}
          </button>
        </div>
      </form>

      <Camera onCaptureComplete={handleCameraPrediction} />

      {error && <p className="error-text">{error}</p>}

      {result && imageLoaded && (
        <div
          className="result-card"
          style={{
            padding: "15px",
            margin: "20px auto",
            maxWidth: "600px",
            border: "1px solid #ddd",
            borderRadius: "10px",
            backgroundColor: "#f9f9f9",
            boxShadow: "0 3px 8px rgba(0, 0, 0, 0.08)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <img
            src={`http://127.0.0.1:5000/image/${result.predicted_image_id}`}
            alt="Predicted"
            className="result-image"
            style={{
              width: "100%",
              maxHeight: "350px",
              objectFit: "contain",
              backgroundColor: "#fff",
              borderRadius: "8px",
              marginBottom: "15px",
            }}
          />
          <div className="result-info">
            <h3 style={{ fontSize: "1.2rem", color: "#333" }}>
              ✅ Result: {result.labels?.join(", ")}
            </h3>
          </div>
        </div>

      )}
    </div>
  );
}
