import './default.css';
import "bootstrap-icons/font/bootstrap-icons.css";
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath, useReactFlow } from 'reactflow';


export default function DefaultEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd }: EdgeProps) {
  const { setEdges } = useReactFlow();
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onEdgeClick = () => {
    console.log('edge clicked:', id);
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
  };

  return (
    <>

      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
    <span onClick={() => console.log('clicked')}>
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            // everything inside EdgeLabelRenderer has no pointer events by default
            // if you have an interactive element, set pointer-events: all
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
          >
          <button className="edgebutton" onClick={onEdgeClick} >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
      </EdgeLabelRenderer>
            </span>
    </>
  );
}
