import "./custom.css";
import { Handle, Position } from 'reactflow';


export function Source({ data }: { data: any }) {
  return (
    <>
      <div className="card">
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
