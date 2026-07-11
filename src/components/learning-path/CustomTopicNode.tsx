import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Lock, CheckCircle, Brain } from 'lucide-react';

type CustomNodeData = {
  label: string;
  mastery_percentage: number;
  is_unlocked: boolean;
};

const CustomTopicNode: React.FC<NodeProps<CustomNodeData>> = ({ data }) => {
  const { label, mastery_percentage, is_unlocked } = data;
  
  // Set mastery threshold to 70% matching the updated adaptive assessment engine rules
  const isMastered = mastery_percentage >= 70;

  // Base container styles
  let containerClasses = 'w-[260px] h-[110px] shadow-sm rounded-xl border-2 p-4 flex flex-col justify-between transition-all duration-300 ';
  let iconComponent = null;

  if (!is_unlocked) {
    // 1. Locked State (Gray)
    containerClasses += 'bg-slate-50 border-slate-200 opacity-70 cursor-not-allowed';
    iconComponent = <Lock className="w-5 h-5 text-slate-400" />;
  } else if (isMastered) {
    // 2. Mastered State (Green)
    containerClasses += 'bg-emerald-50 border-emerald-500 shadow-emerald-100 cursor-pointer hover:shadow-md hover:scale-[1.02]';
    iconComponent = <CheckCircle className="w-5 h-5 text-emerald-600" />;
  } else {
    // 3. Unlocked & In Progress State (Blue/Primary)
    containerClasses += 'bg-white border-indigo-500 shadow-indigo-100 ring-4 ring-indigo-500/10 cursor-pointer hover:shadow-md hover:scale-[1.02]';
    iconComponent = <Brain className="w-5 h-5 text-indigo-500" />;
  }

  return (
    <div className={containerClasses}>
      {/* Invisible Input handle for incoming edges */}
      <Handle type="target" position={Position.Top} className="w-2 h-2 bg-slate-300 border-none opacity-0" />
      
      {/* Header Row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
           {iconComponent}
           <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {isMastered ? 'Mastered' : !is_unlocked ? 'Locked' : 'In Progress'}
           </span>
        </div>
        
        {/* Only show mastery % if unlocked but not fully mastered yet */}
        {is_unlocked && !isMastered && (
           <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full border border-indigo-200">
             {mastery_percentage}%
           </span>
        )}
      </div>
      
      {/* Title */}
      <div className={`text-sm font-semibold ${!is_unlocked ? 'text-slate-500' : 'text-slate-900'} leading-snug line-clamp-2`}>
        {label}
      </div>

      {/* Progress Bar (Only visible if unlocked) */}
      {is_unlocked && (
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mt-1">
          <div 
            className={`h-1.5 rounded-full ${isMastered ? 'bg-emerald-500' : 'bg-indigo-500'} transition-all duration-1000 ease-out`} 
            style={{ width: `${mastery_percentage}%` }}
          />
        </div>
      )}

      {/* Invisible Output handle for outgoing edges */}
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-slate-300 border-none opacity-0" />
    </div>
  );
};

export default CustomTopicNode;
