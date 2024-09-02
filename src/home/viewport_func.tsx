import { useCallback } from 'react';
import { Viewport, useOnViewportChange } from 'reactflow';
 
export function ViewportChangeLogger(setViewPos: any) {
  useOnViewportChange({
    onStart: (viewport: Viewport) => {
    },

    onChange: (viewport: Viewport) => {
      // console.log('change', viewport);
      console.log(window.innerWidth, window.innerHeight);
    },
    
    onEnd: (viewport: Viewport) => {
    },
  });
 
  return null;
}