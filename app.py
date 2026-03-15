from __future__ import division, print_function
import os
import numpy as np

# TensorFlow / Keras
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image

# Flask
from flask import Flask, request, render_template
from werkzeug.utils import secure_filename

# Flask app
app = Flask(__name__)

# Base directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Upload folder
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Model path
MODEL_PATH = os.path.join(BASE_DIR, "Model.hdf5")

print("** Model Loading **")

if not os.path.exists(MODEL_PATH):
    raise Exception(f"Model file not found at {MODEL_PATH}")

model = load_model(MODEL_PATH, compile=False)

print("** Model Loaded **")

# Class labels
classes = [
'Apple___Apple_scab','Apple___Black_rot','Apple___Cedar_apple_rust','Apple___healthy',
'Blueberry___healthy','Cherry_(including_sour)___Powdery_mildew','Cherry_(including_sour)___healthy',
'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot','Corn_(maize)___Common_rust_',
'Corn_(maize)___Northern_Leaf_Blight','Corn_(maize)___healthy','Grape___Black_rot',
'Grape___Esca_(Black_Measles)','Grape___Leaf_blight_(Isariopsis_Leaf_Spot)','Grape___healthy',
'Orange___Haunglongbing_(Citrus_greening)','Peach___Bacterial_spot','Peach___healthy',
'Pepper,_bell___Bacterial_spot','Pepper,_bell___healthy','Potato___Early_blight',
'Potato___Late_blight','Potato___healthy','Raspberry___healthy','Soybean___healthy',
'Squash___Powdery_mildew','Strawberry___Leaf_scorch','Strawberry___healthy',
'Tomato___Bacterial_spot','Tomato___Early_blight','Tomato___Late_blight','Tomato___Leaf_Mold',
'Tomato___Septoria_leaf_spot','Tomato___Spider_mites Two-spotted_spider_mite',
'Tomato___Target_Spot','Tomato___Tomato_Yellow_Leaf_Curl_Virus',
'Tomato___Tomato_mosaic_virus','Tomato___healthy'
]


def model_predict(img_path):

    img = image.load_img(img_path, target_size=(224, 224))

    x = image.img_to_array(img)
    x = np.expand_dims(x, axis=0)
    x = x / 255.0

    preds = model.predict(x)

    predicted_index = np.argmax(preds)
    predicted_class = classes[predicted_index]

    crop, disease = predicted_class.split("___")

    return crop, disease.replace("_", " ").title()


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/predict", methods=["POST"])
def upload():

    if "file" not in request.files:
        return "No file uploaded"

    f = request.files["file"]

    if f.filename == "":
        return "No selected file"

    filename = secure_filename(f.filename)

    upload_path = os.path.join(UPLOAD_FOLDER, filename)

    f.save(upload_path)

    crop, disease = model_predict(upload_path)

    result = f"Predicted Crop: {crop} | Predicted Disease: {disease}"

    return result


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
