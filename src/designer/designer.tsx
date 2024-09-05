import {
  Panel,
  MiniMap,
  addEdge,
  Controls,
  Position,
  ReactFlow,
  Background,
  NodeToolbar,
  useReactFlow,
  useEdgesState,
  useNodesState,
  ControlButton,
  applyEdgeChanges,
  applyNodeChanges
} from "reactflow";
import "reactflow/dist/style.css";
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useState, useCallback, useEffect } from "react";

import "./designer.css";
import NewModal from "./new_modal";
import EditNode from "./edit_modal";
import Input from "../custom/input";
import Default from "../custom/default";
import { Client, gql } from '../api';
import CardNode from "../custom/card";
import Source from "../custom/source";
import Output from "../custom/output";
import { Int } from "graphql-request/alpha/schema/scalars";
import { ViewportChangeLogger } from "../home/viewport_func";
import { Button, ButtonGroup, ButtonToolbar } from "react-bootstrap";

import type { EdgeTypes } from "reactflow";



let initialNodes: any[] = [];
let initialEdges: any[] = [];
const nodeTypes: {} = {
  // Custom node types here!
  source: Source, card: CardNode, output: Output, input: Input, default: Default
};
const edgeTypes: {} = {
  // Custom edge types here!
} satisfies EdgeTypes;

function pushNodeChanges(change: any, node_data: any) {
  let mutation = gql`mutation {
    updateNode(nid: "${change.id}", node: "${encodeURIComponent(node_data)}") {
      success
      message
      errors
      node {
        nid
      }
    }
  }`;

  Client(mutation).then((data: any) => {
    // console.log("Node update: ", data);
  })
}
  
function findNodeById(id: any, nodes: any) {
  for (let node of nodes) {
    if (node.id === id) {
      return node;
    }
  }
} 

export default function Designer({ activeWorkspace, flows }: { activeWorkspace: any, flows: any }) {
  const navigate = useNavigate();
  const { deleteElements } = useReactFlow();
  const [nodes, setNodes] = useNodesState(initialNodes);
  const [edges, setEdges] = useEdgesState(initialEdges);
  const [showNewModal, setShowNewModal] = useState(false);
  const [ foundNode, setFoundNode ] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedNode, setSelectedNode] = useState<any>(null);

  // console.log("Active Workspace: ", activeWorkspace);
  // console.log("Active Flow: ", flows);

  function pushEdgeConnection(params: any) {
    let edge_data = JSON.stringify(params);
    let mutation = gql`mutation {
      createEdge(edge: "${encodeURIComponent(edge_data)}", flow_id: ${parseInt(flows.activeFlow.id)}, workspace_id: ${parseInt(activeWorkspace.id)}, edge_type_id: 1) {
        success
        message
        errors
        edge {
          eid
        }
      }
    }`;

    Client(mutation).then((data: any) => {
      // console.log(data);
    })
  }

  function removeNode(nodeId: any) {
    let mutation = gql`mutation {
      deleteNode(nid: "${nodeId}") {
        success
        message
        errors
        node {
          nid
        }
      }
    }`;

    Client(mutation).then((data: any) => {
      // console.log(data);
    })
  };

  function removeEdge(edgeId: any) {
    let mutation = gql`mutation {
      deleteEdge(eid: "${edgeId}") {
        success
        message
        errors
        edge {
          eid
        }
      }
    }`;

    Client(mutation).then((data: any) => {
      // console.log(data);
    })
  };

  function getFlow(workspace: any, flow_id: Int) {
    let query = gql`{
      getFlow(id: ${flow_id}, workspace_id: ${workspace.id}) {
        success
        message
        errors
        flow {
          id
          name
          description
          workspace_id
          created_at
          updated_at
        }
      }
    }`;

    Client(query).then((data: any) => {
      flows.setActiveFlow(data.getFlow.flow);
      flows.setFlow((f: any[]) => f.concat(data.getFlow.flow));
      loadFlowNodesAndEdges(data.getFlow.flow);
    })
  }

  function loadFlowNodesAndEdges(flow: any) {
    if (nodes.length > 0 || edges.length > 0) {
      return;
    }

    let query = gql`query {
      getNodes(flow_id: ${parseInt(flow.id)}) {
        success
        message
        errors
        nodes {
          nid
          node
          flow_id
          workspace_id
          node_type_id
          created_at
          updated_at
        }
      }

      getEdges(flow_id: ${parseInt(flow.id)}) {
        success
        message
        errors
        edges {
          eid
          edge
          flow_id
          workspace_id
          edge_type_id
          created_at
          updated_at
        }
      }
    }`;

    Client(query).then((data: any) => {
      for (let node of data.getNodes.nodes) {
        node = JSON.parse(node.node);

        setNodes((nds: any) => {
          return nds.concat(node);
        });
      }

      for (let edge of data.getEdges.edges) {

        setEdges((eds: any) => {
          return addEdge(edge.edge, eds);
        });
      }
    })
  }

  // Get current flow for workspace
  useEffect(() => {
    // Setting values in the CSS files for the body affects the entire application
    document.body.style.padding = '0%';
    document.body.style.width = '100%';
    document.body.style.height = '100%';

    // Load the nodes/edges for the active flow
    loadFlowNodesAndEdges(flows.activeFlow);
  }, [document.body.style.height]);

  const navigateToHome = () => {
    navigate('/');
  };

  const onNodesChange = useCallback(
    (changes: any) => {
      // console.log("Node changes: ", changes);
      setNodes((nds) => {
        // Loop through changes and push to the server
        // console.log("Nodes: ", nds);
        for (let change of changes) {
          if (change.type === 'position' && change.dragging === true) {
            let node_data = JSON.stringify({ position: change.position });
            pushNodeChanges(change, node_data);
          }

          if (change.type === 'select' && change.selected === true) {
            setSelectedNode(change.id);
            setFoundNode(findNodeById(change.id, nds));
          }

          if (change.type === 'remove') {
            removeNode(change.id);
          }

          if (change.type === 'dimensions') {
            let node_data = JSON.stringify({ style: change.dimensions });
            pushNodeChanges(change, node_data);
          }
        }

        // console.log(selectedNode);
        return applyNodeChanges(changes, nds);
      });
    },
    [],
  );

  const onNodesDelete = useCallback(
    (changes: any) => {
    },
    [],
  );

  const onEdgesChange = useCallback(
    (changes: any) => {
      // console.log("Edge changes: ", changes);
      setEdges((eds: any) => {
        return applyEdgeChanges(changes, eds);
      });
    },
    [],
  );

  const onEdgesDelete = useCallback(
    (changes: any) => {
      // console.log("Edge delete: ", changes);
      for (let change of changes) {
        removeEdge(change.id);
      }
    },
    [],
  );

  const onConnect = useCallback(
    (params: any) => {
      // console.log("Nodes and Edges: ", nodes, edges),
      // console.log("Edge params: ", params);
      setEdges((eds: any) => {
        params.id = uuidv4();
        pushEdgeConnection(params);
        return addEdge(params, eds);
      })
    },
    [],
  );

  ViewportChangeLogger(flows);

  return (
    <>
      <div style={{ height: '100%', width: '100%' }}>
        <ReactFlow
          defaultNodes={initialNodes}
          defaultEdges={initialEdges}
          nodes={nodes}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          edges={edges}
          edgeTypes={edgeTypes}
          onConnect={onConnect}
          onNodesDelete={onNodesDelete}
          onEdgesDelete={onEdgesDelete}
          onEdgesChange={onEdgesChange}
          defaultViewport={flows.activeFlow.position}
        >
          <Background />

          <NewModal show={showNewModal} setShow={setShowNewModal} setNodes={setNodes} activeWorkspace={activeWorkspace} activeFlow={flows.activeFlow} />
          <EditNode show={showEditModal} setShow={setShowEditModal} setNodes={setNodes} activeFlow={flows.activeFlow} node={foundNode} />

          <NodeToolbar nodeId={selectedNode} position={Position.Top} offset={10} align="start">
            <ButtonGroup className="modify" aria-label="modify">
              <Button className="btn" variant="Light" size="sm" onClick={(e) => {
                  console.log("Edit node: ", selectedNode);
                  setShowEditModal(true);
                }}>Edit</Button>
              <Button variant="Light" size="sm" onClick={(e) => {
                  deleteElements({ nodes: [{ id: selectedNode }] });
                }
              }>Delete</Button>
            </ButtonGroup>
          </NodeToolbar>

          <Panel position="top-right">
            <div>

            </div>
          </Panel>

          <Panel position="top-left">
            <div>
              <ButtonToolbar aria-label="breadcrumb-toolbar">
                <ButtonGroup className="home-and-back" aria-label="home-and-back">
                  <Button variant="light" onClick={() => navigateToHome()} title="Back" className="btn">
                    <i className="bi bi-arrow-left"></i>
                  </Button>
                  <Button variant="light" onClick={() => navigateToHome()} title="Refresh" className="btn">
                    <i className="bi bi-arrow-clockwise"></i>
                  </Button>
                </ButtonGroup>

                <ButtonGroup className="breadcrumbs" aria-label="breadcrumbs">
                  <Button variant="light" onClick={() => navigateToHome()} title="Menu" className="btn">
                    <i className="bi bi-list"></i>
                  </Button>
                  <Button variant="light" onClick={() => navigateToHome()} title="Workspaces" className="btn">
                    <i className="bi bi-grid"></i>
                  </Button>
                </ButtonGroup>

                <ButtonGroup className="breadcrumbs" aria-label="breadcrumbs">
                  <Button variant="light" onClick={() => navigateToHome()} title="Home" className="btn">
                    <i className="bi bi-house"></i>
                  </Button>
                  <Button variant="light" onClick={() => navigateToHome()} className="btn crumb">
                    <i className="bi bi-house-door-fill"></i>
                  </Button>
                </ButtonGroup>
              </ButtonToolbar>
            </div>
          </Panel>

          <Controls>
            <ControlButton onClick={() => setShowNewModal(true)} title="New Node" aria-label="New Node" className="n-node">
              <i className="bi bi-card-heading"></i>
            </ControlButton>
          </Controls>

          <MiniMap pannable={true} nodeColor='#000000' />
        </ReactFlow>
      </div>
    </>
  );
}