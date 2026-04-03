from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import cv2
import numpy as np
import base64
import os
from dotenv import load_dotenv
from backend.config.database import get_db_connection
from gradio_client import Client, handle_file
import tempfile

load_dotenv()

bp = Blueprint('emotion', __name__)

client = Client("dev-ravi/emotune-model")

def detect_emotion_from_image(image):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
            temp_path = tmp.name
            cv2.imwrite(temp_path, image)

        result = client.predict(
            handle_file(temp_path),   # ✅ FIX HERE
            api_name="/predict"
        )

        # print("HF RESULT:", result)

        return result, None, None

    except Exception as e:
        return None, None, str(e)
    
# ---------------- ROUTES ---------------- #

@bp.route('/detect-image', methods=['POST'])
@jwt_required()
def detect_from_image():
    try:
        user_id = int(get_jwt_identity())

        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400

        file = request.files['image']

        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        file_bytes = np.frombuffer(file.read(), np.uint8)
        image = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)

        if image is None:
            return jsonify({'error': 'Invalid image file'}), 400

        emotion, confidence, error = detect_emotion_from_image(image)

        if error:
            return jsonify({'error': error}), 400

        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute(
            """INSERT INTO emotion_history (user_id, emotion, confidence, detection_type) 
               VALUES (%s, %s, %s, 'image')""",
            (user_id, emotion, confidence)
        )
        connection.commit()
        history_id = cursor.lastrowid

        cursor.close()
        connection.close()

        return jsonify({
            'message': 'Emotion detected successfully',
            'emotion': emotion,
            'confidence': confidence,
            'history_id': history_id
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/detect-webcam', methods=['POST'])
@jwt_required()
def detect_from_webcam():
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json()

        if not data or 'image' not in data:
            return jsonify({'error': 'No image data provided'}), 400

        image_data = data['image']
        if ',' in image_data:
            image_data = image_data.split(',')[1]

        image_bytes = base64.b64decode(image_data)
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if image is None:
            return jsonify({'error': 'Invalid image data'}), 400

        emotion, confidence, error = detect_emotion_from_image(image)

        if error:
            return jsonify({'error': error}), 400

        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute(
            """INSERT INTO emotion_history (user_id, emotion, confidence, detection_type) 
               VALUES (%s, %s, %s, 'webcam')""",
            (user_id, emotion, confidence)
        )
        connection.commit()
        history_id = cursor.lastrowid

        cursor.close()
        connection.close()

        return jsonify({
            'message': 'Emotion detected successfully',
            'emotion': emotion,
            'confidence': confidence,
            'history_id': history_id
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/history', methods=['GET'])
@jwt_required()
def get_emotion_history():
    try:
        user_id = int(get_jwt_identity())

        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 10, type=int)
        offset = (page - 1) * limit

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            "SELECT COUNT(*) as total FROM emotion_history WHERE user_id = %s",
            (user_id,)
        )
        total = cursor.fetchone()['total']

        cursor.execute(
            """SELECT id, emotion, confidence, detection_type, created_at 
               FROM emotion_history 
               WHERE user_id = %s 
               ORDER BY created_at DESC 
               LIMIT %s OFFSET %s""",
            (user_id, limit, offset)
        )
        history = cursor.fetchall()

        cursor.close()
        connection.close()

        for item in history:
            item['created_at'] = item['created_at'].isoformat() if item['created_at'] else None

        return jsonify({
            'history': history,
            'pagination': {
                'total': total,
                'page': page,
                'limit': limit,
                'pages': (total + limit - 1) // limit
            }
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/stats', methods=['GET'])
@jwt_required()
def get_emotion_stats():
    try:
        user_id = int(get_jwt_identity())

        connection = get_db_connection()


        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            """SELECT emotion, COUNT(*) as count 
               FROM emotion_history 
               WHERE user_id = %s 
               GROUP BY emotion 
               ORDER BY count DESC""",
            (user_id,)
        )
        distribution = cursor.fetchall()

        cursor.execute(
            "SELECT COUNT(*) as total FROM emotion_history WHERE user_id = %s",
            (user_id,)
        )
        total = cursor.fetchone()['total']

        cursor.close()
        connection.close()

        return jsonify({
            'total_detections': total,
            'emotion_distribution': distribution
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500