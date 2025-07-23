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

load_dotenv()

# Initialize extensions
db = SQLAlchemy()
api = Api()
bcrypt = Bcrypt()
jwt = JWTManager()
migrate = Migrate()
cors = CORS()

def create_app():

    # Create and configure the Flask application
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URI')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config["JWT_SECRET_KEY"] = os.getenv('JWT_SECRET_KEY')
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)
    app.config['JWT_TOKEN_LOCATION'] = ['headers']

# Initialize extensions with the app
    db.init_app(app)
    api.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)
# Import models to ensure they are registered with SQLAlchemy
    from .models.user import User
    from .models.club import Club
    from .models.movie import Movie
    from .models.post import Post
    from .models.review import Review
    from .models.watchlist import Watchlist
    from .models.follow import Follow
    from .models.club_member import ClubMember 

# Register error handlers
    @app.errorhandler(404)
    def not_found(error):
        return make_response(jsonify({'errors': ['Not Found']}), 404)

    @app.errorhandler(400)
    def bad_request(error):
        return make_response(jsonify({'errors': ['Bad Request']}), 400)

    @app.errorhandler(Exception)
    def handle_exception(e):
        db.session.rollback()
        return make_response(jsonify({'message': f'Unexpected error: {str(e)}'}), 500)

    @app.route('/')
    def index():
        return jsonify(message="Welcome to the TV Series & Movies Club API!")

    # Register API resources (Flask-RESTful)
    from .routes.auth_routes import UserRegistration, UserLogin, CheckSession
    api.add_resource(UserRegistration, '/auth/register') 
    api.add_resource(UserLogin, '/auth/login')         
    api.add_resource(CheckSession, '/auth/check_session') 

    # Register Flask Blueprints 
    from .routes.club_routes import club_bp
    app.register_blueprint(club_bp, url_prefix='/clubs')

    from .routes.post_routes import post_bp
    app.register_blueprint(post_bp, url_prefix='/posts') 

    from .routes.user_routes import user_bp
    app.register_blueprint(user_bp, url_prefix='/users')

    from .routes.movie_routes import movie_bp
    app.register_blueprint(movie_bp, url_prefix='/movies')

    return app

