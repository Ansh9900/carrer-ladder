import React, { useState, useMemo, useRef } from 'react';
import { StudentSkill, Occupation } from '../../types';
import { ZoomIn, ZoomOut, RotateCcw, Filter, Info, BookOpen, CheckCircle2, AlertCircle, Sparkles, X } from 'lucide-react';

interface Node {
  id: string;
  label: string;
  type: 'student' | 'occupation' | 'matched_skill' | 'missing_skill' | 'bridge_skill' | 'resource';
  category?: string;
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  details?: {
    proficiency?: string;
    verified?: boolean;
    weight?: number;
    description?: string;
    actionable?: string;
    url?: string;
  };
}

interface Edge {
  source: string;
  target: string;
  label?: string;
  type: 'required' | 'preferred' | 'bridge' | 'possesses' | 'learns';
}

interface SkillGraphProps {
  studentName: string;
  studentSkills: StudentSkill[];
  targetOccupation: Occupation;
  bridgeConnections: Array<{ currentSkill: string; bridgesTo: string; reason: string }>;
  onSelectSkill?: (skillName: string) => void;
}

export const SkillGraph: React.FC<SkillGraphProps> = ({
  studentName,
  studentSkills,
  targetOccupation,
  bridgeConnections,
  onSelectSkill
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'matched' | 'missing' | 'bridges'>('all');
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const studentSkillsLower = useMemo(() => new Set(studentSkills.map(s => s.skillName.toLowerCase())), [studentSkills]);

  // Construct graph layout nodes and edges deterministically
  const { nodes, edges } = useMemo(() => {
    const nodeList: Node[] = [];
    const edgeList: Edge[] = [];

    const centerX = 450;
    const centerY = 320;

    // Center Node: Target Occupation
    nodeList.push({
      id: 'target-occ',
      label: targetOccupation.title,
      type: 'occupation',
      x: centerX,
      y: centerY,
      details: {
        description: targetOccupation.overview,
        actionable: `Target Career Path · ${targetOccupation.openingsCount} active opportunities`
      }
    });

    // Left Node: Student
    const studentX = centerX - 260;
    const studentY = centerY;
    nodeList.push({
      id: 'node-student',
      label: studentName,
      type: 'student',
      x: studentX,
      y: studentY,
      details: {
        description: `Active Candidate Profile · ${studentSkills.length} extracted/verified skills`
      }
    });

    // Required Skills (arranged in arc around center)
    const required = targetOccupation.requiredSkills || [];
    const preferred = targetOccupation.preferredSkills || [];
    const allReqSkills = [...required, ...preferred];

    const radius = 220;
    const totalCount = allReqSkills.length;

    allReqSkills.forEach((req, idx) => {
      const angle = (idx / totalCount) * 2 * Math.PI - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * (radius * 0.85);

      const isMatched = studentSkillsLower.has(req.skillName.toLowerCase());
      const studentObj = studentSkills.find(s => s.skillName.toLowerCase() === req.skillName.toLowerCase());

      const nodeId = `skill-${req.skillId}`;

      nodeList.push({
        id: nodeId,
        label: req.skillName,
        type: isMatched ? 'matched_skill' : 'missing_skill',
        category: studentObj?.category || 'Technical Skill',
        x,
        y,
        details: {
          proficiency: studentObj?.proficiency || 'Missing / Not Acquired',
          verified: studentObj?.verified || false,
          weight: req.weight,
          description: isMatched
            ? `Verified competency matching ${targetOccupation.title} requirements.`
            : `Crucial missing requirement with importance weight ${Math.round(req.weight * 100)}%.`,
          actionable: isMatched ? 'Ready for technical interview testing' : 'High-priority roadmap item'
        }
      });

      // Edge from occupation to skill
      edgeList.push({
        source: 'target-occ',
        target: nodeId,
        label: req.weight >= 0.9 ? 'Critical' : 'Required',
        type: req.weight >= 0.9 ? 'required' : 'preferred'
      });

      // If student has it, edge from student to skill
      if (isMatched) {
        edgeList.push({
          source: 'node-student',
          target: nodeId,
          label: 'Mastered',
          type: 'possesses'
        });
      }
    });

    // Bridge connections
    bridgeConnections.forEach((bridge, bIdx) => {
      const sourceNode = nodeList.find(n => n.label.toLowerCase() === bridge.currentSkill.toLowerCase());
      const targetNode = nodeList.find(n => n.label.toLowerCase() === bridge.bridgesTo.toLowerCase());
      if (sourceNode && targetNode) {
        edgeList.push({
          source: sourceNode.id,
          target: targetNode.id,
          label: 'Bridge Pathway',
          type: 'bridge'
        });
      }
    });

    return { nodes: nodeList, edges: edgeList };
  }, [studentName, studentSkills, targetOccupation, bridgeConnections, studentSkillsLower]);

  // Filter nodes based on active view mode
  const filteredNodes = useMemo(() => {
    if (filterMode === 'all') return nodes;
    if (filterMode === 'matched') {
      return nodes.filter(n => n.type === 'matched_skill' || n.type === 'student' || n.type === 'occupation');
    }
    if (filterMode === 'missing') {
      return nodes.filter(n => n.type === 'missing_skill' || n.type === 'occupation');
    }
    if (filterMode === 'bridges') {
      const bridgeSkillNames = new Set([
        ...bridgeConnections.map(b => b.currentSkill.toLowerCase()),
        ...bridgeConnections.map(b => b.bridgesTo.toLowerCase())
      ]);
      return nodes.filter(n => bridgeSkillNames.has(n.label.toLowerCase()) || n.type === 'occupation');
    }
    return nodes;
  }, [nodes, filterMode, bridgeConnections]);

  const filteredNodeIds = useMemo(() => new Set(filteredNodes.map(n => n.id)), [filteredNodes]);

  const filteredEdges = useMemo(() => {
    return edges.filter(e => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target));
  }, [edges, filteredNodeIds]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedNode(null);
  };

  return (
    <div className="relative w-full h-[580px] bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden select-none flex flex-col">
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <span>Filter Graph:</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                filterMode === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Nodes ({nodes.length})
            </button>
            <button
              onClick={() => setFilterMode('matched')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                filterMode === 'matched' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Acquired ({nodes.filter(n => n.type === 'matched_skill').length})
            </button>
            <button
              onClick={() => setFilterMode('missing')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                filterMode === 'missing' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Deficit Gaps ({nodes.filter(n => n.type === 'missing_skill').length})
            </button>
            <button
              onClick={() => setFilterMode('bridges')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                filterMode === 'bridges' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Bridge Fast-Tracks ({bridgeConnections.length})
            </button>
          </div>
        </div>

        {/* Zoom & Reset Tools */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setZoom(z => Math.min(z + 0.15, 1.8))}
            className="p-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom(z => Math.max(z - 0.15, 0.6))}
            className="p-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={resetView}
            className="p-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition-colors"
            title="Reset Graph Position"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div
        className="relative flex-1 cursor-grab active:cursor-grabbing overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          className="w-full h-full"
          viewBox="0 0 900 640"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.15s ease-out'
          }}
        >
          <defs>
            {/* Background grid pattern */}
            <pattern id="graph-grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />
            </pattern>
            {/* Arrow markers */}
            <marker id="arrow-required" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#f43f5e" />
            </marker>
            <marker id="arrow-bridge" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b" />
            </marker>
            <marker id="arrow-possesses" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
            </marker>
          </defs>

          {/* Grid background */}
          <rect width="100%" height="100%" fill="url(#graph-grid)" />

          {/* Edges */}
          {filteredEdges.map((edge, idx) => {
            const sourceNode = filteredNodes.find(n => n.id === edge.source);
            const targetNode = filteredNodes.find(n => n.id === edge.target);
            if (!sourceNode || !targetNode) return null;

            // Curve calculation
            const dx = targetNode.x - sourceNode.x;
            const dy = targetNode.y - sourceNode.y;
            const midX = (sourceNode.x + targetNode.x) / 2;
            const midY = (sourceNode.y + targetNode.y) / 2 - (edge.type === 'bridge' ? 35 : 0);

            let strokeColor = 'rgba(148, 163, 184, 0.25)';
            let strokeDash = '';
            let marker = '';

            if (edge.type === 'possesses') {
              strokeColor = 'rgba(16, 185, 129, 0.55)';
            } else if (edge.type === 'required') {
              strokeColor = 'rgba(244, 63, 94, 0.45)';
              marker = 'url(#arrow-required)';
            } else if (edge.type === 'bridge') {
              strokeColor = 'rgba(245, 158, 11, 0.7)';
              strokeDash = '4 3';
              marker = 'url(#arrow-bridge)';
            }

            return (
              <g key={`edge-${idx}`}>
                <path
                  d={`M ${sourceNode.x} ${sourceNode.y} Q ${midX} ${midY} ${targetNode.x} ${targetNode.y}`}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={edge.type === 'bridge' ? 2 : 1.5}
                  strokeDasharray={strokeDash}
                  markerEnd={marker}
                />
                {edge.type === 'bridge' && (
                  <text
                    x={midX}
                    y={midY - 6}
                    fill="#f59e0b"
                    fontSize="9"
                    textAnchor="middle"
                    className="font-mono"
                  >
                    Bridge Pathway
                  </text>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {filteredNodes.map(node => {
            const isSelected = selectedNode?.id === node.id;
            let bgColor = '#1e293b';
            let strokeColor = '#475569';
            let textColor = '#f8fafc';
            let nodeRadius = 24;

            if (node.type === 'occupation') {
              bgColor = '#312e81';
              strokeColor = '#6366f1';
              nodeRadius = 42;
            } else if (node.type === 'student') {
              bgColor = '#0f172a';
              strokeColor = '#38bdf8';
              nodeRadius = 34;
            } else if (node.type === 'matched_skill') {
              bgColor = '#064e3b';
              strokeColor = '#10b981';
              nodeRadius = 26;
            } else if (node.type === 'missing_skill') {
              bgColor = '#881337';
              strokeColor = '#f43f5e';
              nodeRadius = 26;
            }

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedNode(node);
                  if (onSelectSkill && (node.type === 'matched_skill' || node.type === 'missing_skill')) {
                    onSelectSkill(node.label);
                  }
                }}
                className="cursor-pointer transition-transform hover:scale-110"
              >
                {/* Outer halo when selected */}
                {isSelected && (
                  <circle
                    r={nodeRadius + 8}
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth="2.5"
                    strokeDasharray="4 2"
                    className="animate-spin"
                    style={{ animationDuration: '8s' }}
                  />
                )}

                {/* Node Circle */}
                <circle
                  r={nodeRadius}
                  fill={bgColor}
                  stroke={strokeColor}
                  strokeWidth={isSelected ? 3 : 2}
                  className="shadow-lg transition-colors"
                />

                {/* Node Label Text */}
                <text
                  textAnchor="middle"
                  dy={node.type === 'occupation' ? '-4' : nodeRadius + 14}
                  fill={textColor}
                  fontSize={node.type === 'occupation' ? 12 : 11}
                  fontWeight={node.type === 'occupation' || isSelected ? 600 : 500}
                  className="pointer-events-none drop-shadow"
                >
                  {node.label}
                </text>

                {node.type === 'occupation' && (
                  <text
                    textAnchor="middle"
                    dy="12"
                    fill="#a5b4fc"
                    fontSize="9"
                    className="font-mono pointer-events-none"
                  >
                    Target Role
                  </text>
                )}

                {/* Indicator icon inside node */}
                {node.type === 'matched_skill' && (
                  <circle r="4" fill="#34d399" cy="-10" />
                )}
                {node.type === 'missing_skill' && (
                  <circle r="4" fill="#fb7185" cy="-10" />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Node Details Drawer / Popover */}
      {selectedNode && (
        <div className="absolute right-4 bottom-4 w-80 bg-slate-950/95 border border-slate-800 rounded-xl p-4 shadow-2xl backdrop-blur-md z-20 transition-all">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                {selectedNode.type.replace('_', ' ')}
              </span>
              <h4 className="text-sm font-semibold text-white">{selectedNode.label}</h4>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-300 mb-3 leading-relaxed">
            {selectedNode.details?.description}
          </p>

          <div className="space-y-1.5 text-xs border-t border-slate-800/80 pt-2.5">
            {selectedNode.details?.proficiency && (
              <div className="flex justify-between text-slate-400">
                <span>Current Status:</span>
                <span className={`font-medium ${selectedNode.details.proficiency.includes('Missing') ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {selectedNode.details.proficiency}
                </span>
              </div>
            )}
            {selectedNode.details?.verified !== undefined && (
              <div className="flex justify-between text-slate-400">
                <span>Verification:</span>
                <span className="text-slate-200">
                  {selectedNode.details.verified ? 'Verified via Assessment' : 'Self-Reported / In Roadmap'}
                </span>
              </div>
            )}
            {selectedNode.details?.actionable && (
              <div className="mt-2.5 p-2 bg-indigo-950/40 border border-indigo-900/50 rounded-lg text-indigo-200 text-[11px] flex items-start gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                <span>{selectedNode.details.actionable}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Legend */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-950/90 border-t border-slate-800 text-[11px] text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            <span>Acquired Skills</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
            <span>Skill Deficit (Gap)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
            <span>Bridge Fast-Track</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block"></span>
            <span>Target Role Center</span>
          </div>
        </div>
        <div className="text-slate-500">
          Click any node to inspect · Drag canvas to pan
        </div>
      </div>
    </div>
  );
};
