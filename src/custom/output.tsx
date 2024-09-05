import "./custom.css";
import { memo } from "react";
import { Handle, Position, NodeResizer } from 'reactflow';


function Output({ data, selected }: { data: any, selected: any }) {
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
      </div>
    </>
  );
}

export default memo(Output);
