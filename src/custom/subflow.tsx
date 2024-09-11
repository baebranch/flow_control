import "./custom.css";
import { memo } from "react";
import { Button } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";

import { Handle, Position, NodeResizer } from 'reactflow';


function SubFlowNode({ data, selected }: { data: any, selected: any }) {
  const navigate = useNavigate();
  const { state } = useLocation();


  const navigateToFlow = () => {
    navigate(window.location.pathname + '/' + data.slug, { state });
  };

  return (
    <>
      <NodeResizer
        color="#ff0071"
        isVisible={selected}
        minWidth={100}
        minHeight={100}
      />
      <div className="source-node">
        <div className="card-title">
          {data.title}
        </div>
        <div className="card-body">
          {data.body}
        </div>
        <div className="card-footer">
          <Button variant="secondary" size="sm" onClick={() => {
              navigateToFlow();
            }}>
            {data.flow}
          </Button>
        </div>
        <Handle type="target" position={Position.Top} id="a" />
        <Handle type="source" position={Position.Bottom} id="b" />
        <Handle type="source" position={Position.Top} id="c" />
        <Handle type="target" position={Position.Bottom} id="d" />
        <Handle type="target" position={Position.Left} id="e" />
        <Handle type="source" position={Position.Right} id="f" />
        <Handle type="source" position={Position.Left} id="g" />
        <Handle type="target" position={Position.Right} id="h" />
      </div>
    </>
  );
}

export default memo(SubFlowNode);
