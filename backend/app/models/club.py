from sqlalchemy_serializer import SerializerMixin
from .. import db
from .__init__ import BaseModelMixin 
from datetime import datetime

class Club(BaseModelMixin, SerializerMixin, db.Model):
    __tablename__ = 'clubs'

    # Columns
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text)
    genre = db.Column(db.String(100))
    created_by_user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    creator = db.relationship('User', back_populates='clubs_created', foreign_keys=[created_by_user_id])
    posts = db.relationship('Post', back_populates='club', lazy=True)
    members = db.relationship(
        'ClubMember',
        back_populates='club', 
        lazy=True,
        cascade='all, delete-orphan'
    )

    # Remove serialize_rules to rely entirely on custom to_dict
    # serialize_rules = ( ... ) 

    def to_dict(self):
        # Manually construct the dictionary to avoid recursion
        data = {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'genre': self.genre,
            'created_by_user_id': self.created_by_user_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }

        # Add creator's username directly, without serializing the full creator object
        if self.creator:
            data['creator_username'] = self.creator.username
        else:
            data['creator_username'] = 'Unknown'

        # Do NOT include self.posts or self.members directly here,
        # as that would cause the recursion. If you need a count, do:
        # data['posts_count'] = len(self.posts)
        # data['members_count'] = len(self.members)
        
        return data

    def __repr__(self):
        return f'<Club {self.name}>'
