import gradio as gr
import numpy as np
import cv2
from tensorflow import keras

model = keras.models.load_model("emotion_detection_model_final.keras")

EMOTION_LABELS = ['angry', 'disgust', 'fear', 'happy', 'neutral', 'sad', 'surprise']

face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
)

def predict_emotion(image):
    try:
        # ✅ image will now be filepath
        if isinstance(image, str):
            image = cv2.imread(image)

        if image is None:
            return "No image"

        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        faces = face_cascade.detectMultiScale(gray, 1.3, 5)

        if len(faces) == 0:
            return "No face detected"

        x, y, w, h = faces[0]
        face = gray[y:y+h, x:x+w]

        face = cv2.resize(face, (48, 48))
        face = face / 255.0
        face = face.reshape(1, 48, 48, 1)

        prediction = model.predict(face)
        emotion = EMOTION_LABELS[np.argmax(prediction)]

        return emotion

    except Exception as e:
        return str(e)


with gr.Blocks() as demo:
    image = gr.Image(type="filepath")  # ✅ FIXED
    output = gr.Textbox()

    btn = gr.Button("Predict")

    btn.click(
        fn=predict_emotion,
        inputs=image,
        outputs=output,
        api_name="predict"
    )

# ✅ ONLY THIS
demo.launch(show_error=True)