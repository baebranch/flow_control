import { useCallback } from 'react';
import { Client, gql } from '../api';
import { Viewport, useOnViewportChange } from 'reactflow';
 
export function ViewportChangeLogger(flows: any) {

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
    Client(mutation).then((data: any) => {
    })
    
    return null;
  };
  
  useOnViewportChange({
    onStart: (viewport: Viewport) => {
    },
    
    onChange: (viewport: Viewport) => {
      // console.log('change', viewport);
    },
    
    onEnd: (viewport: Viewport) => {
      // console.log('End', viewport);
      // Update the flow position in the state and server
      updateFlowPosition(viewport, flows.activeFlow);
      let activeFlow = flows.activeFlow;
      activeFlow.position = viewport;
      flows.setActiveFlow(activeFlow);
    },
  });

  return null;
}