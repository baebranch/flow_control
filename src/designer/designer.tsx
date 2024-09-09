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
import "bootstrap-icons/font/bootstrap-icons.css";
import { useState, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, ButtonGroup, ButtonToolbar, Breadcrumb } from "react-bootstrap";

import "./designer.css";
import NewModal from "./new_modal";
import EditNode from "./edit_modal";
import Input from "../custom/input";
import { Client, gql } from '../api';
import CardNode from "../custom/card";
import Source from "../custom/source";
import Output from "../custom/output";
import Default from "../custom/default";
import SubFlowNode from "../custom/subflow";
import { ViewportChangeLogger } from "../home/viewport_func";

import type { EdgeTypes } from "reactflow";

// 

// Initial nodes and edges
let initialNodes: any[] = [];
let initialEdges: any[] = [];

const nodeTypes: {} = {
  // Custom node types here!
  source: Source, card: CardNode, output: Output, input: Input, default: Default, subflow: SubFlowNode
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

  Client(mutation)
}
  
function findNodeById(id: any, nodes: any) {
  for (let node of nodes) {
    if (node.id === id) {
      return node;
    }
  }
} 


export default function Designer({ activeWorkspace, setActiveWorkspace, flow }: { activeWorkspace: any, setActiveWorkspace: any, flow: any }) {
  // window.history.replaceState({}, '')

  const urlParams = useParams();
  const navigate = useNavigate();
  const [loaded , setLoaded] = useState(false);
  const [nodes, setNodes] = useNodesState(initialNodes);
  const [edges, setEdges] = useEdgesState(initialEdges);
  const [foundNode, setFoundNode] = useState<any>(null);
  const { deleteElements, setViewport } = useReactFlow();
  const [showNewModal, setShowNewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedNode, setSelectedNode] = useState<any>(null);

  function pushEdgeConnection(params: any) {
    let edge_data = JSON.stringify(params);
    let mutation = gql`mutation {
      createEdge(edge: "${encodeURIComponent(edge_data)}", flow_id: ${parseInt(flow.activeFlow.id)}, workspace_id: ${parseInt(activeWorkspace.id)}, edge_type_id: 1) {
        success
        message
        errors
        edge {
          eid
        }
      }
    }`;

    Client(mutation)
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

    Client(mutation)
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

    Client(mutation)
  };

  function getFlows(slugs: any) {
    let query = gql`{
      getFlows(slugs: ${JSON.stringify(slugs)}) {
        success
        message
        errors
        flows {
          id
          name
          slug
          position
          description
          workspace_id
          created_at
          updated_at
        }
      }
    }`;

    Client(query).then((data: any) => {
      if (data.getFlows.flows[data.getFlows.flows.length - 1].id !== flow?.activeFlow?.id) {
        flow.setFlows(data.getFlows.flows)
      }
      flow.setActiveFlow(data.getFlows.flows[data.getFlows.flows.length - 1]);
      loadFlowNodesAndEdges(data.getFlows.flows[data.getFlows.flows.length - 1]);
    })
  }

  function loadFlowNodesAndEdges(f: any) {
    console.log("Loading flow: ", f);
    let query = gql`query {
      getNodes(flow_id: ${parseInt(f.id)}) {
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

      getEdges(flow_id: ${parseInt(f.id)}) {
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
      
    // Reset the nodes and edges
    setNodes([]);
    setEdges([]);
    
    Client(query).then((data: any) => {
      // Set nodes
      for (let node of data.getNodes.nodes) {
        node = JSON.parse(node.node);
        
        setNodes((nds: any) => {
          return nds.concat(node);
        });
      }

      // Set edges
      for (let edge of data.getEdges.edges) {

        setEdges((eds: any) => {
          return addEdge(edge.edge, eds);
        });
      }

      // Set the viewport
      if (f.position !== null || f.position !== undefined) {
        console.log("Setting viewport: ", f.position);
        setViewport(f.position);
      }
    })
  }

  // Get current flow for workspace
  useEffect(() => {
    // Setting values in the CSS files for the body affects the entire application
    document.body.style.padding = '0%';
    document.body.style.width = '100%';
    document.body.style.height = '100%';

    urlLoadFlow();

  }, [flow.flows, urlParams, flow.activeFlow]);

  const navigateToHome = () => {
    navigate('/');
  };

  const onNodesChange = useCallback(
    (changes: any) => {
      // Loop through changes and push to the server
      for (let change of changes) {
        if (change.type === 'position' && change.dragging === true) {
          let node_data = JSON.stringify({ position: change.position });
          pushNodeChanges(change, node_data);
        }

        if ((change.type === 'select' || change.type === 'dragging')) {
          setSelectedNode(change.id);
        }
        
        if (change.type === 'remove') {
          removeNode(change.id);
        }

        if (change.type === 'dimensions') {
          let node_data = JSON.stringify({ style: change.dimensions });
          pushNodeChanges(change, node_data);
        }
      }

      // Update the nodes
      setNodes((nds) => {
        return applyNodeChanges(changes, nds);
      });
    },
    [selectedNode],
  );

  // const onNodesDelete = useCallback(
  //   (changes: any) => {
  //   },
  //   [],
  // );

  const onEdgesChange = useCallback(
    (changes: any) => {
      console.log("Edge change: ", changes);
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
    (changes: any) => {
      setEdges((eds: any) => {
        changes.id = uuidv4();
        return addEdge(changes, eds);
      })
      pushEdgeConnection(changes);
    },
    [flow],
  );

  ViewportChangeLogger(activeWorkspace, setActiveWorkspace, flow);

  function urlLoadFlow() {
    let slugs = [urlParams.flowSlug].concat(urlParams['*']?.split('/').filter((slug: any) => slug !== ''));

    if (flow.activeFlow === null || flow.activeFlow === undefined) {
      if (slugs.length === 1) {
        if (activeWorkspace.default?.position !== null) {
          setViewport(activeWorkspace.default.position);
        }
  
        flow.setActiveFlow(activeWorkspace.default);
        flow.setFlows([activeWorkspace.default]);
        loadFlowNodesAndEdges(activeWorkspace.default);
      }
      else {
        getFlows(slugs);
      }
    }
    else if (slugs[slugs.length - 1] !== flow.activeFlow.slug) {
      if (slugs.length === 1) {
        if (activeWorkspace.default?.position !== null) {
          setViewport(activeWorkspace.default.position);
        }
  
        flow.setActiveFlow(activeWorkspace.default);
        flow.setFlows([activeWorkspace.default]);
        loadFlowNodesAndEdges(activeWorkspace.default);
      }
      else {
        getFlows(slugs);
      }
    }
    else {
      if (loaded === false) {
        getFlows(slugs);
        setLoaded(true);
      }
    }

  }

  return (
    <>
      <div className="react-flow-parent">
        <ReactFlow
          edges={edges}
          nodes={nodes}
          // onInit={() => loadFlowNodesAndEdges(flow.activeFlow)}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onConnect={onConnect}
          defaultNodes={initialNodes}
          defaultEdges={initialEdges}
          onNodesChange={onNodesChange}
          // onNodesDelete={onNodesDelete}
          onEdgesDelete={onEdgesDelete}
          onEdgesChange={onEdgesChange}
          defaultViewport={flow.activeFlow?.position ? flow.activeFlow.position : { x: 0, y: 0, zoom: 1 }}
        >
          <Background />

          <EditNode show={showEditModal} setShow={setShowEditModal} setNodes={setNodes} activeFlow={flow.activeFlow} node={foundNode} />
          <NewModal show={showNewModal} setShow={setShowNewModal} setNodes={setNodes} activeFlow={flow.activeFlow} />

          <NodeToolbar nodeId={selectedNode} position={Position.Top} offset={10} align="start">
            <ButtonGroup className="modify" aria-label="modify">
              <Button className="btn" variant="Light" size="sm" onClick={() => {
                  setFoundNode(findNodeById(selectedNode, nodes));                  
                  setShowEditModal(true);
                }}>Edit</Button>
              <Button variant="Light" size="sm" onClick={() => {
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
                <ButtonGroup className="breadcrumbs" aria-label="breadcrumbs">
                  <Button variant="light" onClick={() => navigateToHome()} title="Menu" className="btn">
                    <i className="bi bi-list"></i>
                  </Button>
                  <Button variant="light" onClick={() => navigateToHome()} title="Workspaces" className="btn">
                    <i className="bi bi-grid"></i>
                  </Button>
                </ButtonGroup>

                <ButtonGroup className="home-and-back" aria-label="home-and-back">
                  <Button variant="light" onClick={() => navigate(-1)} title="Back" className="btn">
                    <i className="bi bi-arrow-left"></i>
                  </Button>
                  <Button variant="light" onClick={() => window.location.reload()} title="Refresh" className="btn">
                    <i className="bi bi-arrow-clockwise"></i>
                  </Button>
                </ButtonGroup>

                <ButtonGroup className="breadcrumbs" aria-label="breadcrumbs">
                  <Breadcrumb>
                    { flow.flows.map((f: any, index: number) => {
                      let url = "/workspace/" + activeWorkspace.slug + "/" + (flow.flows.slice(0,index+1).map((f_slug: any) => {return f_slug.slug;}))?.join('/');
                      return (
                        <Breadcrumb.Item key={f.id} href={url} onClick={(e) => {
                          e.preventDefault();
                          flow.setFlows(flow.flows.slice(0,index+1));
                          navigate(url);
                        }} active={index == flow.flows.length ? true : false} >
                          {f.name}
                        </Breadcrumb.Item>
                      );
                    }) }
                  </Breadcrumb>
                </ButtonGroup>
              </ButtonToolbar>
            </div>
          </Panel>

          <Controls>
            <ControlButton onClick={() => setShowNewModal(true)} title="New Node" aria-label="New Node" className="n-node">
              <i className="bi bi-card-heading"></i>
            </ControlButton>
          </Controls>

          <MiniMap pannable={true} nodeColor='#000000' onClick={() => {console.log('Minimap click')}} />
        </ReactFlow>
      </div>
    </>
  );
}