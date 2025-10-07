# infer_webcam_h5.py
import cv2
import numpy as np
from tensorflow.keras.models import load_model

# Load your trained .h5 model
MODEL_PATH = "ml/models/facial_emotion_model.h5"  # change to your model file
model = load_model(MODEL_PATH)

# Emotion classes
CLASS_NAMES = ['angry', 'disgust', 'fear', 'happy', 'sad', 'surprise', 'neutral']

# Image size expected by model
IMG_SIZE = (48, 48)

# Load OpenCV face detector
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

# Start webcam
cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.3, minNeighbors=5)

    for (x, y, w, h) in faces:
        face = gray[y:y+h, x:x+w]
        face = cv2.resize(face, IMG_SIZE)
        face = face.astype('float32') / 255.0
        face = np.expand_dims(face, axis=(0, -1))  # shape (1, 48, 48, 1)

        # Predict emotion
        preds = model.predict(face, verbose=0)
        emotion_idx = np.argmax(preds)
        label = CLASS_NAMES[emotion_idx]
        prob = float(np.max(preds))

        # Draw rectangle and label
        cv2.rectangle(frame, (x, y), (x + w, y + h), (255, 0, 0), 2)
        cv2.putText(frame, f"{label} {prob:.2f}", (x, y - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)

    cv2.imshow("EmoTune - Press q to quit", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
