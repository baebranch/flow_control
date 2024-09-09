import { Client, gql } from '../api';
import { Viewport, useOnViewportChange } from 'reactflow';
 
export function ViewportChangeLogger(activeWorkspace: any, setActiveWorkspace: any, flow: any) {

  function updateFlowPosition(viewport: Viewport, activeFlow: any) {

    let mutation = gql`mutation {
      updateFlow(id: ${parseInt(activeFlow.id)}, position: "${encodeURIComponent(JSON.stringify(viewport))}") {
        success
        message
        errors
        flow {
          id
          position
        }
      }
    }`;
    
    Client(mutation)
    
    return null;
  };
  
  useOnViewportChange({
    // onStart: (viewport: Viewport) => {
    // },
    
    // onChange: (viewport: Viewport) => {
    // },
    
    onEnd: (viewport: Viewport) => {
      console.log("Viewport changed...");
      // Update the flow position in the state and server
      updateFlowPosition(viewport, flow.activeFlow);

      // Update the flow position in the workspace if the default flow is active
      if (activeWorkspace.default.id === flow.activeFlow.id) {
        console.log("Updating workspace default flow position...");
        activeWorkspace.default.position = viewport;
        setActiveWorkspace(activeWorkspace);
        console.log("Active workspace: ", activeWorkspace);
      }
    },
  });

  return null;
}