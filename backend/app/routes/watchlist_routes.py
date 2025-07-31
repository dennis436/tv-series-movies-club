# backend/app/routes/watchlist_routes.py
from flask import Blueprint, request, jsonify
from flask_restful import Api, Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db # Assuming 'db' is your SQLAlchemy instance
from app.models.watchlist import Watchlist # Import your Watchlist model

watchlist_bp = Blueprint('watchlist_bp', __name__)
api = Api(watchlist_bp)

class UserWatchlistResource(Resource):
    @jwt_required()
    def get(self, user_id):
        current_user_id = get_jwt_identity()
        if current_user_id != user_id:
            return {'message': 'Unauthorized access'}, 403

        watchlist_items = Watchlist.query.filter_by(user_id=user_id).all()
        # Ensure that the to_dict method is correctly returning all necessary fields
        return jsonify([item.to_dict() for item in watchlist_items])

    @jwt_required()
    def post(self, user_id):
        current_user_id = get_jwt_identity()
        if current_user_id != user_id:
            return {'message': 'Unauthorized access'}, 403

        data = request.get_json()
        movie_id = data.get('movie_id')
        movie_title = data.get('movie_title')
        genre = data.get('genre')
        status = data.get('status', 'pending') # Default status

        if not movie_id or not movie_title:
            return {'message': 'Movie ID and title are required'}, 400

        # Check if item already exists for this user and movie
        existing_item = Watchlist.query.filter_by(user_id=user_id, movie_id=movie_id).first()
        if existing_item:
            # If it exists, update its status if different, otherwise return conflict
            if existing_item.status != status:
                existing_item.status = status
                db.session.commit()
                return {'message': 'Watchlist item updated', 'item': existing_item.to_dict()}, 200
            return {'message': 'Movie already in watchlist with same status'}, 409 # Conflict
        
        new_item = Watchlist(
            user_id=user_id,
            movie_id=movie_id,
            movie_title=movie_title,
            genre=genre,
            status=status
        )
        db.session.add(new_item)
        db.session.commit()
        return {'message': 'Movie added to watchlist', 'item': new_item.to_dict()}, 201

class WatchlistItemResource(Resource):
    @jwt_required()
    def put(self, user_id, watchlist_item_id):
        current_user_id = get_jwt_identity()
        if current_user_id != user_id:
            return {'message': 'Unauthorized access'}, 403

        item = Watchlist.query.filter_by(id=watchlist_item_id, user_id=user_id).first()
        if not item:
            return {'message': 'Watchlist item not found'}, 404

        data = request.get_json()
        status = data.get('status')
        if status:
            item.status = status
            db.session.commit()
            return {'message': 'Watchlist item updated', 'item': item.to_dict()}, 200
        return {'message': 'No status provided for update'}, 400

    @jwt_required()
    def delete(self, user_id, watchlist_item_id):
        current_user_id = get_jwt_identity()
        if current_user_id != user_id:
            return {'message': 'Unauthorized access'}, 403

        item = Watchlist.query.filter_by(id=watchlist_item_id, user_id=user_id).first()
        if not item:
            return {'message': 'Watchlist item not found'}, 404

        db.session.delete(item)
        db.session.commit()
        return {'message': 'Watchlist item deleted'}, 200

# Register resources with the blueprint's API instance
api.add_resource(UserWatchlistResource, '/users/<int:user_id>/watchlist')
api.add_resource(WatchlistItemResource, '/users/<int:user_id>/watchlist/<int:watchlist_item_id>')
