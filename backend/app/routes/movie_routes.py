from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from .. import db
from ..models.movie import Movie

movie_bp = Blueprint('movie_bp', __name__)

# Route to get all movies
@movie_bp.route('/', methods=['GET'])
def get_all_movies():
    movies = Movie.query.all()
    return jsonify([movie.to_dict() for movie in movies]), 200

# Route to get a specific movie by ID
@movie_bp.route('/<int:movie_id>', methods=['GET'])
def get_movie_by_id(movie_id):
    movie = Movie.query.get(movie_id)
    if not movie:
        return jsonify({"message": "Movie not found"}), 404
    return jsonify(movie.to_dict()), 200

# Route to create a new movie
@movie_bp.route('/', methods=['POST'])
@jwt_required() 
def create_movie():
    data = request.get_json()
    title = data.get('title')
    genre = data.get('genre')
    release_year = data.get('release_year')
    director = data.get('director')
    description = data.get('description')
    poster_url = data.get('poster_url')

# Validate required fields
    if not title or not genre or not release_year:
        return jsonify({"message": "Title, genre, and release year are required"}), 400
    
# Create new movie instance
    new_movie = Movie(
        title=title,
        genre=genre,
        release_year=release_year,
        director=director,
        description=description,
        poster_url=poster_url
    )
    db.session.add(new_movie)
    db.session.commit()
    return jsonify(new_movie.to_dict()), 201

