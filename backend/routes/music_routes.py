# from flask import Blueprint, request, jsonify
# from flask_jwt_extended import jwt_required, get_jwt_identity
# import requests
# import base64
# import os
# from datetime import datetime, timedelta
# from backend.config.database import get_db_connection

# bp = Blueprint('music', __name__)

# # Spotify credentials
# SPOTIFY_CLIENT_ID = os.getenv('SPOTIFY_CLIENT_ID')
# SPOTIFY_CLIENT_SECRET = os.getenv('SPOTIFY_CLIENT_SECRET')

# # Cache for Spotify access token
# spotify_token_cache = {
#     'token': None,
#     'expires_at': None
# }

# # Emotion to music genre/mood mapping
# EMOTION_TO_MUSIC = {
#     'happy': ['pop', 'dance', 'party', 'happy'],
#     'sad': ['sad', 'acoustic', 'piano', 'rainy-day'],
#     'angry': ['rock', 'metal', 'punk', 'work-out'],
#     'fear': ['ambient', 'chill', 'sleep', 'study'],
#     'surprise': ['electronic', 'edm', 'party'],
#     'disgust': ['grunge', 'alternative', 'indie'],
#     'neutral': ['indie', 'alternative', 'chill']
# }

# def get_spotify_token():
#     """Get Spotify access token"""
#     global spotify_token_cache
    
#     # Check if token is still valid
#     if spotify_token_cache['token'] and spotify_token_cache['expires_at']:
#         if datetime.now() < spotify_token_cache['expires_at']:
#             return spotify_token_cache['token']
    
#     # Get new token
#     auth_string = f"{SPOTIFY_CLIENT_ID}:{SPOTIFY_CLIENT_SECRET}"
#     auth_bytes = auth_string.encode('utf-8')
#     auth_base64 = base64.b64encode(auth_bytes).decode('utf-8')
    
#     url = "https://accounts.spotify.com/api/token"
#     headers = {
#         "Authorization": f"Basic {auth_base64}",
#         "Content-Type": "application/x-www-form-urlencoded"
#     }
#     data = {"grant_type": "client_credentials"}
    
#     response = requests.post(url, headers=headers, data=data)
    
#     if response.status_code != 200:
#         raise Exception("Failed to get Spotify access token")
    
#     token_data = response.json()
#     spotify_token_cache['token'] = token_data['access_token']
#     spotify_token_cache['expires_at'] = datetime.now() + timedelta(seconds=token_data['expires_in'] - 60)
    
#     return spotify_token_cache['token']

# def search_spotify_tracks_fallback(token, emotion, limit=20):
#     """Fallback search when recommendations API fails"""
#     # Emotion-based search queries
#     search_queries = {
#         'happy': 'happy upbeat positive',
#         'sad': 'sad emotional melancholy',
#         'angry': 'rock energetic intense',
#         'fear': 'calm peaceful ambient',
#         'surprise': 'electronic dance party',
#         'disgust': 'alternative indie rock',
#         'neutral': 'chill indie alternative'
#     }
    
#     query = search_queries.get(emotion.lower(), 'popular music')
    
#     url = "https://api.spotify.com/v1/search"
#     headers = {"Authorization": f"Bearer {token}"}
#     params = {
#         "q": query,
#         "type": "track",
#         "limit": limit,
#     }
    
#     response = requests.get(url, headers=headers, params=params, timeout=10)
#     response.raise_for_status()
    
#     # Format response to match recommendations API structure
#     search_data = response.json()
#     return {
#         "tracks": search_data.get("tracks", {}).get("items", [])
#     }

# def get_recommendations_by_genre(emotion, limit=20):
#     """Get recommendations based on emotion-mapped genres"""
#     token = get_spotify_token()
    
#     # Get seed genres for emotion - Spotify API requires valid genre seeds
#     valid_genres = {
#         'happy': ['pop', 'dance', 'party'],
#         'sad': ['acoustic', 'piano', 'sad'],
#         'angry': ['rock', 'metal', 'punk'],
#         'fear': ['ambient', 'chill', 'sleep'],
#         'surprise': ['electronic', 'edm', 'dance'],
#         'disgust': ['grunge', 'alternative', 'rock'],
#         'neutral': ['indie', 'alternative', 'pop']
#     }
    
#     seed_genres = valid_genres.get(emotion.lower(), ['pop', 'indie'])[:5]
    
#     url = "https://api.spotify.com/v1/recommendations"
#     headers = {"Authorization": f"Bearer {token}"}
#     params = {
#         "seed_genres": ','.join(seed_genres),
#         "limit": min(limit, 100),  # Spotify max is 100
#     }
    
#     # Adjust audio features based on emotion
#     if emotion.lower() == 'happy':
#         params.update({"target_valence": 0.8, "target_energy": 0.7, "min_valence": 0.6})
#     elif emotion.lower() == 'sad':
#         params.update({"target_valence": 0.3, "target_energy": 0.4, "max_valence": 0.5})
#     elif emotion.lower() == 'angry':
#         params.update({"target_energy": 0.9, "min_energy": 0.7})
#     elif emotion.lower() in ['fear', 'neutral']:
#         params.update({"target_valence": 0.5, "target_energy": 0.5})
#     elif emotion.lower() == 'surprise':
#         params.update({"target_energy": 0.8, "target_danceability": 0.7})
    
#     try:
#         response = requests.get(url, headers=headers, params=params, timeout=10)
#         response.raise_for_status()
#         return response.json()
#     except requests.exceptions.RequestException as e:
#         # If recommendations fail, try search as fallback
#         print(f"Recommendations failed: {e}, trying search...")
#         return search_spotify_tracks_fallback(token, emotion, limit)

# @bp.route('/recommend', methods=['POST'])
# @jwt_required()
# def recommend_music():
#     """Get music recommendations based on emotion"""
#     try:
#         user_id = int(get_jwt_identity())
#         data = request.get_json()
        
#         if not data or 'emotion' not in data:
#             return jsonify({'error': 'Emotion is required'}), 400
        
#         emotion = data['emotion']
#         emotion_history_id = data.get('emotion_history_id')
#         limit = data.get('limit', 20)
        
#         # Validate emotion
#         valid_emotions = ['happy', 'sad', 'angry', 'fear', 'surprise', 'disgust', 'neutral']
#         if emotion.lower() not in valid_emotions:
#             return jsonify({'error': f'Invalid emotion. Must be one of: {", ".join(valid_emotions)}'}), 400
        
#         # Get recommendations from Spotify
#         tracks = []
#         error_message = None
        
#         try:
#             # Try recommendations API first
#             recommendations = get_recommendations_by_genre(emotion, limit)
#             tracks = recommendations.get('tracks', [])
#         except Exception as spotify_error:
#             error_message = str(spotify_error)
#             print(f"Spotify API error: {error_message}")
            
#             # If no tracks from recommendations, return error with helpful message
#             if not tracks:
#                 return jsonify({
#                     'error': 'Unable to fetch music recommendations',
#                     'details': 'Spotify API error. Please check your credentials and try again.',
#                     'technical_details': error_message
#                 }), 500
        
#         if not tracks:
#             return jsonify({'error': 'No recommendations found for this emotion'}), 404
        
#         # Format tracks
#         formatted_tracks = []
#         connection = get_db_connection()
#         cursor = connection.cursor()
        
#         for track in tracks:
#             try:
#                 track_data = {
#                     'id': track.get('id', ''),
#                     'name': track.get('name', 'Unknown'),
#                     'artist': ', '.join([artist.get('name', '') for artist in track.get('artists', [])]),
#                     'album': track.get('album', {}).get('name', ''),
#                     'preview_url': track.get('preview_url'),
#                     'spotify_url': track.get('external_urls', {}).get('spotify', ''),
#                     'image_url': track.get('album', {}).get('images', [{}])[0].get('url') if track.get('album', {}).get('images') else None,
#                     'duration_ms': track.get('duration_ms', 0)
#                 }
#                 formatted_tracks.append(track_data)
                
#                 # Save to database
#                 cursor.execute(
#                     """INSERT INTO music_recommendations 
#                        (user_id, emotion_history_id, track_name, artist_name, track_id, 
#                         album_name, preview_url, spotify_url, image_url) 
#                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""",
#                     (user_id, emotion_history_id, track_data['name'], track_data['artist'],
#                      track_data['id'], track_data['album'], track_data['preview_url'],
#                      track_data['spotify_url'], track_data['image_url'])
#                 )
#             except Exception as track_error:
#                 print(f"Error processing track: {track_error}")
#                 continue
        
#         connection.commit()
#         cursor.close()
#         connection.close()
        
#         return jsonify({
#             'message': 'Recommendations generated successfully',
#             'emotion': emotion,
#             'tracks': formatted_tracks,
#             'count': len(formatted_tracks)
#         }), 200
        
#     except Exception as e:
#         print(f"Error in recommend_music: {str(e)}")
#         return jsonify({'error': f'Internal server error: {str(e)}'}), 500

# @bp.route('/history', methods=['GET'])
# @jwt_required()
# def get_music_history():
#     """Get user's music recommendation history"""
#     try:
#         user_id = int(get_jwt_identity())
        
#         # Get pagination parameters
#         page = request.args.get('page', 1, type=int)
#         limit = request.args.get('limit', 10, type=int)
#         offset = (page - 1) * limit
        
#         connection = get_db_connection()
#         cursor = connection.cursor(dictionary=True)
        
#         # Get total count
#         cursor.execute(
#             "SELECT COUNT(*) as total FROM music_recommendations WHERE user_id = %s",
#             (user_id,)
#         )
#         total = cursor.fetchone()['total']
        
#         # Get history
#         cursor.execute(
#             """SELECT id, track_name, artist_name, album_name, preview_url, 
#                       spotify_url, image_url, created_at 
#                FROM music_recommendations 
#                WHERE user_id = %s 
#                ORDER BY created_at DESC 
#                LIMIT %s OFFSET %s""",
#             (user_id, limit, offset)
#         )
#         history = cursor.fetchall()
        
#         cursor.close()
#         connection.close()
        
#         # Format dates
#         for item in history:
#             item['created_at'] = item['created_at'].isoformat() if item['created_at'] else None
        
#         return jsonify({
#             'history': history,
#             'pagination': {
#                 'total': total,
#                 'page': page,
#                 'limit': limit,
#                 'pages': (total + limit - 1) // limit
#             }
#         }), 200
        
#     except Exception as e:
#         return jsonify({'error': str(e)}), 500

# @bp.route('/genres', methods=['GET'])
# def get_available_genres():
#     """Get available Spotify genres"""
#     try:
#         token = get_spotify_token()
        
#         url = "https://api.spotify.com/v1/recommendations/available-genre-seeds"
#         headers = {"Authorization": f"Bearer {token}"}
        
#         response = requests.get(url, headers=headers)
        
#         if response.status_code != 200:
#             raise Exception("Failed to get genres")
        
#         return jsonify(response.json()), 200
        
#     except Exception as e:
#         return jsonify({'error': str(e)}), 500





from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import requests
import base64
import os
from datetime import datetime, timedelta
from backend.config.database import get_db_connection

bp = Blueprint('music', __name__)

# Spotify credentials
SPOTIFY_CLIENT_ID = os.getenv('SPOTIFY_CLIENT_ID')
SPOTIFY_CLIENT_SECRET = os.getenv('SPOTIFY_CLIENT_SECRET')

# Cache for Spotify access token
spotify_token_cache = {
    'token': None,
    'expires_at': None
}

# Emotion to music genre/mood mapping
EMOTION_TO_MUSIC = {
    'happy': ['pop', 'dance', 'party', 'happy'],
    'sad': ['sad', 'acoustic', 'piano', 'rainy-day'],
    'angry': ['rock', 'metal', 'punk', 'work-out'],
    'fear': ['ambient', 'chill', 'sleep', 'study'],
    'surprise': ['electronic', 'edm', 'party'],
    'disgust': ['grunge', 'alternative', 'indie'],
    'neutral': ['indie', 'alternative', 'chill']
}

def get_spotify_token():
    """Get Spotify access token"""
    global spotify_token_cache
    
    # Check if token is still valid
    if spotify_token_cache['token'] and spotify_token_cache['expires_at']:
        if datetime.now() < spotify_token_cache['expires_at']:
            return spotify_token_cache['token']
    
    # Get new token
    auth_string = f"{SPOTIFY_CLIENT_ID}:{SPOTIFY_CLIENT_SECRET}"
    auth_bytes = auth_string.encode('utf-8')
    auth_base64 = base64.b64encode(auth_bytes).decode('utf-8')
    
    url = "https://accounts.spotify.com/api/token"
    headers = {
        "Authorization": f"Basic {auth_base64}",
        "Content-Type": "application/x-www-form-urlencoded"
    }
    data = {"grant_type": "client_credentials"}
    
    response = requests.post(url, headers=headers, data=data)
    
    if response.status_code != 200:
        raise Exception("Failed to get Spotify access token")
    
    token_data = response.json()
    spotify_token_cache['token'] = token_data['access_token']
    spotify_token_cache['expires_at'] = datetime.now() + timedelta(seconds=token_data['expires_in'] - 60)
    
    return spotify_token_cache['token']

def search_spotify_tracks(emotion, limit=20):
    """Search Spotify for tracks based on emotion"""
    token = get_spotify_token()
    
    # Get genres/moods for emotion
    genres = EMOTION_TO_MUSIC.get(emotion.lower(), ['pop'])
    
    # Build search query
    search_query = f"genre:{genres[0]}"
    
    url = "https://api.spotify.com/v1/search"
    headers = {"Authorization": f"Bearer {token}"}
    params = {
        "q": search_query,
        "type": "track",
        "limit": limit
    }
    
    response = requests.get(url, headers=headers, params=params)
    
    if response.status_code != 200:
        raise Exception("Failed to search Spotify tracks")
    
    return response.json()

def search_spotify_tracks_fallback(token, emotion, limit=20):
    """Fallback search when recommendations API fails"""
    # Emotion-based search queries
    search_queries = {
        'happy': 'happy upbeat positive',
        'sad': 'sad emotional melancholy',
        'angry': 'rock energetic intense',
        'fear': 'calm peaceful ambient',
        'surprise': 'electronic dance party',
        'disgust': 'alternative indie rock',
        'neutral': 'chill indie alternative'
    }
    
    query = search_queries.get(emotion.lower(), 'popular music')
    
    url = "https://api.spotify.com/v1/search"
    headers = {"Authorization": f"Bearer {token}"}
    params = {
        "q": query,
        "type": "track",
        "limit": limit,
    }
    
    response = requests.get(url, headers=headers, params=params, timeout=10)
    response.raise_for_status()
    
    # Format response to match recommendations API structure
    search_data = response.json()
    return {
        "tracks": search_data.get("tracks", {}).get("items", [])
    }

def search_spotify_tracks_fallback(token, emotion, limit=20):
    """Fallback search when recommendations API fails"""
    # Emotion-based search queries
    search_queries = {
        'happy': 'happy upbeat positive',
        'sad': 'sad emotional melancholy',
        'angry': 'rock energetic intense',
        'fear': 'calm peaceful ambient',
        'surprise': 'electronic dance party',
        'disgust': 'alternative indie rock',
        'neutral': 'chill indie alternative'
    }
    
    query = search_queries.get(emotion.lower(), 'popular music')
    
    url = "https://api.spotify.com/v1/search"
    headers = {"Authorization": f"Bearer {token}"}
    params = {
        "q": query,
        "type": "track",
        "limit": limit,
    }
    
    response = requests.get(url, headers=headers, params=params, timeout=10)
    response.raise_for_status()
    
    # Format response to match recommendations API structure
    search_data = response.json()
    return {
        "tracks": search_data.get("tracks", {}).get("items", [])
    }

def get_recommendations_by_genre(emotion, limit=20):
    """Get recommendations based on emotion-mapped genres"""
    token = get_spotify_token()
    
    # Get seed genres for emotion - Spotify API requires valid genre seeds
    valid_genres = {
        'happy': ['pop', 'dance', 'party'],
        'sad': ['acoustic', 'piano', 'sad'],
        'angry': ['rock', 'metal', 'punk'],
        'fear': ['ambient', 'chill', 'sleep'],
        'surprise': ['electronic', 'edm', 'dance'],
        'disgust': ['grunge', 'alternative', 'rock'],
        'neutral': ['indie', 'alternative', 'pop']
    }
    
    seed_genres = valid_genres.get(emotion.lower(), ['pop', 'indie'])[:5]
    
    url = "https://api.spotify.com/v1/recommendations"
    headers = {"Authorization": f"Bearer {token}"}
    params = {
        "seed_genres": ','.join(seed_genres),
        "limit": min(limit, 100),  # Spotify max is 100
    }
    
    # Adjust audio features based on emotion
    if emotion.lower() == 'happy':
        params.update({"target_valence": 0.8, "target_energy": 0.7, "min_valence": 0.6})
    elif emotion.lower() == 'sad':
        params.update({"target_valence": 0.3, "target_energy": 0.4, "max_valence": 0.5})
    elif emotion.lower() == 'angry':
        params.update({"target_energy": 0.9, "min_energy": 0.7})
    elif emotion.lower() in ['fear', 'neutral']:
        params.update({"target_valence": 0.5, "target_energy": 0.5})
    elif emotion.lower() == 'surprise':
        params.update({"target_energy": 0.8, "target_danceability": 0.7})
    
    try:
        response = requests.get(url, headers=headers, params=params, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        # If recommendations fail, try search as fallback
        print(f"Recommendations failed: {e}, trying search...")
        return search_spotify_tracks_fallback(token, emotion, limit)

@bp.route('/recommend', methods=['POST'])
@jwt_required()
def recommend_music():
    """Get music recommendations based on emotion"""
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json()
        
        if not data or 'emotion' not in data:
            return jsonify({'error': 'Emotion is required'}), 400
        
        emotion = data['emotion']
        emotion_history_id = data.get('emotion_history_id')
        limit = data.get('limit', 20)
        
        # Request more tracks than needed to filter for previews
        request_limit = min(limit * 2, 100)  # Request double, max 100
        
        # Validate emotion
        valid_emotions = ['happy', 'sad', 'angry', 'fear', 'surprise', 'disgust', 'neutral']
        if emotion.lower() not in valid_emotions:
            return jsonify({'error': f'Invalid emotion. Must be one of: {", ".join(valid_emotions)}'}), 400
        
        # Get recommendations from Spotify
        tracks = []
        error_message = None
        
        try:
            # Try recommendations API first
            recommendations = get_recommendations_by_genre(emotion, request_limit)
            tracks = recommendations.get('tracks', [])
        except Exception as spotify_error:
            error_message = str(spotify_error)
            print(f"Spotify API error: {error_message}")
            
            # If no tracks from recommendations, return error with helpful message
            if not tracks:
                return jsonify({
                    'error': 'Unable to fetch music recommendations',
                    'details': 'Spotify API error. Please check your credentials and try again.',
                    'technical_details': error_message
                }), 500
        
        if not tracks:
            return jsonify({'error': 'No recommendations found for this emotion'}), 404
        
        # Format tracks
        formatted_tracks = []
        connection = get_db_connection()
        cursor = connection.cursor()
        
        for track in tracks:
            try:
                preview_url = track.get('preview_url')
                
                # Optional: Skip tracks without preview (uncomment if needed)
                # if not preview_url:
                #     continue
                
                track_data = {
                    'id': track.get('id', ''),
                    'name': track.get('name', 'Unknown'),
                    'artist': ', '.join([artist.get('name', '') for artist in track.get('artists', [])]),
                    'album': track.get('album', {}).get('name', ''),
                    'preview_url': preview_url,
                    'has_preview': preview_url is not None,
                    'spotify_url': track.get('external_urls', {}).get('spotify', ''),
                    'image_url': track.get('album', {}).get('images', [{}])[0].get('url') if track.get('album', {}).get('images') else None,
                    'duration_ms': track.get('duration_ms', 0)
                }
                formatted_tracks.append(track_data)
                
                # Stop if we have enough tracks
                if len(formatted_tracks) >= limit:
                    break
                
                # Save to database
                cursor.execute(
                    """INSERT INTO music_recommendations 
                       (user_id, emotion_history_id, track_name, artist_name, track_id, 
                        album_name, preview_url, spotify_url, image_url) 
                       VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                    (user_id, emotion_history_id, track_data['name'], track_data['artist'],
                     track_data['id'], track_data['album'], track_data['preview_url'],
                     track_data['spotify_url'], track_data['image_url'])
                )
            except Exception as track_error:
                print(f"Error processing track: {track_error}")
                continue
        
        connection.commit()
        cursor.close()
        connection.close()
        
        return jsonify({
            'message': 'Recommendations generated successfully',
            'emotion': emotion,
            'tracks': formatted_tracks,
            'count': len(formatted_tracks)
        }), 200
        
    except Exception as e:
        print(f"Error in recommend_music: {str(e)}")
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@bp.route('/history', methods=['GET'])
@jwt_required()
def get_music_history():
    """Get user's music recommendation history"""
    try:
        user_id = int(get_jwt_identity())
        
        # Get pagination parameters
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 10, type=int)
        offset = (page - 1) * limit
        
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        # Get total count
        cursor.execute(
            "SELECT COUNT(*) as total FROM music_recommendations WHERE user_id = %s",
            (user_id,)
        )
        total = cursor.fetchone()['total']
        
        # Get history
        cursor.execute(
            """SELECT id, track_name, artist_name, album_name, preview_url, 
                      spotify_url, image_url, created_at 
               FROM music_recommendations 
               WHERE user_id = %s 
               ORDER BY created_at DESC 
               LIMIT %s OFFSET %s""",
            (user_id, limit, offset)
        )
        history = cursor.fetchall()
        
        cursor.close()
        connection.close()
        
        # Format dates
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

@bp.route('/genres', methods=['GET'])
def get_available_genres():
    """Get available Spotify genres"""
    try:
        token = get_spotify_token()
        
        url = "https://api.spotify.com/v1/recommendations/available-genre-seeds"
        headers = {"Authorization": f"Bearer {token}"}
        
        response = requests.get(url, headers=headers)
        
        if response.status_code != 200:
            raise Exception("Failed to get genres")
        
        return jsonify(response.json()), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/recommend-with-preview', methods=['POST'])
@jwt_required()
def recommend_music_with_preview():
    """Get music recommendations that have preview URLs"""
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json()
        
        if not data or 'emotion' not in data:
            return jsonify({'error': 'Emotion is required'}), 400
        
        emotion = data['emotion']
        emotion_history_id = data.get('emotion_history_id')
        desired_count = data.get('limit', 20)
        
        # Request more tracks to filter for previews
        max_attempts = 100
        formatted_tracks = []
        
        try:
            recommendations = get_recommendations_by_genre(emotion, max_attempts)
            tracks = recommendations.get('tracks', [])
            
            # Filter tracks with previews only
            for track in tracks:
                if track.get('preview_url'):
                    track_data = {
                        'id': track.get('id', ''),
                        'name': track.get('name', 'Unknown'),
                        'artist': ', '.join([artist.get('name', '') for artist in track.get('artists', [])]),
                        'album': track.get('album', {}).get('name', ''),
                        'preview_url': track.get('preview_url'),
                        'spotify_url': track.get('external_urls', {}).get('spotify', ''),
                        'image_url': track.get('album', {}).get('images', [{}])[0].get('url') if track.get('album', {}).get('images') else None,
                        'duration_ms': track.get('duration_ms', 0)
                    }
                    formatted_tracks.append(track_data)
                    
                    if len(formatted_tracks) >= desired_count:
                        break
            
            if not formatted_tracks:
                return jsonify({
                    'error': 'No tracks with preview URLs found',
                    'message': 'Try using the regular /recommend endpoint or open tracks directly on Spotify'
                }), 404
            
            # Save to database
            connection = get_db_connection()
            cursor = connection.cursor()
            
            for track_data in formatted_tracks:
                cursor.execute(
                    """INSERT INTO music_recommendations 
                       (user_id, emotion_history_id, track_name, artist_name, track_id, 
                        album_name, preview_url, spotify_url, image_url) 
                       VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                    (user_id, emotion_history_id, track_data['name'], track_data['artist'],
                     track_data['id'], track_data['album'], track_data['preview_url'],
                     track_data['spotify_url'], track_data['image_url'])
                )
            
            connection.commit()
            cursor.close()
            connection.close()
            
            return jsonify({
                'message': 'Recommendations with previews generated successfully',
                'emotion': emotion,
                'tracks': formatted_tracks,
                'count': len(formatted_tracks)
            }), 200
            
        except Exception as spotify_error:
            return jsonify({
                'error': 'Unable to fetch music recommendations',
                'details': str(spotify_error)
            }), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500