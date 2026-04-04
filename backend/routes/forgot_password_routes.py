from flask import Blueprint, request, jsonify
from backend.config.database import get_db_connection
from werkzeug.security import generate_password_hash
import random
import string
import smtplib
import os
import threading
from email.mime.text import MIMEText
from datetime import datetime, timedelta

bp = Blueprint('forgot_password', __name__)

# In-memory store for OTPs
otp_store = {}

EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', 587))
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD')
EMAIL_FROM = os.getenv('EMAIL_FROM', EMAIL_HOST_USER)

OTP_EXPIRY_MINUTES = 10


# 🔥 FIXED EMAIL FUNCTION (NON-BLOCKING SAFE)
def send_otp_email(to_email, otp):
    try:
        subject = "Your OTP for Password Reset"
        body = f"Your OTP is: {otp}\nValid for {OTP_EXPIRY_MINUTES} minutes."

        msg = MIMEText(body)
        msg['Subject'] = subject
        msg['From'] = EMAIL_FROM
        msg['To'] = to_email

        print("Connecting SMTP...")

        # ✅ Added timeout
        with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT, timeout=10) as server:
            server.starttls()
            server.login(EMAIL_HOST_USER, EMAIL_HOST_PASSWORD)
            server.sendmail(EMAIL_FROM, [to_email], msg.as_string())

        print("Email sent successfully ✅")

    except Exception as e:
        print("SMTP ERROR:", str(e))


def generate_otp(length=6):
    return ''.join(random.choices(string.digits, k=length))


# 🔥 FORGOT PASSWORD ROUTE (FIXED)
@bp.route('/forgot-password', methods=['POST', 'OPTIONS'])
def forgot_password():

    # ✅ Handle preflight
    if request.method == "OPTIONS":
        return jsonify({}), 200

    try:
        data = request.get_json()

        if not data or 'email' not in data:
            return jsonify({'error': 'Email is required'}), 400

        email = data.get('email')

        # Check if user exists
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

        # 🔥 VERY IMPORTANT FIX → RUN EMAIL IN BACKGROUND THREAD
        threading.Thread(target=send_otp_email, args=(email, otp)).start()

        # ✅ Return immediately (no waiting → no timeout)
        return jsonify({'message': 'OTP sent to email'}), 200

    except Exception as e:
        print("ERROR:", str(e))
        return jsonify({'error': 'Internal server error'}), 500


# 🔥 RESET PASSWORD (UNCHANGED BUT CLEAN)
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