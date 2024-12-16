import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

import { Client, gql } from '../api';


function generateRandomString(length: number) {
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  return Array.from(array, byte => ('0' + byte.toString(16)).slice(-2)).join('');
}

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

function createNode(node: any, activeFlow: any, node_type_id: any) {
  let mutation = gql`mutation {
    createNode(node: "${encodeURIComponent(JSON.stringify(node))}", nid: "${node.id}", flow_id: ${ parseInt(activeFlow.id)}, workspace_id: ${parseInt(activeFlow.workspace_id)}, node_type_id: ${node_type_id + 1}) {
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
  
  Client(mutation)
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


function NewSubNode({ show, setShow, setNodes, activeFlow, node }: { show: boolean, setShow: any, setNodes: any, activeFlow: any, node: any }) {
  let fieldIdx = 0;
  const handleClose = () => setShow(false);
  const [selectValue, setSelectValue] = useState(0);
  const nodes: any = ['input', 'output', 'source', 'card', 'default', 'subflow'];
  const [nodeType, setNodeType] = useState<any>({ 'id': 1, 'fields': { 'label': 'textarea' } });
  
  function handleSubmit(e: any) {
    e.preventDefault();
    
    // Loop over the form fields and add them to the node data field
    const formData: { [key: string]: string } = {};
    for (let i = 2; i < e.target.length-2; i++) {
      const fieldName = e.target[i].name;
      const fieldValue = e.target[i].value;
      formData[fieldName] = fieldValue;
    }

    // If the node type is a subflow, add the flow slug to the node data
    if (selectValue === 5) {
      formData['slug'] = generateRandomString(3);
    }

    const newNode = {
      id: uuidv4(),
      position: {
        x: node.width/2,
        y: node.height/2
      },
      data: formData,
      origin: [0.5, 0.5],
      type: nodes[e.target[2].value],
      extent: "parent",
      parentId: node.id
    };

    // Update the node list
    setNodes((nodes: any) => nodes.concat(newNode))

    console.log('node type', nodes);
    // Send node data to the server
    createNode(newNode, activeFlow, parseInt(e.target[2].value));
    
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
              <Form.Label>Parent Node Id</Form.Label>
              <Form.Control name="parentId" type="text" value={node?.id} disabled/>
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

export default NewSubNode;
