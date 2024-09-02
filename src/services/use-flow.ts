import { useState } from 'react';

export function useFlow() {
  const getFlows = () => {
    const flowsString = localStorage.getItem('flows');

    if (flowsString === null || flowsString === undefined) {
      return [];
    }
    let flowsObj = JSON.parse(flowsString);
    return flowsObj;
  };

  const [flow, setFlow] = useState(getFlows());

  function saveFlows(flowsObj: any) {
    if (flowsObj === null) {
      localStorage.removeItem('flows');
      setFlow([]);
      return;
    }

    let flowsString = JSON.stringify(flowsObj);
    localStorage.setItem('flows', flowsString);
    setFlow(flowsObj);
  };

  return {
    setFlow: saveFlows,
    flow
  }
}

export function useActiveFlow() {
  const getActiveFlow = () => {
    const activeFlowString = localStorage.getItem('active_flow');

    if (activeFlowString === null || activeFlowString === undefined) {
      return null;
    }
    let activeFlowObj = JSON.parse(activeFlowString);
    return activeFlowObj;
  };

  const [activeFlow, setActiveFlow] = useState(getActiveFlow());

  function saveActiveFlow(activeFlowObj: any) {
    if (activeFlowObj === null || activeFlowObj === undefined) {
      localStorage.removeItem('active_flow');
      setActiveFlow(null);
      return;
    }

    let activeFlowString = JSON.stringify(activeFlowObj);
    localStorage.setItem('active_flow', activeFlowString);
    setActiveFlow(activeFlowObj);
  };

  return {
    setActiveFlow: saveActiveFlow,
    activeFlow
  }
}
