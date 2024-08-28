"""empty message

Revision ID: f35b53f7b27c
Revises: 50a4c1ac84c5
Create Date: 2024-08-27 22:20:42.937722

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f35b53f7b27c'
down_revision = '50a4c1ac84c5'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.alter_column('enterprise_id',
               existing_type=sa.INTEGER(),
               nullable=False)
        batch_op.alter_column('organization_name',
               existing_type=sa.VARCHAR(length=120),
               nullable=False)

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.alter_column('organization_name',
               existing_type=sa.VARCHAR(length=120),
               nullable=True)
        batch_op.alter_column('enterprise_id',
               existing_type=sa.INTEGER(),
               nullable=True)

    # ### end Alembic commands ###
