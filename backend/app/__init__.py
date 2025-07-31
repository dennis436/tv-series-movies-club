import os
from flask import Flask, jsonify, make_response
from flask_sqlalchemy import SQLAlchemy
from flask_restful import Api
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from dotenv import load_dotenv
from flask_cors import CORS
from datetime import timedelta
import traceback
from flask_mail import Mail # NEW: Import Flask-Mail

load_dotenv()

# Initialize extensions (only those that don't take 'app' directly)
db = SQLAlchemy()
api = Api()
bcrypt = Bcrypt()
jwt = JWTManager()
migrate = Migrate()
mail = Mail() # NEW: Initialize Flask-Mail

def create_app():
    # Create and configure the Flask application
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URI')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config["JWT_SECRET_KEY"] = os.getenv('JWT_SECRET_KEY')
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)
    app.config['JWT_TOKEN_LOCATION'] = ['headers']

    # NEW: Flask-Mail Configuration
    app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
    app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587)) # Default to 587 for TLS
    app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True').lower() in ('true', '1', 't')
    app.config['MAIL_USE_SSL'] = os.getenv('MAIL_USE_SSL', 'False').lower() in ('true', '1', 't')
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
    app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER') # The email address emails will be sent from

    # Initialize CORS directly with the app instance here
    CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

    # Initialize other extensions with the app
    db.init_app(app)
    api.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    mail.init_app(app) # NEW: Initialize Flask-Mail with the app

    # Import models to ensure they are registered with SQLAlchemy
    from .models.user import User
    from .models.club import Club
    from .models.movie import Movie
    from .models.post import Post
    from .models.review import Review
    from .models.watchlist import Watchlist # Ensure Watchlist model is imported
    from .models.follow import Follow
    from .models.club_member import ClubMember
    from .models.like import Like
    from .models.comment import Comment

    # Register error handlers
    @app.errorhandler(404)
    def not_found(error):
        print(f"DEBUG: 404 Error caught: {error}")
        traceback.print_exc()
        return make_response(jsonify({'errors': ['Not Found']}), 404)

    @app.errorhandler(400)
    def bad_request(error):
        print(f"DEBUG: 400 Error caught: {error}")
        traceback.print_exc()
        return make_response(jsonify({'errors': ['Bad Request']}), 400)

    @app.errorhandler(Exception)
    def handle_exception(e):
        db.session.rollback()
        print(f"DEBUG: Caught unexpected exception: {type(e).__name__}: {str(e)}")
        traceback.print_exc()
        return make_response(jsonify({'message': f'Unexpected error: {str(e)}'}), 500)

    @app.route('/')
    def index():
        return jsonify(message="Welcome to the TV Series & Movies Club API!")

    # Register API resources (Flask-RESTful)
    from .routes.auth_routes import UserRegistration, UserLogin, CheckSession, ForgotPassword, ResetPassword
    api.add_resource(UserRegistration, '/auth/register')
    api.add_resource(UserLogin, '/auth/login')
    api.add_resource(CheckSession, '/auth/check_session')
    api.add_resource(ForgotPassword, '/auth/forgot_password')
    api.add_resource(ResetPassword, '/auth/reset_password')

    # Register Flask Blueprints
    from .routes.club_routes import club_bp
    app.register_blueprint(club_bp, url_prefix='/clubs')

    from .routes.post_routes import post_bp
    app.register_blueprint(post_bp, url_prefix='')

    from .routes.user_routes import user_bp
    app.register_blueprint(user_bp, url_prefix='')

    from .routes.movie_routes import movie_bp
    app.register_blueprint(movie_bp, url_prefix='/movies')

    from .routes.like_routes import like_bp
    app.register_blueprint(like_bp, url_prefix='')

    from .routes.comment_routes import comment_bp
    app.register_blueprint(comment_bp, url_prefix='')

    # NEW: Import and Register the watchlist_bp blueprint
    from .routes.watchlist_routes import watchlist_bp
    app.register_blueprint(watchlist_bp, url_prefix='') # Register with empty prefix to match /users/<id>/watchlist

    return app
