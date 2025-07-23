from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy_serializer import SerializerMixin
from .. import db
from .__init__ import BaseModelMixin
from .. import bcrypt

class User(BaseModelMixin, SerializerMixin, db.Model):
    __tablename__= 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    _password_hash = db.Column(db.String, nullable=False)

    # Relationships - UNCOMMENTED AND CORRECTED
    posts = db.relationship('Post', back_populates='author', lazy=True, cascade='all, delete-orphan')
    reviews = db.relationship('Review', back_populates='user', lazy=True, cascade='all, delete-orphan')
    clubs_created = db.relationship('Club', back_populates='creator', lazy=True, cascade='all, delete-orphan')
    club_memberships = db.relationship('ClubMember', back_populates='user', lazy=True, cascade='all, delete-orphan')
    
    # For user-to-user following
    followers = db.relationship(
        'Follow',
        foreign_keys='Follow.followed_id',
        back_populates='followed',
        lazy=True,
        cascade='all, delete-orphan'
    )
    following = db.relationship(
        'Follow',
        foreign_keys='Follow.follower_id',
        back_populates='follower',
        lazy=True,
        cascade='all, delete-orphan'
    )
    watchlists = db.relationship('Watchlist', back_populates='user', lazy=True, cascade='all, delete-orphan')

    # Serialization rules - REFINED
    serialize_rules = (
        '-_password_hash', 
        '-created_at',
        '-updated_at',
        '-posts.author',
        '-reviews.user',
        '-clubs_created.creator',
        '-club_memberships.user',
        '-followers.followed',
        '-following.follower',
        '-watchlists.user',
        'club_memberships.club.id',
        'club_memberships.club.name',
        'club_memberships.club.description',
        'club_memberships.club.genre',
        '-club_memberships.club.members',
        '-club_memberships.club.posts',
        '-club_memberships.club.creator',
    )

    def __repr__(self):
        return f'<User {self.username}>'
    
    @hybrid_property
    def password_hash(self):
        raise AttributeError('Password hashes may not be viewed.')
    
    @password_hash.setter
    def password_hash(self, password):
        self._password_hash = bcrypt.generate_password_hash(
            password.encode('utf-8')).decode('utf-8')
        
    def authenticate(self, password):
        return bcrypt.check_password_hash(
            self._password_hash, password.encode('utf-8'))

