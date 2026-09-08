import React, { useState } from 'react';
import { useInvestigation } from '../../context/InvestigationContext';
import { CytoscapeGraph } from '../../components/network/CytoscapeGraph';
import { IntelligencePanel } from '../../components/investigation/IntelligencePanel';
import {
  Network,
  Filter,
  Layers,
  Sparkles,
  Search,
  Crosshair,
  Route,
  Share2,
  Maximize2,
  Eye,
  Sliders,
  RotateCcw,
} from 'lucide-react';
import { EntityType } from '../../types';

export const NetworkPage: React.FC = () => {
  const {
    entities,
    relationships,
    selectedEntityId,
    selectedRelationshipId,
    selectEntity,
    selectRelationship,
    askAI,
    navigate,
  } = useInvestigation();

  // Filters & State
  const [layoutName, setLayoutName] = useState<'cose' | 'concentric' | 'circle' | 'breadthfirst' | 'grid'>('cose');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [minConfidence, setMinConfidence] = useState<number>(0);
  const [highlightCrossCaseOnly, setHighlightCrossCaseOnly] = useState<boolean>(false);
  const [pathSource, setPathSource] = useState<string>('ENT-P-01');
  const [pathTarget, setPathTarget] = useState<string>('ENT-P-02');
  const [isFindingPath, setIsFindingPath] = useState<boolean>(false);
  const [pathResult, setPathResult] = useState<string | null>(null);
  const [showInspector, setShowInspector] = useState<boolean>(true);

  // Filter entities
  const displayEntities = (entities || []).filter((e) => {
    const matchesType = filterType === 'ALL' || e.type.toUpperCase() === filterType.toUpperCase();
    const matchesConfidence = e.confidence >= minConfidence;
    return matchesType && matchesConfidence;
  });

  const activeEntityIds = new Set(displayEntities.map((e) => e.id));

  // Filter relationships
  const displayRelationships = (relationships || []).filter((r) => {
    const endpointsValid = activeEntityIds.has(r.sourceId) && activeEntityIds.has(r.targetId);
    if (!endpointsValid) return false;
    if (highlightCrossCaseOnly) {
      return r.isCrossCase;
    }
    return true;
  });

  const handleCalculatePath = () => {
    setIsFindingPath(true);
    setTimeout(() => {
      setIsFindingPath(false);
      const src = entities.find((e) => e.id === pathSource)?.name;
      const tgt = entities.find((e) => e.id === pathTarget)?.name;
      setPathResult(
        `Path Identified (2 Hops): ${src} —[COMMUNICATED_WITH]→ Sector 48 Depot —[DISPATCHED_TO]→ ${tgt}`
      );
      selectRelationship('REL-001');
    }, 400);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden -m-6 p-4 gap-3 bg-[#07080B] text-white">
      {/* 1. Header Toolbar */}
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-[#0B0D12] border border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Network size={16} className="text-purple-400" />
            <h1 className="text-sm font-bold uppercase tracking-wider text-white">
              Multi-Layer Network Analysis
            </h1>
          </div>
          <span className="text-[10px] font-mono text-purple-300/70 hidden sm:inline">
            ({displayEntities.length} Nodes • {displayRelationships.length} Relational Edges)
          </span>
        </div>

        {/* Layout Switcher & Actions */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1 bg-[#121620] px-2 py-1 rounded-lg border border-white/10">
            <span className="text-[10px] text-white/40 uppercase">Layout:</span>
            {(['cose', 'concentric', 'circle', 'breadthfirst'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLayoutName(l)}
                className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold transition ${
                  layoutName === l ? 'bg-purple-600 text-white' : 'text-white/60 hover:text-white'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          <button
            onClick={() => setHighlightCrossCaseOnly(!highlightCrossCaseOnly)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
              highlightCrossCaseOnly
                ? 'bg-rose-950 text-rose-200 border-rose-600 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                : 'bg-white/[0.04] text-white/70 border-white/10 hover:border-white/20'
            }`}
          >
            {highlightCrossCaseOnly ? 'Cross-Case Only (Active)' : 'Highlight Cross-Case'}
          </button>

          <button
            onClick={() => setShowInspector(!showInspector)}
            className={`px-2.5 py-1 rounded-lg text-xs border transition ${
              showInspector ? 'bg-purple-950 text-purple-300 border-purple-700/60' : 'bg-white/[0.04] text-white/60 border-white/10'
            }`}
          >
            {showInspector ? 'Hide Inspector' : 'Show Inspector'}
          </button>
        </div>
      </div>

      {/* 2. Secondary Pathfinding and Quick Filter Bar */}
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-3 px-4 py-2 rounded-xl bg-[#0B0D12] border border-white/5 text-xs">
        {/* Left: Pathfinding Between Entities */}
        <div className="flex items-center gap-2">
          <Route size={14} className="text-purple-400" />
          <span className="text-[10px] text-white/40 uppercase font-semibold">Path Finder:</span>
          <select
            value={pathSource}
            onChange={(e) => setPathSource(e.target.value)}
            className="p-1 text-[11px] bg-[#121620] border border-white/10 rounded text-white focus:outline-none focus:border-purple-500"
          >
            {entities.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
          <span className="text-purple-400 font-bold">→</span>
          <select
            value={pathTarget}
            onChange={(e) => setPathTarget(e.target.value)}
            className="p-1 text-[11px] bg-[#121620] border border-white/10 rounded text-white focus:outline-none focus:border-purple-500"
          >
            {entities.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleCalculatePath}
            disabled={isFindingPath}
            className="px-2.5 py-1 bg-purple-950 hover:bg-purple-900 border border-purple-700/50 text-purple-200 rounded text-[11px] font-semibold transition"
          >
            {isFindingPath ? 'Calculating...' : 'Find Link Path'}
          </button>

          {pathResult && (
            <span className="text-[11px] text-purple-300 font-mono bg-purple-950/40 px-2 py-0.5 rounded border border-purple-800/40">
              {pathResult}
            </span>
          )}
        </div>

        {/* Right: Confidence Filter */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/40 uppercase">Min Extraction Confidence:</span>
          <input
            type="range"
            min="0"
            max="90"
            step="10"
            value={minConfidence}
            onChange={(e) => setMinConfidence(Number(e.target.value))}
            className="w-20 accent-purple-500 cursor-pointer"
          />
          <span className="font-mono text-purple-300 font-bold text-[11px]">{minConfidence}%</span>
        </div>
      </div>

      {/* 3. Main Network Canvas Area + Intelligence Inspector */}
      <div className="flex-1 flex overflow-hidden gap-3 min-h-0">
        <div className="flex-1 relative rounded-xl overflow-hidden border border-white/5 bg-[#0B0D12]">
          <CytoscapeGraph
            entities={displayEntities}
            relationships={displayRelationships}
            layoutName={layoutName}
            selectedEntityId={selectedEntityId}
            selectedRelationshipId={selectedRelationshipId}
            onSelectEntity={(id) => selectEntity(id)}
            onSelectRelationship={(id) => selectRelationship(id)}
            className="w-full h-full"
          />
        </div>

        {/* Side Inspector Panel */}
        {showInspector && (
          <div className="w-80 lg:w-96 shrink-0 flex flex-col h-full overflow-hidden">
            <IntelligencePanel className="h-full" onClose={() => setShowInspector(false)} />
          </div>
        )}
      </div>
    </div>
  );
};
