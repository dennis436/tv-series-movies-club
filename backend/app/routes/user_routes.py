from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from .. import db
from ..models.user import User
from ..models.club_member import ClubMember 
from ..models.club import Club 

user_bp = Blueprint('user_bp', __name__)

# Route to get user details
@user_bp.route('/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user_details(user_id):
    current_user_id = get_jwt_identity()
    if current_user_id != user_id:
        return jsonify({"message": "Unauthorized access"}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    return jsonify(user.to_dict(rules=('-password_hash',))), 200

@user_bp.route('/<int:user_id>/clubs', methods=['GET'])
@jwt_required()
def get_user_clubs(user_id):
    current_user_id = get_jwt_identity()
    if current_user_id != user_id:
        return jsonify({"message": "Unauthorized access"}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    # Fetch ClubMember entries for this user
    memberships = ClubMember.query.filter_by(user_id=user.id).all()
   
    joined_clubs = [membership.club.to_dict() for membership in memberships if membership.club]
    
    return jsonify(joined_clubs), 200

