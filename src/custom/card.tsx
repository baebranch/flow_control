import "./custom.css";
import { Handle, Position } from 'reactflow';


export function CardNode({ data }: { data: any; }) {
  return (
    <>
      <div className="card">
        <div className="card-title">
          {data.title}
        </div>
        <div className="card-body">
          {data.body}
        </div>
        <Handle type="target" position={Position.Top} id="a" />
        <Handle type="source" position={Position.Bottom} id="b" />
      </div>
    </>
  );
}
