import "./custom.css";
import { memo } from "react";
import { Handle, Position, NodeResizer } from 'reactflow';


function Default({ data, selected }: { data: any, selected: any }) {
  return (
    <>
      <NodeResizer
        color="#ff0071"
        isVisible={selected}
        minWidth={150}
        minHeight={40}
      />
      <div className="source-node">
          {data.label}
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

export default memo(Default);
