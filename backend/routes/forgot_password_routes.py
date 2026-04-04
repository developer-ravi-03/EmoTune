from flask import Blueprint, request, jsonify
from backend.config.database import get_db_connection
from werkzeug.security import generate_password_hash
import random
import string
import os
import threading
from datetime import datetime, timedelta

# ✅ SendGrid imports
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

bp = Blueprint('forgot_password', __name__)

otp_store = {}

EMAIL_FROM = os.getenv('EMAIL_FROM')
SENDGRID_API_KEY = os.getenv('SENDGRID_API_KEY')

OTP_EXPIRY_MINUTES = 10


# 🔥 NEW SENDGRID EMAIL FUNCTION
def send_otp_email(to_email, otp):
    try:
        message = Mail(
            from_email=EMAIL_FROM,
            to_emails=to_email,
            subject="Your OTP for Password Reset",
            plain_text_content=f"Your OTP is: {otp}\nValid for {OTP_EXPIRY_MINUTES} minutes."
        )

        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)

        print("Email sent via SendGrid:", response.status_code)

    except Exception as e:
        print("SendGrid ERROR:", str(e))


def generate_otp(length=6):
    return ''.join(random.choices(string.digits, k=length))


@bp.route('/forgot-password', methods=['POST', 'OPTIONS'])
def forgot_password():

    if request.method == "OPTIONS":
        return jsonify({}), 200

    try:
        data = request.get_json()

        if not data or 'email' not in data:
            return jsonify({'error': 'Email is required'}), 400

        email = data.get('email')

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute('SELECT id FROM users WHERE email = %s', (email,))
        user = cursor.fetchone()
        cursor.close()
        conn.close()

        if not user:
            return jsonify({'error': 'You are not registered. Please sign up.'}), 404

        otp = generate_otp()

        otp_store[email] = {
            'otp': otp,
            'expires_at': datetime.utcnow() + timedelta(minutes=OTP_EXPIRY_MINUTES)
        }

        # 🔥 Send email in background
        threading.Thread(target=send_otp_email, args=(email, otp)).start()

        return jsonify({'message': 'OTP sent to email'}), 200

    except Exception as e:
        print("ERROR:", str(e))
        return jsonify({'error': 'Internal server error'}), 500


@bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()

    email = data.get('email')
    otp = data.get('otp')
    new_password = data.get('new_password')

    if not all([email, otp, new_password]):
        return jsonify({'error': 'Email, OTP, and new password are required'}), 400

    otp_entry = otp_store.get(email)

    if not otp_entry or otp_entry['otp'] != otp:
        return jsonify({'error': 'Invalid OTP'}), 400

    if datetime.utcnow() > otp_entry['expires_at']:
        return jsonify({'error': 'OTP expired'}), 400

    hashed_password = generate_password_hash(new_password)

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('UPDATE users SET password = %s WHERE email = %s', (hashed_password, email))
    conn.commit()
    cursor.close()
    conn.close()

    otp_store.pop(email, None)

    return jsonify({'message': 'Password reset successful'}), 200