import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';

import { Client, gql } from '../api';


export function NewWorkspace({ show, setShow, setActiveWorkspace }: { show: boolean, setShow: any, setActiveWorkspace: any }) {
  const navigate = useNavigate();
  const handleClose = () => setShow(false);

  const onSuccessfulCreate = (data: any) => {
    if (data.createWorkspace.success) {
      setActiveWorkspace(data.createWorkspace.workspace);
      handleClose();
      navigate('/designer');
    } else {
      alert(data.createWorkspace.errors);
    }
  }

  async function createWorkspaceSubmit(name: string, description: string, icon: any) {
    if (icon == null) {
      icon =  '';
    }
    let mutation = gql`mutation {
      createWorkspace(
        name:"${name}",
        description: "${description}",
        ` + (icon ? 'icon: "'+icon+'"' : '') +`
      ) {
        success
        message
        errors
        workspace {
          id
          name
          icon
          description
          created_at
          updated_at
        }
      }
    }`;
    return await Client(mutation);
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    let name = e.target[0].value; // email
    let description = e.target[1].value; // password
    let icon = e.target[2].files[0]; // remember me

    if (icon) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        createWorkspaceSubmit(name, description, base64String).then(onSuccessfulCreate);
      };
      reader.readAsDataURL(icon);
    } else {
      createWorkspaceSubmit(name, description, null).then(onSuccessfulCreate);
    }
  };

  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <Form onSubmit={handleSubmit}>
          <Modal.Header>
            <Modal.Title>Create Workspace</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="newWorkspace.Name">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="My Workspace"
                autoFocus
              />
            </Form.Group>
            <Form.Group
              className="mb-3"
              controlId="newWorkspace.Description"
            >
              <Form.Label>My workspace is for ...</Form.Label>
              <Form.Control as="textarea" rows={3} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="newWorkspace.Icon">
              <Form.Label>Icon path</Form.Label>
              <Form.Control
                type="file"
                placeholder="select an icon"
                autoFocus
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button type="submit" variant="primary">
              Create
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}
