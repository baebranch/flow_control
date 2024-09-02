import 'bootstrap/dist/css/bootstrap.css';
import './app.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './home/home';
import Designer from './designer/designer';
import useWorkspace from './services/use-workspace';
import { useFlow, useActiveFlow } from './services/use-flow';


export default function App() {
  const { flow, setFlow } = useFlow();
  const { activeFlow, setActiveFlow } = useActiveFlow();
  const { activeWorkspace, setActiveWorkspace } = useWorkspace();

  const flows = {
    'activeFlow': activeFlow,
    'setActiveFlow': setActiveFlow,
    'flow': flow,
    'setFlow': setFlow
  }

  return (
    <>
      <Router>
        <Routes>
          <Route 
            path="/" 
            element={<Home setActiveWorkspace={setActiveWorkspace} flows={flows} />} 
          />
          <Route 
            path="/designer"
            element={<Designer activeWorkspace={activeWorkspace} flows={flows} />} 
          />
        </Routes>
      </Router>
    </>
  );
}
