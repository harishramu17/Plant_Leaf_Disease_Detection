from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from ultralytics import YOLO
from pymongo import MongoClient
from gridfs import GridFS
from bson.objectid import ObjectId
import os
from datetime import datetime
import tempfile
import cv2
from io import BytesIO

# MongoDB Configuration
MONGO_URI = "mongodb://localhost:27017"
MONGO_DB = "Disease_Detection"
TEMP_DIR = tempfile.gettempdir()

# Flask app Initialization
app = Flask(__name__)
CORS(app)

# MongoDB Initialization
client = MongoClient(MONGO_URI)
db = client[MONGO_DB]
collection = db.predictions
fs = GridFS(db)

# Loading YOLOv8 model
model = YOLO("best.pt")

@app.route("/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return jsonify({"error": "Please upload an image"}), 400

    file = request.files["image"]
    if file.filename == "":
        return jsonify({"error": "Please enter a valid filename"}), 400

    # Storing original image in GridFS
    file.stream.seek(0)
    image_id = fs.put(file, filename=file.filename, content_type=file.content_type)

    # Saving temp file for prediction
    temp_path = os.path.join(TEMP_DIR, f"{file.filename}")
    file.stream.seek(0)
    with open(temp_path, "wb") as f:
        f.write(file.read())

    results = model.predict(temp_path, save=False)

    # Checking confidence threshold
    label_names = set()
    high_conf = False
    for res in results:
        for b in res.boxes:
            if b.conf[0].item() >= 0.65:
                label_names.add(model.names[int(b.cls[0].item())])
                high_conf = True

    # Processing annotated image if the confidence threshold is higher
    if high_conf:
        bgr_img = results[0].plot()
        rgb_img = cv2.cvtColor(bgr_img, cv2.COLOR_BGR2RGB)

        success, enc = cv2.imencode('.jpg', rgb_img)
        if not success:
            return jsonify({"error": "Failed to encode image"}), 500

        img_io = BytesIO(enc.tobytes())
        img_io.seek(0)
        pred_image_id = fs.put(img_io, filename=f"pred_{file.filename}", content_type="image/jpeg")

    #if it is lower than threshold, returning as no disease
    else:
        label_names = {"No Disease"}
        pred_image_id = image_id

    # Saving prediction to MongoDB
    collection.insert_one({
        "timestamp": datetime.utcnow(),
        "image_id": str(image_id),
        "predicted_image_id": str(pred_image_id),
        "labels": list(label_names)
    })

    os.remove(temp_path)

    return jsonify({
        "message": "Prediction successful",
        "labels": list(label_names),
        "image_id": str(image_id),
        "predicted_image_id": str(pred_image_id)
    })

# Retrieving image by ID
@app.route("/image/<image_id>")
def retrieve_image(image_id):
    try:
        file = fs.get(ObjectId(image_id))
        mimetype = file.content_type  # If using PyMongo <5
        return send_file(file, mimetype=mimetype)
    except:
        return jsonify({"error": "Image not found"}), 404

# Retrieve all the past predictions
@app.route("/predictions")
def get_predictions():
    data = list(collection.find({}, {"_id": 0}).sort("timestamp", -1))
    return jsonify(data)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)