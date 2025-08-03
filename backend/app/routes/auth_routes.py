from flask_restful import Resource
from flask import request, make_response, jsonify, url_for
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import secrets
import os # NEW: Import os for environment variables
from flask_mail import Message # Import Message for email content
from .. import db, bcrypt, mail # Corrected: Import db, bcrypt, mail objects from app/__init__.py

from ..models.user import User

class UserRegistration(Resource):
    """
    API Resource for user registration.
    Handles POST requests to create a new user account.
    """
    def post(self):
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')

        #basic validation
        if not username or not email or not password:
            return {'message': 'Username, email, and password are required'}, 400 
        
        # Check if user already exists
        if User.query.filter_by(username=username).first():
            return {'message': 'Username already exists'}, 409
        if User.query.filter_by(email=email).first():
            return {'message': 'Email already exists'}, 409
        
        try:
            new_user = User(username=username, email=email)
            new_user.password_hash = password  
            db.session.add(new_user)
            db.session.commit()

            access_token = create_access_token(identity=new_user.id)
            return make_response(jsonify({
                'message': 'User registered successfully',
                'user_id': new_user.id,
                'username': new_user.username,
                'access_token': access_token
            }), 201) #new user created successfully
        except Exception as e:
            db.session.rollback()
            return {'message': f'Error registering user: {str(e)}'}, 500 
        
class UserLogin(Resource):
    """
    API Resource for user login.
    Handles POST requests to authenticate a user and issue a JWT.
    """
    def post(self):
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        user = User.query.filter_by(username=username).first()

        if user and user.authenticate(password):
            access_token = create_access_token(identity=user.id)
            return make_response(jsonify({
                'message': 'Login successful',
                'user_id': user.id,
                'username': user.username,
                'access_token': access_token
            }), 200)
        else:
            return {'message': 'Invalid username or password'}, 401
        
class CheckSession(Resource):
    """
    API Resource to check if a user's session is active (i.e., if their JWT is valid).
    Handles GET requests and requires a valid JWT in the Authorization header.
    """
    @jwt_required() 
    def get(self):
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)

        if user:
            return make_response(jsonify({
                'message': 'Session active',
                'user_id': user.id,
                'username': user.username,
                'email': user.email 
            }), 200) 
        else:
            return {'message': 'User not found'}, 404 

class ForgotPassword(Resource):
    """
    API Resource for handling forgotten password requests.
    Sends a password reset link to the user's email.
    """
    def post(self):
        data = request.get_json()
        email = data.get('email')

        if not email:
            return {'message': 'Email is required'}, 400

        user = User.query.filter_by(email=email).first()

        # Always return a generic success message for security reasons
        # to prevent email enumeration.
        if user:
            reset_token = user.generate_reset_token() # Use the method from User model
            
            # --- Email Sending Logic ---
            # The reset_link should point to your frontend's reset password page.
            # Example: http://localhost:3000/reset-password?token=YOUR_TOKEN
            reset_link = f"legendary-bienenstitch-5a15f9.netlify.app/reset-password?token={reset_token}" # Adjust this URL to your frontend's reset page

            try:
                msg = Message("Password Reset Request for CineClub",
                              sender=os.getenv('MAIL_DEFAULT_SENDER'), # Use default sender from config
                              recipients=[user.email])
                msg.body = f"""
                To reset your password, visit the following link:
                {reset_link}

                If you did not make this request then please ignore this email.
                """
                mail.send(msg)
                print(f"DEBUG: Password reset email sent to {user.email}")
            except Exception as e:
                print(f"ERROR: Failed to send email: {e}")
                # Log the error, but still return success to frontend for security
                return {'message': 'An error occurred while sending the email. Please try again later.'}, 500
            
            print(f"DEBUG: Password reset link generated for {user.email}: {reset_link}") # For development
            return {'message': 'If an account with that email exists, a password reset link has been sent.'}, 200
        else:
            # If user not found, still return success for security
            return {'message': 'If an account with that email exists, a password reset link has been sent.'}, 200

class ResetPassword(Resource):
    """
    API Resource for resetting user password using a valid token.
    """
    def post(self):
        data = request.get_json()
        token = data.get('token')
        new_password = data.get('new_password')

        if not token or not new_password:
            return {'message': 'Token and new password are required'}, 400

        user = User.verify_reset_token(token)

        if not user:
            return {'message': 'Invalid or expired password reset token'}, 400

        try:
            user.password_hash = new_password # Use the hybrid_property setter to hash
            user.reset_token = None # Invalidate the token
            user.reset_token_expires_at = None # Clear expiry
            db.session.commit()
            return {'message': 'Password has been reset successfully'}, 200
        except Exception as e:
            db.session.rollback()
            return {'message': f'Error resetting password: {str(e)}'}, 500
