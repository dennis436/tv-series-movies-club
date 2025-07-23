from sqlalchemy_serializer import SerializerMixin
from .. import db
from .__init__ import BaseModelMixin

class Review(BaseModelMixin, SerializerMixin, db.Model):
    __tablename__ = 'reviews'

    id = db.Column(db.Integer, primary_key=True)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text)
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    movie_id = db.Column(db.Integer, db.ForeignKey('movies.id'), nullable=False)

    user = db.relationship('User', back_populates='reviews', foreign_keys=[user_id])
    movie = db.relationship('Movie', back_populates='reviews', foreign_keys=[movie_id])
    serialize_rules = (
        '-created_at',
        '-updated_at',
        '-user.reviews',
        '-movie.reviews',
        'user.username',
        'movie.title',
    )

    def __repr__(self):
        return f'<Review {self.id} - Rating: {self.rating} for Movie:{self.movie_id} by User:{self.user_id}>'

