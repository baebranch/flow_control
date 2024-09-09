import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

import { Client, gql } from '../api';


function updateNode(node: any, activeFlow: any) {
  let mutation = gql`mutation {
    updateNode(node: "${encodeURIComponent(JSON.stringify(node))}", nid: "${node.id}", flow_id: ${ parseInt(activeFlow.id)}, workspace_id: ${parseInt(activeFlow.workspace_id)}) {
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

export function RenderNodeTypeForm(field: any, value: any) {
  return (
    <Form.Group
      className="mb-3"
      controlId="NewModal.{field}"
      key={field}
      >
      <Form.Label>{field}</Form.Label>
      {field === 'body' || field === 'label' ? (
        <Form.Control name={field} as="textarea" rows={3} defaultValue={value} />
      ) : field === 'text' ? (
        <Form.Control name={field} type="text" defaultValue={value} />
      ) : field === 'number' ? (
        <Form.Control name={field} type="number" defaultValue={value} />
      ) : (
        <Form.Control name={field} type='text' defaultValue={value} />
      )}
    </Form.Group>
  )
};

function EditNode({ show, setShow, setNodes, activeFlow, node }: { show: boolean, setShow: any, setNodes: any, activeFlow: any, node: any }) {
  // console.log('Editing node', node);
  const handleClose = () => setShow(false);
  
  function handleSubmit(e: any) {
    e.preventDefault();
    // console.log('Form data:', e.target);
    
    // Loop over the form fields and add them to the node data field
    const formData: { [key: string]: string } = {};
    for (let i = 1; i < e.target.length-2; i++) {
      const fieldName = e.target[i].name;
      const fieldValue = e.target[i].value;
      formData[fieldName] = fieldValue;
    }
    // console.log('Form data:', formData);

    node.data = Object.assign(node.data, formData);

    // Update the node list
    setNodes((nodes: any) => nodes.concat(node))

    // Send node data to the server
    updateNode(node, activeFlow);
    
    // Close the modal
    handleClose();
  };

  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <Form name='NewModal' onSubmit={e => {handleSubmit(e)}}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Node</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="NewModal.NodeType">
            </Form.Group>
            {node && Object.keys(node.data).map((key: any) => {
              if (key === "") { return null; }
              else { return (RenderNodeTypeForm(key, node.data[key])); }
            })}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button variant="primary" type='submit'>
              Update
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}

export default EditNode;
