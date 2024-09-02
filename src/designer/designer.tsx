import {
  Panel,
  MiniMap,
  addEdge,
  Controls,
  Viewport,
  ReactFlow,
  Background,
  useViewport,
  useEdgesState,
  useNodesState,
  ControlButton,
  applyEdgeChanges,
  applyNodeChanges,
  ReactFlowProvider,
  useOnViewportChange
} from "reactflow";
import "reactflow/dist/style.css";
import { useNavigate } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useState, useCallback, useEffect } from "react";

import "./designer.css";
import NewModal from "./new_modal";
import { Client, gql } from '../api';
import { CardNode } from "../custom/card";
import { Source } from "../custom/source";
import { Int } from "graphql-request/alpha/schema/scalars";


const initialNodes: any[] = [];
const initialEdges: any[] = [];
const nodeTypes: {} = { source: Source, card: CardNode };

function pushNodeChanges(change: any) {
  let node_data = JSON.stringify({ position: change.position });
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
  })
}

export default function Designer({ activeWorkspace, flows }: { activeWorkspace: any, flows: any }) {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [nodes, setNodes] = useNodesState(initialNodes);
  const [edges, setEdges] = useEdgesState(initialEdges);

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
        initialNodes.push(node);
      }

      for (let edge of data.getEdges.edges) {
        edge = JSON.parse(edge.edge);
        initialEdges.push(edge);
      }

      // Set states
      setNodes(initialNodes);
      setEdges(initialEdges);
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
      setNodes((nds) => {
        // Loop through changes and push to the server
        for (let change of changes) {
          if (change.type === 'position' && change.dragging === true) {
            pushNodeChanges(change);
          }
        }

        return applyNodeChanges(changes, nds);
      });
    },
    [],
  );

  const onEdgesChange = useCallback(
    (changes: any) => {
      setEdges((eds) => applyEdgeChanges(changes, eds));
    },
    [],
  );
  const onConnect = useCallback(
    (params: any) => {
      setEdges((eds) => addEdge(params, eds))
    },
    [],
  );

  return (
    <>
      <ReactFlowProvider>
        <div style={{ height: '100%', width: '100%' }}>
          <NewModal show={show} setShow={setShow} setNodes={setNodes} activeWorkspace={activeWorkspace} activeFlow={flows.activeFlow} />
          <ReactFlow
            nodes={nodes}
            onNodesChange={onNodesChange}
            onConnect={onConnect}
            edges={edges}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background />
            <Panel position="top-left">top-left</Panel>
            <Controls>
              <ControlButton onClick={() => setShow(true)} title="New Node" aria-label="New Node" className="n-node">
                <i className="bi bi-card-heading"></i>
              </ControlButton>
              <ControlButton onClick={() => navigateToHome()} title="Home" aria-label="Home" className="n-home">
                <i className="bi bi-house-door-fill"></i>
              </ControlButton>
            </Controls>
            <MiniMap pannable={true} nodeColor='#483098' />
          </ReactFlow>
        </div>
      </ReactFlowProvider>
    </>
  );
}
