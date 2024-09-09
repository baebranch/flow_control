import './app.css';
import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import { ReactFlowProvider } from 'reactflow';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './home/home';
import Designer from './designer/designer';
import useWorkspace from './services/use-workspace';


export default function App() {
  const [flows, setFlows] = useState([]);
  const [activeFlow, setActiveFlow] = useState(null);
  // const [breadCrumb, setBreadCrumb } = useBreadCrumb();
  const { activeWorkspace, setActiveWorkspace } = useWorkspace();

  const flow = {
    'activeFlow': activeFlow,
    'setActiveFlow': setActiveFlow,
    'flows': flows,
    'setFlows': setFlows,
  }

  return (
    <>
      <Router>
        <Routes>
          <Route 
            path="/" 
            element={<Home setActiveWorkspace={setActiveWorkspace} flow={flow} />} 
          />
          <Route 
            path="/workspace/:workspace/:flowSlug/*"
            element={
              <ReactFlowProvider>
                <Designer activeWorkspace={activeWorkspace} setActiveWorkspace={setActiveWorkspace} flow={flow} />
              </ReactFlowProvider>
            } 
          />
        </Routes>
      </Router>
    </>
  );
}
