from sqlalchemy_serializer import SerializerMixin
from .. import db
from .__init__ import BaseModelMixin # Assuming BaseModelMixin is used
from datetime import datetime # Import datetime for default values

class Watchlist(BaseModelMixin, SerializerMixin, db.Model):
    __tablename__ = 'watchlists'

    id = db.Column(db.Integer, primary_key=True)
    
    # Foreign Keys
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    movie_id = db.Column(db.Integer, db.ForeignKey('movies.id'), nullable=False)

    # NEW COLUMNS: These were missing and are causing the TypeError
    movie_title = db.Column(db.String(255), nullable=False) # Title of the movie/post
    genre = db.Column(db.String(100)) # Genre of the movie/post (can be nullable)
    status = db.Column(db.String(50), default='pending', nullable=False) # e.g., 'pending', 'watched', 'liked'

    # BaseModelMixin already provides created_at and updated_at, but ensure they are handled if not
    # created_at = db.Column(db.DateTime, default=datetime.utcnow)
    # updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    __table_args__ = (db.UniqueConstraint('user_id', 'movie_id', name='_user_movie_watchlist_uc'),)

    # Relationships
    user = db.relationship('User', back_populates='watchlists', foreign_keys=[user_id])
    movie = db.relationship('Movie', back_populates='watchlists', foreign_keys=[movie_id])
    
    serialize_rules = (
        '-created_at',
        '-updated_at',
        '-user.watchlists',
        '-movie.watchlists',
        'user.username', 
        'movie.title', # Include title from the Movie model
        # NEW: Include the new columns in serialization
        'movie_title', # This is the title stored directly on the watchlist item
        'genre',
        'status',
    )

    def __repr__(self):
        return f'<Watchlist User:{self.user_id} Movie:{self.movie_id} Title:{self.movie_title} Status:{self.status}>'

