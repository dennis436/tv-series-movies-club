from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from .. import db
from ..models.post import Post
from ..models.club import Club 
from ..models.user import User 

post_bp = Blueprint('post_bp', __name__)

# Route to get all posts for a specific club
@post_bp.route('/clubs/<int:club_id>/posts', methods=['GET'])
def get_club_posts(club_id):
    club = Club.query.get(club_id)
    if not club:
        return jsonify({"message": "Club not found"}), 404
    
    posts = Post.query.filter_by(club_id=club_id).order_by(Post.created_at.desc()).all()
    return jsonify([post.to_dict() for post in posts]), 200

# Route to create a new post in a specific club
@post_bp.route('/clubs/<int:club_id>/posts', methods=['POST'])
@jwt_required()
def create_club_post(club_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    club = Club.query.get(club_id)

    if not user or not club:
        return jsonify({"message": "User or Club not found"}), 404

    data = request.get_json()
    movie_title = data.get('movie_title')
    content = data.get('content')

    if not movie_title or not content:
        return jsonify({"message": "Movie title and content are required"}), 400

    new_post = Post(
        movie_title=movie_title,
        content=content,
        user_id=user.id,
        club_id=club.id
    )
    db.session.add(new_post)
    db.session.commit()

    return jsonify(new_post.to_dict()), 201 

