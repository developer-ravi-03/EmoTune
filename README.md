# EmoTune - Emotion-Based Music Recommendation

EmoTune is a web application that detects user emotions through facial recognition and recommends music based on the detected emotion.

## Features

- User authentication (login/register)
- Real-time emotion detection using webcam
- Image upload for emotion detection
- Music recommendations based on detected emotions
- Music player with playback controls
- History tracking of emotions and music recommendations
- User profile management

## Project Structure

- **frontend/** - React frontend with Tailwind CSS
- **backend/** - Flask backend with MySQL database
- **ml/** - Machine learning model for emotion detection

## Setup Instructions

### Prerequisites

- Node.js and npm
- Python 3.8+ and pip
- MySQL database
- Virtual environment (venv)

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create and activate a virtual environment:
   ```
   python -m venv venv
   venv\Scripts\activate  # Windows
   source venv/bin/activate  # Linux/Mac
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Set up the MySQL database:
   - Create a database named `emotune`
   - Update the database connection string in `app.py` if needed

5. Start the Flask server:
   ```
   python app.py
   ```

## Usage

1. Register a new account or login with existing credentials
2. On the home page, start the camera or upload an image
3. Click "Detect Emotion" to analyze your facial expression
4. View music recommendations based on your detected emotion
5. Play, pause, and navigate through recommended songs
6. Check your emotion history in the History page
7. Manage your account in the Profile page

## Technologies Used

- **Frontend**: React, Tailwind CSS, Axios
- **Backend**: Flask, SQLAlchemy, JWT
- **Database**: MySQL
- **ML**: OpenCV, Pre-trained emotion detection model