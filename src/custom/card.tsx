import "./custom.css";
import { memo } from "react";
import { Handle, Position, NodeResizer } from 'reactflow';


function CardNode({ data, selected }: { data: any, selected: any }) {
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
        <Handle type="target" position={Position.Top} id="a" />
        <Handle type="source" position={Position.Bottom} id="b" />
        <Handle type="source" position={Position.Top} id="c" />
        <Handle type="target" position={Position.Bottom} id="d" />
      </div>
    </>
  );
}

export default memo(CardNode);
