import { useState } from 'react';

export default function useWorkspace() {
  const getWorkspace = () => {
    const workspaceString = localStorage.getItem('workspace');

    if (workspaceString === null || workspaceString === undefined) {
      return null;
    }
    let workspaceObj = JSON.parse(workspaceString);
    return workspaceObj;
  };

  const [activeWorkspace, setActiveWorkspace] = useState(getWorkspace());

  function saveWorkspace(workspaceObj: any) {
    if (workspaceObj === null || workspaceObj === undefined) {
      localStorage.removeItem('workspace');
      setActiveWorkspace(null);
      return;
    }

    let workspaceString = JSON.stringify(workspaceObj);
    localStorage.setItem('workspace', workspaceString);
    setActiveWorkspace(workspaceObj);
  };

  return {
    setActiveWorkspace: saveWorkspace,
    activeWorkspace
  }
}