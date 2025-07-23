from sqlalchemy_serializer import SerializerMixin
from .. import db
from .__init__ import BaseModelMixin

class Movie(BaseModelMixin, SerializerMixin, db.Model):
    __tablename__ = 'movies'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False, unique=True) 
    genre = db.Column(db.String(100), nullable=False)
    release_year = db.Column(db.Integer, nullable=False)
    director = db.Column(db.String(255)) 
    description = db.Column(db.Text) 
    poster_url = db.Column(db.String(500)) 

    # Relationships
    reviews = db.relationship('Review', back_populates='movie', lazy=True, cascade='all, delete-orphan')
    watchlists = db.relationship('Watchlist', back_populates='movie', lazy=True, cascade='all, delete-orphan')

    serialize_rules = (
        '-created_at',
        '-updated_at',
        '-reviews.movie', 
        '-watchlists.movie', 
    )

    def __repr__(self):
        return f'<Movie {self.title} ({self.release_year})>'

