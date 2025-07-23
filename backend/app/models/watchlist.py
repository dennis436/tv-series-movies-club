from sqlalchemy_serializer import SerializerMixin
from .. import db
from .__init__ import BaseModelMixin

class Watchlist(BaseModelMixin, SerializerMixin, db.Model):
    __tablename__ = 'watchlists'

    id = db.Column(db.Integer, primary_key=True)
    
    # Foreign Keys
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    movie_id = db.Column(db.Integer, db.ForeignKey('movies.id'), nullable=False)

    # Ensure a user can only add a movie to their watchlist once
    __table_args__ = (db.UniqueConstraint('user_id', 'movie_id', name='_user_movie_watchlist_uc'),)

    # Relationships
    user = db.relationship('User', back_populates='watchlists', foreign_keys=[user_id])
    movie = db.relationship('Movie', back_populates='watchlists', foreign_keys=[movie_id])
    serialize_rules = (
        '-created_at',
        '-updated_at',
        '-user.watchlist_entries', 
        '-movie.watchlists',       
        'user.username',           
        'movie.title',             
    )

    def __repr__(self):
        return f'<Watchlist User:{self.user_id} Movie:{self.movie_id}>'

