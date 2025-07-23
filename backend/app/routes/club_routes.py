from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from .. import db
from ..models.club import Club
from ..models.club_member import ClubMember
from ..models.user import User 

club_bp = Blueprint('club_bp', __name__)


@club_bp.route('/', methods=['GET'])
def get_all_clubs():
    # Placeholder for fetching all clubs
    clubs = Club.query.all()
    return jsonify([club.to_dict() for club in clubs]), 200

# Route to create a new club
@club_bp.route('/', methods=['POST'])
@jwt_required()
def create_club():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    data = request.get_json()
    name = data.get('name')
    description = data.get('description')
    genre = data.get('genre')

    if not name or not description or not genre:
        return jsonify({"message": "Name, description, and genre are required"}), 400

    # Check if club name already exists
    existing_club = Club.query.filter_by(name=name).first()
    if existing_club:
        return jsonify({"message": "Club with this name already exists"}), 409 # Conflict

    new_club = Club(
        name=name,
        description=description,
        genre=genre,
        created_by_user_id=user.id
    )
    db.session.add(new_club)
    db.session.commit()

    return jsonify(new_club.to_dict()), 201


@club_bp.route('/<int:club_id>/join', methods=['POST'])
@jwt_required()
def join_club(club_id):
    # Placeholder for joining a club
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    club = Club.query.get(club_id)

    if not user or not club:
        return jsonify({"message": "User or Club not found"}), 404

    # Check if already a member
    existing_member = ClubMember.query.filter_by(user_id=user.id, club_id=club.id).first()
    if existing_member:
        return jsonify({"message": "Already a member of this club"}), 409 # Conflict

    # Add member 
    new_member = ClubMember(user_id=user.id, club_id=club.id)
    db.session.add(new_member)
    db.session.commit()
    return jsonify({"message": f"Successfully joined {club.name}"}), 200


@club_bp.route('/<int:club_id>', methods=['GET'])
def get_club_details(club_id):
    club = Club.query.get(club_id)
    if not club:
        return jsonify({"message": "Club not found"}), 404
    return jsonify(club.to_dict()), 200


