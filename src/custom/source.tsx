import "./custom.css";
import { memo } from "react";
import { Handle, Position, NodeResizer } from 'reactflow';


function Source({ data, selected }: { data: any, selected: any }) {

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
        <Handle type="source" position={Position.Top} id="a" />
        <Handle type="source" position={Position.Right} id="b" />
        <Handle type="source" position={Position.Bottom} id="c" />
        <Handle type="source" position={Position.Left} id="d" />
      </div>
    </>
  );
}

export default memo(Source);
