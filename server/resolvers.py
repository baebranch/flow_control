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


# Updated functions
def updateFlowandWorksapceTS(item):
  item.flow.updated_at = datetime.now(timezone.utc)
  item.workspace.updated_at = datetime.now(timezone.utc)

# Workspace resolvers
@response_handler
def getWorkspace(_, info, **kwargs):
  workspace = session.query(Workspace).filter_by(id=kwargs.get('id')).first()
  return {'workspace': workspace}

@response_handler
def getWorkspaces(_, info, **kwargs):
  workspaces = session.query(Workspace).all()
  return {'workspaces': workspaces}

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
  workspace.default_flow_id = flow.id
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
  flow = session.query(Flow).filter_by(slug=kwargs.get('slug'), workspace_id=kwargs.get('workspace_id')).first()
  return {'flow': flow}

@response_handler
def getFlows(_, info, **kwargs):
  if workspace_id := kwargs.get('workspace_id', None):
    flows = session.query(Flow).filter_by(workspace_id=workspace_id).all()
  elif slugs := kwargs.get('slugs', None):
    flows = session.query(Flow).filter(Flow.slug.in_(slugs)).all()
  else:
    raise Exception('Invalid query parameters.')
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
  if position := kwargs.get('position', None):
    kwargs['position'] = loads(unquote(position))
  
  for key, value in kwargs.items():
    setattr(flow, key, value)

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
  # Create a new node model
  node = Node(**kwargs)
  node.node = unquote(kwargs.get('node', '{}'))
  session.add(node)
  session.commit()

  # If the node is a subflow, create a new flow for it
  if node.node_type.slug == 'subflow':
    flow = Flow(name=loads(node.node)['data'].get('flow', 'SubFlow'), workspace=node.workspace, description=loads(node.node)['data'].get('body', 'A subflow.'), default=False, slug=loads(node.node)['data']['slug'])
    session.add(flow)
    session.commit()

  updateFlowandWorksapceTS(node)
  session.commit()
  return {'node': node}

@response_handler
def updateNode(_, info, **kwargs):
  node = session.query(Node).filter_by(nid=kwargs.get('nid')).first()

  if node_data:= kwargs.pop('node', None):
    node_data = loads(unquote(node_data))
    node_data.pop('selected', None)
    kwargs['node'] = dumps({**loads(node.node), **node_data})
  
  for key, value in kwargs.items():
    setattr(node, key, value)
  
  
  # If the node is a subflow, update the flow name and description
  if node.node_type.slug == 'subflow':
    flow = session.query(Flow).filter_by(slug=loads(node.node)['data']['slug'], workspace_id=node.workspace_id).first()
    flow.name=loads(node.node)['data'].get('flow', 'SubFlow')
    flow.description=loads(node.node)['data'].get('body', 'A subflow.')
  
  updateFlowandWorksapceTS(node)
  
  session.commit()
  return {'node': node}

@response_handler
def deleteNode(_, info, **kwargs):
  node = session.query(Node).filter_by(nid=kwargs.get('nid')).first()
  session.delete(node)

  if node.node_type.slug == 'subflow':
    flow = session.query(Flow).filter_by(slug=loads(node.node)['data']['slug'], workspace_id=node.workspace_id).first()
    session.delete(flow)
  
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
  edge.edge = loads(unquote(kwargs.get('edge', '{}')))
  edge.eid = edge.edge['id']
  session.add(edge)
  session.commit()
  updateFlowandWorksapceTS(edge)
  session.commit()
  return {'edge': edge}

@response_handler
def updateEdge(_, info, **kwargs):
  edge = session.query(Edge).filter_by(eid=kwargs.get('eid')).first()

  if edge_data:= kwargs.pop('edge', None):
    edge_data = loads(unquote(edge_data))
    kwargs['edge'] = dumps({**loads(edge.edge), **edge_data})

  edge.update(**kwargs)
  updateFlowandWorksapceTS(edge)

  session.commit()
  return {'edge': edge}

@response_handler
def deleteEdge(_, info, **kwargs):
  edge = session.query(Edge).filter_by(eid=kwargs.get('eid')).first()
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
