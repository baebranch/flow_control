import { v4 as uuidv4 } from 'uuid';
import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { useViewport, useReactFlow } from 'reactflow';

import { Client, gql } from '../api';
import { Int } from 'graphql-request/alpha/schema/scalars';
import { field } from 'graphql-request/alpha/schema';


// Get the current node and edge types to render new node forms
let nodeTypes: any = 0;
function getNodeTypes() {
  let query = gql`{
    getNodeTypes {
      success
      message
      errors
      nodeTypes {
        id
        name
        description
        fields
        created_at
        updated_at
      }
    }
  }`;
  Client(query).then((data: any) => {
    nodeTypes = data.getNodeTypes.nodeTypes;
  })
}
getNodeTypes();

// Create node request
function createNode(node: any, workspace: any, activeFlow: any, node_type_id: Int) {
  console.log('workspace:', workspace);
  console.log('activeFlow:', activeFlow);
  let mutation = gql`mutation {
    createNode(node: "${encodeURIComponent(JSON.stringify(node))}", nid: "${node.id}", flow_id: ${ parseInt(activeFlow.id)}, workspace_id: ${parseInt(activeFlow.workspace_id)}, node_type_id: ${node_type_id}) {
      success
      message
      errors
      node {
        nid
        node
        flow_id
        workspace_id
        node_type_id
        created_at
        updated_at
        }
        }
        }`;
        console.log('mutation:', mutation);
  Client(mutation).then((data: any) => {
    console.log(data);
  })
}

export function RenderNodeTypeForm(field: any, value: any) {
  return (
    <Form.Group
      className="mb-3"
      controlId="NewModal.{field}"
      key={field}
      >
      <Form.Label>{field}</Form.Label>
      {value === 'textarea' ? (
        <Form.Control name={field} as={value} rows={3} />
      ) : value === 'text' ? (
        <Form.Control name={field} type={value} />
      ) : value === 'number' ? (
        <Form.Control name={field} type={value} />
      ) : (
        <Form.Control name={field} type='text' />
      )}
    </Form.Group>
  )
};


function NewNode({ show, setShow, setNodes, activeWorkspace, activeFlow }: { show: boolean, setShow: any, setNodes: any, activeWorkspace: any, activeFlow: any }) {
  let fieldIdx = 0;
  const [nodeType, setNodeType] = useState<any>({ 'id': 1, 'fields': { 'label': 'textarea' } });
  const [selectValue, setSelectValue] = useState(0);
  const nodes: any = ['input', 'output', 'source', 'card', 'default'];
  const handleClose = () => setShow(false);
  // const { x, y, zoom } = useViewport();
  const { screenToFlowPosition } = useReactFlow();
  // console.log("nodeType: ", nodeType)
  
  function handleSubmit(e: any) {
    e.preventDefault();
    
    // Loop over the form fields and add them to the node data field
    const formData: { [key: string]: string } = {};
    for (let i = 1; i < e.target.length-2; i++) {
      const fieldName = e.target[i].name;
      const fieldValue = e.target[i].value;
      formData[fieldName] = fieldValue;
    }

    const newNode = {
      id: uuidv4(),
      position: screenToFlowPosition({
        x: window.innerWidth/2,
        y: window.innerHeight/2,
      }),
      data: formData,
      origin: [0.5, 0.5],
      type: nodes[e.target[1].value],
    };  

    // Update the node list
    setNodes((nodes: any) => nodes.concat(newNode))

    console.log('node type', nodes);
    // Send node data to the server
    createNode(newNode, activeWorkspace, activeFlow, nodes.indexOf(e.target[1].value));
    
    // Close the modal
    handleClose();
  };

  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <Form name='NewModal' onSubmit={e => {handleSubmit(e)}}>
          <Modal.Header closeButton>
            <Modal.Title>Create Node</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="NewModal.NodeType">
              <Form.Label>Select Node Type:</Form.Label>
              <Form.Select aria-label="Default select example" title="SelectNodeType" onChange={(e) => { 
                  setNodeType(nodeTypes[e.target.value]);
                  setSelectValue(parseInt(e.target.value));
                }} value={selectValue}>
                {nodeTypes && nodeTypes.map((nType: any) => {
                  fieldIdx++;
                  return (<option key={fieldIdx} value={nType.id-1}>{nType.name}</option>);
                })
                }
              </Form.Select>
            </Form.Group>
            {nodeTypes && Object.keys(nodeType.fields).map((key) => {
              return (RenderNodeTypeForm(key, nodeType.fields[key]));
            })}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button variant="primary" type='submit'>
              Create
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}

export default NewNode;
