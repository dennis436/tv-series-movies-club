"""Add cascade delete for posts when club is deleted

Revision ID: 4888e6a08e0f
Revises: 2d682a4ba000
Create Date: 2025-07-26 18:35:09.281686

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '4888e6a08e0f'
down_revision = '2d682a4ba000'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('clubs', schema=None) as batch_op:
        batch_op.alter_column('description',
               existing_type=sa.TEXT(),
               nullable=False)
        batch_op.alter_column('genre',
               existing_type=sa.VARCHAR(length=100),
               type_=sa.String(length=50),
               nullable=False)

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('clubs', schema=None) as batch_op:
        batch_op.alter_column('genre',
               existing_type=sa.String(length=50),
               type_=sa.VARCHAR(length=100),
               nullable=True)
        batch_op.alter_column('description',
               existing_type=sa.TEXT(),
               nullable=True)

    # ### end Alembic commands ###
