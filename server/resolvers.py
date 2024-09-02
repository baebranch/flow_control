from time import time
from json import loads, dumps
from urllib.parse import unquote

from server import *
from server.db.models import *


# Status resolvers
@response_handler
def getStatus(_, info, **kwargs):
  return {
    'success': True,
    'status': 'OK',
    'server_time': str(time()),
    'version': VERSION
  }


# Workspace resolvers
@response_handler
def getWorkspace(_, info, **kwargs):
  workspace = session.query(Workspace).filter_by(id=kwargs.get('id')).first()
  return {'workspace': workspace}

@response_handler
def getWorkspaces(_, info, **kwargs):
  worksapces = session.query(Workspace).all()
  return {'workspaces': worksapces}

@response_handler
def createWorkspace(_, info, **kwargs):
  # Create a new workspace
  workspace = Workspace(**kwargs)
  # If any value is 
  session.add(workspace)
  session.commit()

  # Create the default main flow for the workspace
  flow = Flow(name='Main', workspace=workspace, description='The main flow for this workspace.', default=True)
  session.add(flow)
  session.commit()

  # Return the new workspace
  return {'workspace': workspace}

@response_handler
def updateWorkspace(_, info, **kwargs):
  workspace = session.query(Workspace).filter_by(id=kwargs.get('id')).first()
  workspace.update(**kwargs)
  session.commit()
  return {'workspace': workspace}

@response_handler
def deleteWorkspace(_, info, **kwargs):
  workspace = session.query(Workspace).filter_by(id=kwargs.get('id')).first()
  session.delete(workspace)
  session.commit()
  return {'workspace': workspace}


# Flow Resolvers
@response_handler
def getFlow(_, info, **kwargs):
  flow = session.query(Flow).filter_by(id=kwargs.get('id')).first()
  return {'flow': flow}

@response_handler
def getFlows(_, info, **kwargs):
  flows = session.query(Flow).filter_by(workspace_id=kwargs.get('workspace_id')).all()
  return {'flows': flows}

@response_handler
def getDefaultFlow(_, info, **kwargs):
  flow = session.query(Flow).filter_by(workspace_id=kwargs.get('workspace_id'), default=True).first()
  return {'flow': flow}

@response_handler
def createFlow(_, info, **kwargs):
  flow = Flow(**kwargs)
  session.add(flow)
  session.commit()
  return {'flow': flow}

@response_handler
def updateFlow(_, info, **kwargs):
  flow = session.query(Flow).filter_by(id=kwargs.get('id')).first()
  flow.update(**kwargs)
  session.commit()
  return {'flow': flow}

@response_handler
def deleteFlow(_, info, **kwargs):
  flow = session.query(Flow).filter_by(id=kwargs.get('id')).first()
  session.delete(flow)
  session.commit()
  return {'flow': flow}


# Node Resolvers
@response_handler
def getNode(_, info, **kwargs):
  node = session.query(Node).filter_by(id=kwargs.get('id')).first()
  return {'node': node}

@response_handler
def getNodes(_, info, **kwargs):
  # Filter by flow_id or workspace_id if provided
  nodes = session.scalars(select(Node).filter(sql.or_(
    Node.flow_id == kwargs.get('flow_id'),
    Node.workspace_id == kwargs.get('workspace_id')
  ))).all()
  return {'nodes': nodes}

@response_handler
def createNode(_, info, **kwargs):
  node = Node(**kwargs)
  node.node = unquote(kwargs.get('node', '{}'))
  session.add(node)
  session.commit()
  return {'node': node}

@response_handler
def updateNode(_, info, **kwargs):
  node = session.query(Node).filter_by(nid=kwargs.get('nid')).first()

  if node_data:= kwargs.pop('node', None):
    node_data = loads(unquote(node_data))
    kwargs['node'] = dumps({**loads(node.node), **node_data})
  
  for key, value in kwargs.items():
    setattr(node, key, value)

  session.commit()
  return {'node': node}

@response_handler
def deleteNode(_, info, **kwargs):
  node = session.query(Node).filter_by(nid=kwargs.get('nid')).first()
  session.delete(node)
  session.commit()
  return {'node': node}


# Edge Resolvers
@response_handler
def getEdge(_, info, **kwargs):
  edge = session.query(Edge).filter_by(id=kwargs.get('id')).first()
  return {'edge': edge}

@response_handler
def getEdges(_, info, **kwargs):
  edges = session.query(Edge).filter_by(flow_id=kwargs.get('flow_id')).all()
  return {'edges': edges}

@response_handler
def createEdge(_, info, **kwargs):
  edge = Edge(**kwargs)
  session.add(edge)
  session.commit()
  return {'edge': edge}

@response_handler
def updateEdge(_, info, **kwargs):
  edge = session.query(Edge).filter_by(id=kwargs.get('id')).first()
  edge.update(**kwargs)
  session.commit()
  return {'edge': edge}

@response_handler
def deleteEdge(_, info, **kwargs):
  edge = session.query(Edge).filter_by(id=kwargs.get('id')).first()
  session.delete(edge)
  session.commit()
  return {'edge': edge}


# Node Type Resolvers
@response_handler
def getNodeType(_, info, **kwargs):
  node_type = session.query(NodeType).filter_by(id=kwargs.get('id')).first()
  return {'node_type': node_type}

@response_handler
def getNodeTypes(_, info, **kwargs):
  node_types = session.query(NodeType).all()
  return {'node_types': node_types}


# Edge Type Resolvers
@response_handler
def getEdgeType(_, info, **kwargs):
  edge_type = session.query(EdgeType).filter_by(id=kwargs.get('id')).first()
  return {'edge_type': edge_type}

@response_handler
def getEdgeTypes(_, info, **kwargs):
  edge_types = session.query(EdgeType).all()
  return {'edge_types': edge_types}
