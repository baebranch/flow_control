import os
import json
import asyncio
import logging
import aiohttp
from aiohttp import web, ClientSession
from ariadne import graphql_sync, ObjectType, MutationType, gql, load_schema_from_path, snake_case_fallback_resolvers, make_executable_schema

if __name__ == '__main__':
  from ariadne import explorer

from server.resolvers import *


# Aiohttp webserver setup
routes = web.RouteTableDef()
if __name__ == '__main__':
  explorer_html = explorer.ExplorerGraphiQL().html(None)

HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
}

# GraphQL setup
query = ObjectType("Query")
mutation = MutationType()

# Queries
# Status queries
query.set_field("getStatus", getStatus)

# Workspace queries
query.set_field("getWorkspace", getWorkspace)
query.set_field("getWorkspaces", getWorkspaces)

# Flow queries
query.set_field("getFlow", getFlow)
query.set_field("getFlows", getFlows)
query.set_field("getDefaultFlow", getDefaultFlow)

# Node queries
query.set_field("getNode", getNode)
query.set_field("getNodes", getNodes)

# Edge queries
query.set_field("getEdge", getEdge)
query.set_field("getEdges", getEdges)

# Node Type queries
query.set_field("getNodeType", getNodeType)
query.set_field("getNodeTypes", getNodeTypes)

# Edge Type queries
query.set_field("getEdgeType", getEdgeType)
query.set_field("getEdgeTypes", getEdgeTypes)

# Mutations
# Workspace mutations
mutation.set_field("createWorkspace", createWorkspace)
mutation.set_field("updateWorkspace", updateWorkspace)
mutation.set_field("deleteWorkspace", deleteWorkspace)

# Flow mutations
mutation.set_field("createFlow", createFlow)
mutation.set_field("updateFlow", updateFlow)
mutation.set_field("deleteFlow", deleteFlow)

# Node mutations
mutation.set_field("createNode", createNode)
mutation.set_field("updateNode", updateNode)
mutation.set_field("deleteNode", deleteNode)

# Edge mutations
mutation.set_field("createEdge", createEdge)
mutation.set_field("updateEdge", updateEdge)
mutation.set_field("deleteEdge", deleteEdge)


# Build schema
if os.path.exists('assets'):
  type_defs = gql(load_schema_from_path("gql/"))
else:
  type_defs = gql(load_schema_from_path("server/gql/"))
schema = make_executable_schema(
  type_defs, query, mutation, snake_case_fallback_resolvers
)

# Route declarations
@routes.get('/status')
async def index(request: web.Request):
  return web.Response(text='OK', status=200)

@routes.get('/api')
async def playground(request: web.Request):
  return web.Response(body=explorer_html, content_type='text/html')

@routes.post('/api')
async def graphql_api(request: web.Request) -> web.Response:
  data = await request.json()
  success, result = graphql_sync(
    schema,
    data,
    debug=os.environ.get("DEBUG", True),
  )
  status_code = 200 if success else 400
  return web.json_response(result, status=status_code, headers=HEADERS)

@routes.options("/api")
async def graphql_api_options(_: web.Request) -> web.Response:
  return web.json_response({"message": "Accept all hosts"}, headers=HEADERS)

# Proxy route
# @routes.route("*", "/{tail:.*}")
# async def proxy(request: web.Request) -> web.Response:
#   async with ClientSession() as session:
#     async with session.request(
#       method=request.method,
#       url=f"http://localhost:5173{request.path_qs}",
#       headers={key: value for key, value in request.headers.items()},
#       data=await request.read(),
#     ) as response:
#       return web.Response(
#         body=await response.read(),
#         status=response.status,
#         headers={key: value for key, value in response.headers.items()},
#       )

# Server index.html file
@routes.get('/')
async def index(request: web.Request):
  if os.path.exists('assets'):
    return web.FileResponse('index.html')
  else:
    return web.FileResponse('dist/index.html')

# Web App initialization
app = web.Application()
app.add_routes(routes)

if os.path.exists('assets'):
  print('Using assets static path')
  app.add_routes([web.static('/', './')])
  routes.static('/', './')
else:
  print('Using dist static path')
  app.add_routes([web.static('/', 'dist')])
  routes.static('/', 'dist')

def run_app():
  logging.basicConfig(level=logging.DEBUG)
  loop = asyncio.new_event_loop()
  loop.set_debug(enabled=True) 
  web.run_app(app, host='flow.localhost', port=1212, shutdown_timeout=1)

# Run the app
print(__name__)
print(os.getcwd())
print("Asset path: ", os.path.exists('assets'))
if __name__ == '__main__':
  logging.basicConfig(level=logging.DEBUG)
  asyncio.get_event_loop().set_debug(enabled=True) 
  web.run_app(app, host='localhost', port=1212, shutdown_timeout=1)
