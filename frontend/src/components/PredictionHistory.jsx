import React from "react";

export default function PredictionHistory({ predictions, loading }) {
  if (loading)
    return (
      <p style={{ textAlign: "center", fontSize: "1.5rem" }}>
        Loading previous predictions...
      </p>
    );

  if (predictions.length === 0)
    return (
      <p style={{ textAlign: "center", fontSize: "1.5rem" }}>
        No previous predictions found.
      </p>
    );

  return (
    <div
      className="predictions-list"
      style={{
        padding: "20px",
        maxWidth: "900px",
        margin: "0 auto",
      }}
    >
      <h2
        style={{
          marginBottom: "30px",
          textAlign: "center",
          fontSize: "2rem",
        }}
      >
        Predictions
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "10px",
          fontWeight: "bold",
          marginBottom: "20px",
          padding: "0 10px",
          color: "#333",
          textAlign: "center",
        }}
      >
        <span style={{ fontSize: "1.4rem" }}>Original Image</span>
        <span style={{ fontSize: "1.4rem" }}>Predicted Image</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
        {predictions.map((p) => (
          <div
            key={p.uid}
            className="prediction-card"
            style={{
              padding: "15px",
              border: "1px solid #ddd",
              borderRadius: "10px",
              backgroundColor: "#f9f9f9",
              boxShadow: "0 3px 8px rgba(0, 0, 0, 0.08)",
              transition: "box-shadow 0.3s ease, transform 0.3s ease",
            }}
          >
            <p style={{ fontSize: "1.1rem", marginBottom: "8px" }}>
              <strong>Detected Labels:</strong>{" "}
              {p.labels && p.labels.length > 0 ? p.labels.join(", ") : "None"}
            </p>

            <div
              className="images"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
                marginTop: "10px",
              }}
            >
              <div>
                <img
                  src={`http://127.0.0.1:5000/image/${p.image_id}`}
                  alt="Original"
                  style={{
                    width: "100%",
                    height: "250px",
                    objectFit: "contain",
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                  }}
                />
              </div>

              <div>
                <img
                  src={`http://127.0.0.1:5000/image/${p.predicted_image_id}`}
                  alt="Predicted"
                  style={{
                    width: "100%",
                    height: "250px",
                    objectFit: "contain",
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
