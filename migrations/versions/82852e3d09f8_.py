"""empty message

Revision ID: 82852e3d09f8
Revises: b5a4b5177cc3
Create Date: 2024-08-24 18:12:44.123408

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '82852e3d09f8'
down_revision = 'b5a4b5177cc3'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('tasks', schema=None) as batch_op:
        batch_op.add_column(sa.Column('user_id', sa.Integer(), nullable=False))
        batch_op.create_foreign_key(None, 'users', ['user_id'], ['id'])

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('tasks', schema=None) as batch_op:
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.drop_column('user_id')

    # ### end Alembic commands ###
