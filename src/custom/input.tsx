import "./custom.css";
import { memo } from "react";
import { Handle, Position, NodeResizer } from 'reactflow';


function Input({ data, selected }: { data: any, selected: any }) {
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
        <Handle type="source" position={Position.Bottom} id="a" />
        <Handle type="target" position={Position.Bottom} id="b" />
        <Handle type="source" position={Position.Top} id="c" />
        <Handle type="target" position={Position.Top} id="d" />
      </div>
    </>
  );
}

export default memo(Input);
