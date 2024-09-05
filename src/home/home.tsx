import 'bootstrap/dist/css/bootstrap.css';
// Put any other imports below so that CSS from your
// components takes precedence over default styles.
import './home.css';
import { Client, gql } from '../api';
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { NewWorkspace } from './workspace_modal'
import "bootstrap-icons/font/bootstrap-icons.css";
import { useState, useCallback, useEffect } from "react";
import { Container, Row, Col, Card, Button } from 'react-bootstrap';


const formatter = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });

const getWorkspacesQuery = gql`{
  getWorkspaces {
    success
    message
    errors
    workspaces {
      id
      name
      icon
      description
      created_at
      updated_at
    }
  }
}`;


export default function Home({setActiveWorkspace, flows}: {setActiveWorkspace: any, flows: any}) {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<any>(null);
  const [createWorkspaceModal, showCreateWorkspaceModal] = useState(false);

  function getDefaultFlow(workspace: any) {
    let query = gql`{
      getDefaultFlow(workspace_id: ${parseInt(workspace.id)}) {
        success
        message
        errors
        flow {
          id
          name
          description
          position
          workspace_id
          created_at
          updated_at
        }
      }
    }`;
  
    Client(query).then((data: any) => {
      flows.setActiveFlow(data.getDefaultFlow.flow);
      flows.setFlow([data.getDefaultFlow.flow]);
      navigate('/designer');
    })
  }

  const fetchWorkspaces = useCallback(async () => {
    try {
      await Client(getWorkspacesQuery).then((data: any) => {
        setWorkspaces(data.getWorkspaces.workspaces);
      })
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, []);

  useEffect(() => {
    fetchWorkspaces();

    // Setting the body styles in the CSS affects the entire app
    document.body.style.padding = '5%';
    document.body.style.height = 'auto';
  }, [fetchWorkspaces]);

  return (
    <div className="drop-box">
      <NewWorkspace 
        show={createWorkspaceModal} 
        setShow={showCreateWorkspaceModal}
        setActiveWorkspace={setActiveWorkspace}
      />
      <Container>
        <Row className='head-row'>
          <Col>
            <h1>Workspaces</h1>
          </Col>
          <Col>
          <Button variant='primary' onClick={() => {showCreateWorkspaceModal(true)}} className='float-end create-btn' ><i className='bi bi-plus-lg' > </i>Create</Button>
          </Col>          
        </Row>
        <Row className='text-center mx-auto'>
          <Col>
            {workspaces && workspaces.map((workspace: any) => (
              <Link to="/designer" key={workspace.id}>
                <Card onClick={(e) => {
                    e.preventDefault();
                    setActiveWorkspace(workspace);
                    getDefaultFlow(workspace);
                  }}>
                  <Card.Header>
                    {(workspace.icon) ? <Card.Img className='align-middle' src={workspace.icon} width="350" height="350"/> : <i className='bi bi-image-alt'></i>}
                  </Card.Header>
                  <Card.Body>
                    <Card.Title>{workspace.name}</Card.Title>
                    <Card.Text>{workspace.description}</Card.Text>
                  </Card.Body>
                  <Card.Footer>
                    <p>
                    Updated: {workspace.updated_at}
                    </p>
                    <p>
                    Created: {workspace.created_at}
                    </p>
                  </Card.Footer>
                </Card>
              </Link>
            ))}
          </Col>
        </Row>
      </Container>
    </div>
  );
}
