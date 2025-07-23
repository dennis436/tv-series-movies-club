from sqlalchemy_serializer import SerializerMixin
from .. import db
from .__init__ import BaseModelMixin

class Follow(BaseModelMixin, SerializerMixin, db.Model):
    __tablename__ = 'follows'

    id = db.Column(db.Integer, primary_key=True)
    # Foreign Keys
    follower_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    followed_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    __table_args__ = (db.UniqueConstraint('follower_id', 'followed_id', name='_follower_followed_uc'),)

    follower = db.relationship(
        'User',
         back_populates='following', 
         foreign_keys=[follower_id]
)
    followed = db.relationship(
        'User',
        back_populates='followers',
        foreign_keys=[followed_id]
    )
# Relationships
    serialize_rules = (
        '-created_at',
        '-updated_at',
        '-follower.following',
        '-followed.followers',
        'follower.username',
        'followed.username',
    )

    def __repr__(self):
        return f'<Follower:{self.follower_id} Followed:{self.followed_id}>'

