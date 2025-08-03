from flask import Blueprint, jsonify, request, make_response
from flask_jwt_extended import jwt_required, get_jwt_identity
from .. import db
from ..models.post import Post
from ..models.club import Club 
from ..models.user import User 

post_bp = Blueprint('post_bp', __name__)

# Route to get all posts for a specific club
@post_bp.route('/posts/clubs/<int:club_id>/posts', methods=['GET'])
def get_club_posts(club_id):
    """
    Retrieves all posts for a specific club, ordered by creation date (newest first).
    """
    club = Club.query.get(club_id)
    if not club:
        return jsonify({"message": "Club not found"}), 404
    
    posts = Post.query.filter_by(club_id=club_id).order_by(Post.created_at.desc()).all()
    return jsonify([post.to_dict() for post in posts]), 200

# Route to create a new post in a specific club
@post_bp.route('/posts/clubs/<int:club_id>/posts', methods=['POST'])
@jwt_required()
def create_club_post(club_id):
    """
    Allows an authenticated user to create a new post in a specific club.
    Requires 'movie_title' and 'content' in the request body.
    """
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

# Manual OPTIONS handler for /posts/<int:post_id>
@post_bp.route('/posts/<int:post_id>', methods=['OPTIONS'])
def options_post(post_id):
    """
    Handles CORS preflight requests for the /posts/<int:post_id> route.
    """
    response = make_response()
    response.headers.add("Access-Control-Allow-Origin", "legendary-bienenstitch-5a15f9.netlify.app")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
    response.headers.add("Access-Control-Allow-Methods", "DELETE")
    response.headers.add("Access-Control-Allow-Credentials", "true")
    response.headers.add("Access-Control-Max-Age", "86400")
    return response, 200


# Route to delete a post by ID
@post_bp.route('/posts/<int:post_id>', methods=['DELETE'])
@jwt_required()
def delete_post(post_id):
    """
    Allows the authenticated user to delete their own post.
    """
    current_user_id = get_jwt_identity()
    
    post = Post.query.get(post_id)
    if not post:
        return jsonify({"message": "Post not found"}), 404

    # Ensure only the author can delete their post
    if post.user_id != current_user_id:
        return jsonify({"message": "Unauthorized: You can only delete your own posts"}), 403

    try:
        db.session.delete(post)
        db.session.commit()
        return jsonify({"message": "Post deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting post {post_id}: {e}")
        return jsonify({"message": "An error occurred while deleting the post"}), 500

# NEW ROUTE: Get all posts for the main feed
@post_bp.route('/posts/feed', methods=['GET'])
@jwt_required() # Assuming feed requires authentication
def get_feed_posts():
    """
    Retrieves all posts for the main feed, ordered by creation date (newest first).
    Requires authentication.
    """
    posts = Post.query.order_by(Post.created_at.desc()).all()
    
    feed_posts_data = [post.to_dict() for post in posts]
    
    return jsonify(feed_posts_data), 200
