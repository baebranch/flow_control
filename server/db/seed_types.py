from server.db import *
from server.db.models import *

# Seed the database with the node and edge types
def seed() -> bool:
  # Starting database seeding
  print('Seeding database with node and edge types...')
  new_edges = 0
  new_nodes = 0

  # Create the node types
  node_types = [
    NodeType(slug='input', name='Input', description='A simple node with just a source handle.', fields={'label': 'textarea'}), # Built-in node type
    NodeType(slug='output', name='Output', description='A simple node with just a target handle.', fields={'label': 'textarea'}), # Built-in node type
    NodeType(slug='source', name='Source', description='A card node with 4 source handles no targets.', fields={'title': 'text', 'body': 'textarea'}),
    NodeType(slug='card', name='Card', description='Header and body node with 1 source and 1 target handle.', fields={'title': 'text', 'body': 'textarea'}),
    NodeType(slug='default', name='Default', description='A simple node with 1 target and source handle each.', fields={'label': 'textarea'}), # Built-in node type
  ]
  try:
    for node_type in node_types:
      session.add(node_type)
      session.commit()
      new_nodes += 1
  except:
    pass

  # Create the edge types
  edge_types = [
    EdgeType(slug='default', name='Default', description='smooth bezier edge.'), # Built-in edge type
    EdgeType(slug='straight', name='Straight', description='straight line connecting.'), # Built-in edge type
    EdgeType(slug='step', name='Step', description='series of vertical and horizontal lines only.'), # Built-in edge type
    EdgeType(slug='smoothstep', name='Smooth Step', description='the bends in this step edge are rounded.'), # Built-in edge type
  ]

  try:
    for edge_type in edge_types:
      session.add(edge_type)
      session.commit()
      new_edges += 1
  except:
    pass

  # Finished database seeding
  print(f'...database seeded successfully. {new_nodes} new nodes and {new_edges} new edges added.')
  return True

# Run the seed function
if __name__ == '__main__':
  seed()
