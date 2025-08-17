import React, { useEffect, useState } from "react";
import axios from "axios";
import UploadForm from "./components/UploadForm";
import PredictionHistory from "./components/PredictionHistory";

export default function App() {
  // used to fetch predictions from the backend and store them in state
  const [predictions, setPredictions] = useState([]);

  // function to fetch predictions from the backend
  const getAllPredictions = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:5000/predictions");
      setPredictions(res.data);
    } catch (err) {
      console.error("Failed to fetch predictions", err);
    }
  };

  // useEffect to get all predictions when the component mounts and when a new prediction is made
  useEffect(() => {
    getAllPredictions();
  }, []);

  return (
    <div className="App" style={{ backgroundColor: "#f0f4f8",  padding: "20px" }}>
      <UploadForm onNewPrediction={getAllPredictions} />
      <PredictionHistory predictions={predictions} />
    </div>

  );
}
