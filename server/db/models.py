import sqlalchemy as sql
from sqlalchemy.sql import text
from secrets import token_urlsafe
from datetime import datetime, timezone
from sqlalchemy import create_engine, MetaData, select, String, JSON, DateTime, ForeignKey, Integer, Text, inspect, update
from sqlalchemy.orm import Session, DeclarativeBase, mapped_column, validates, relationship, Mapped, sessionmaker, reconstructor

from server.db import *


# The models for storing the workspaces, flows, node types,edge types and the nodes and edges themselves for the flow control app
class Workspace(Base):
  __tablename__ = 'workspaces'
  id = sql.Column(sql.Integer, primary_key=True, autoincrement=True)
  slug = sql.Column(sql.String, nullable=False, unique=True, default=token_urlsafe(6))
  name = sql.Column(sql.String, nullable=False)
  description = sql.Column(sql.Text, nullable=True)
  icon = sql.Column(sql.String, nullable=True)
  default_flow_id = sql.Column(sql.Integer, nullable=True)
  created_at = sql.Column(sql.DateTime, default=datetime.now(timezone.utc))
  updated_at = sql.Column(sql.DateTime, default=datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

  flows = relationship('Flow', back_populates='workspace', cascade='all, delete, delete-orphan')
  nodes = relationship('Node', back_populates='workspace', cascade='all, delete, delete-orphan')
  edges = relationship('Edge', back_populates='workspace', cascade='all, delete, delete-orphan')

  @validates('name')
  def validate_name(self, key, name):
    assert len(name) > 0
    return name

  def __repr__(self):
    return f'<Workspace {self.id} {self.slug} {self.name} {self.description} {bool(self.icon)} {self.default_flow_id} {self.created_at} {self.updated_at}>'
  
  @property
  def default(self):
    if self.default_flow_id:
      return session.query(Flow).filter_by(id = self.default_flow_id).first()
    return session.query(Flow).filter_by(default = True).where(Flow.workspace_id == self.id).first()


class Flow(Base):
  __tablename__ = 'flows'
  id = sql.Column(sql.Integer, primary_key=True, autoincrement=True)
  slug = sql.Column(sql.String, nullable=False, unique=True, default=token_urlsafe(6))
  name = sql.Column(sql.String, nullable=False)
  description = sql.Column(sql.Text, nullable=True)
  default = sql.Column(sql.Boolean, default=False)
  position = sql.Column(sql.JSON, nullable=True)
  created_at = sql.Column(sql.DateTime, default=datetime.now(timezone.utc))
  updated_at = sql.Column(sql.DateTime, default=datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

  workspace_id = sql.Column(sql.Integer, sql.ForeignKey('workspaces.id'))
  workspace = relationship('Workspace', back_populates='flows')

  nodes = relationship('Node', back_populates='flow', cascade='all, delete, delete-orphan')
  edges = relationship('Edge', back_populates='flow', cascade='all, delete, delete-orphan')

  @validates('name')
  def validate_name(self, key, name):
    assert len(name) > 0
    return name

  def __repr__(self):
    return f'<Flow {self.id} {self.name} {self.description} {self.default} {self.position} {self.created_at} {self.updated_at} {self.workspace_id}>'


class NodeType(Base):
  __tablename__ = 'node_types'
  id = sql.Column(sql.Integer, primary_key=True, autoincrement=True)
  slug = sql.Column(sql.String, nullable=False, unique=True)
  name = sql.Column(sql.String, nullable=False)
  description = sql.Column(sql.Text, nullable=True)
  fields = sql.Column(sql.JSON, nullable=False)
  created_at = sql.Column(sql.DateTime, default=datetime.now(timezone.utc))
  updated_at = sql.Column(sql.DateTime, default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))

  nodes = relationship('Node', back_populates='node_type')

  @validates('name')
  def validate_name(self, key, name):
    assert len(name) > 0
    return name

  def __repr__(self):
    return f'<NodeType {self.id} {self.slug} {self.name} {self.description} {self.fields} {self.created_at} {self.updated_at}>'


class EdgeType(Base):
  __tablename__ = 'edge_types'
  id = sql.Column(sql.Integer, primary_key=True, autoincrement=True)
  slug = sql.Column(sql.String, nullable=False, unique=True)
  name = sql.Column(sql.String, nullable=False)
  description = sql.Column(sql.Text, nullable=True)
  fields = sql.Column(sql.JSON, nullable=True)
  created_at = sql.Column(sql.DateTime, default=datetime.now(timezone.utc))
  updated_at = sql.Column(sql.DateTime, default=datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

  edges = relationship('Edge', back_populates='edge_type')

  @validates('name')
  def validate_name(self, key, name):
    assert len(name) > 0
    return name

  def __repr__(self):
    return f'<EdgeType {self.id} {self.slug} {self.name} {self.description} {self.fields} {self.created_at} {self.updated_at}>'


class Node(Base):
  __tablename__ = 'nodes'
  id = sql.Column(sql.Integer, primary_key=True, autoincrement=True)
  nid = sql.Column(sql.VARCHAR, nullable=False)
  node = sql.Column(sql.JSON, nullable=False)
  created_at = sql.Column(sql.DateTime, default=datetime.now(timezone.utc))
  updated_at = sql.Column(sql.DateTime, default=datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

  flow_id = sql.Column(sql.Integer, sql.ForeignKey('flows.id'))
  flow = relationship('Flow', back_populates='nodes')


  workspace_id = sql.Column(sql.Integer, sql.ForeignKey('workspaces.id'))
  workspace = relationship('Workspace', back_populates='nodes')

  node_type_id = sql.Column(sql.Integer, sql.ForeignKey('node_types.id'))
  node_type = relationship('NodeType', back_populates='nodes')

  @validates('name')
  def validate_name(self, key, name):
    assert len(name) > 0
    return name

  @validates('node')
  def validate_node(self, key, node):
    assert len(node) > 0
    return node

  def __repr__(self):
    return f'<Node {self.id} {self.nid} {self.node} {self.created_at} {self.updated_at} {self.flow_id} {self.workspace_id} {self.node_type_id}>'


class Edge(Base):
  __tablename__ = 'edges'
  id = sql.Column(sql.Integer, primary_key=True, autoincrement=True)
  eid = sql.Column(sql.VARCHAR, nullable=False)
  edge = sql.Column(sql.JSON, nullable=False)
  created_at = sql.Column(sql.DateTime, default=datetime.now(timezone.utc))
  updated_at = sql.Column(sql.DateTime, default=datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

  flow_id = sql.Column(sql.Integer, sql.ForeignKey('flows.id'))
  flow = relationship('Flow', back_populates='edges')

  workspace_id = sql.Column(sql.Integer, sql.ForeignKey('workspaces.id'))
  workspace = relationship('Workspace', back_populates='edges')

  edge_type_id = sql.Column(sql.Integer, sql.ForeignKey('edge_types.id'))
  edge_type = relationship('EdgeType', back_populates='edges')

  @validates('name')
  def validate_name(self, key, name):
    assert len(name) > 0
    return name

  @validates('edge')
  def validate_edge(self, key, edge):
    assert len(edge) > 0
    return edge

  def __repr__(self):
    return f'<Edge {self.id} {self.eid} {self.edge} {self.created_at} {self.updated_at} {self.flow_id} {self.workspace_id} {self.edge_type_id}>'


# Create the tables in the database
Base.metadata.create_all(engine)

# Create session
Session = sessionmaker(bind=engine)
session = Session()

# Schema updates
# schema_update_handler(session.execute, text('ALTER TABLE flows ADD COLUMN slug VARCHAR;'))
# schema_update_handler(session.execute, text('ALTER TABLE flows ADD COLUMN position JSON;'))
# schema_update_handler(session.execute, text('ALTER TABLE workspaces ADD COLUMN icon TEXT;'))
# schema_update_handler(session.execute, text('ALTER TABLE edge_types ADD COLUMN fields JSON;'))
# schema_update_handler(session.execute, text('ALTER TABLE node_types ADD COLUMN fields JSON;'))
# schema_update_handler(session.execute, text('ALTER TABLE workspaces ADD COLUMN slug VARCHAR;'))
# schema_update_handler(session.execute, text('ALTER TABLE workspaces ADD COLUMN default_flow_id INTEGER;'))  

# Was to try to implement automatic schema updates
metadata = MetaData()
metadata.reflect(bind=engine)
mapper = inspect(Workspace)
