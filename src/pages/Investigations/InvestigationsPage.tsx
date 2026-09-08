import React, { useState } from 'react';
import { useInvestigation } from '../../context/InvestigationContext';
import {
  FolderKanban,
  Search,
  PlusCircle,
  Filter,
  ArrowRight,
  Shield,
  Layers,
  Network,
  Users,
  FileCheck2,
  Tag,
} from 'lucide-react';

export const InvestigationsPage: React.FC = () => {
  const { cases, openInvestigationWorkspace, setIsNewCaseModalOpen } = useInvestigation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');

  const filteredCases = (cases || []).filter((c) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (c.title || '').toLowerCase().includes(term) ||
      (c.id || '').toLowerCase().includes(term) ||
      (c.targetFocus || '').toLowerCase().includes(term);
    const matchesPriority = filterPriority === 'ALL' || c.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-purple-400 uppercase">
            <FolderKanban size={13} />
            <span>CASE DIRECTORY & CONSTELLATION MANAGEMENT</span>
          </div>
          <h1 className="text-xl font-bold tracking-wider text-white uppercase mt-1">
            Active Investigations
          </h1>
          <p className="text-xs text-white/50 mt-0.5">
            Select an investigation object to enter its multi-layer workspace (Network, Entities, Evidence, Timeline).
          </p>
        </div>

        <button
          onClick={() => setIsNewCaseModalOpen(true)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold tracking-wider uppercase flex items-center gap-2 transition self-start shadow-[0_0_20px_rgba(139,92,246,0.3)] cursor-pointer"
        >
          <PlusCircle size={15} />
          <span>+ New Investigation</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by case ID, title, or target focus..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#0E1118] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto text-xs">
          <span className="text-white/40 text-[11px] mr-1">Priority:</span>
          {['ALL', 'HIGH_PRIORITY', 'ELEVATED', 'ROUTINE'].map((p) => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`px-2.5 py-1 rounded-lg text-xs transition ${
                filterPriority === p
                  ? 'bg-purple-900/60 text-purple-200 border border-purple-700/50'
                  : 'bg-white/[0.03] text-white/60 hover:text-white border border-white/5'
              }`}
            >
              {p.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Investigation Constellation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
        {filteredCases.map((c) => (
          <div
            key={c.id}
            onClick={() => openInvestigationWorkspace(c.id)}
            className="group relative p-5 rounded-2xl bg-[#0B0D12] hover:bg-[#10141E] border border-white/10 hover:border-purple-500/50 transition-all duration-300 cursor-pointer flex flex-col justify-between shadow-xl"
          >
            {/* Top Status and Header */}
            <div>
              <div className="flex items-center justify-between text-xs mb-3 font-mono">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 font-bold border border-purple-800/50">
                    {c.id}
                  </span>
                  <span className="text-white/40 text-[11px]">{c.referenceId}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {c.crossCaseCount > 0 && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-950/60 text-rose-300 border border-rose-800/40">
                      {c.crossCaseCount} CROSS-CASE LINKS
                    </span>
                  )}
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      c.priority === 'HIGH_PRIORITY'
                        ? 'bg-rose-950 text-rose-200 border border-rose-700/50'
                        : 'bg-indigo-950 text-indigo-200 border border-indigo-700/50'
                    }`}
                  >
                    {c.priority.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              <h3 className="text-base font-bold text-white group-hover:text-purple-200 transition">
                {c.title}
              </h3>

              <p className="text-xs text-white/60 mt-1.5 leading-relaxed line-clamp-2">
                {c.description}
              </p>

              {/* Target Focus Tag */}
              <div className="mt-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                <span className="text-[10px] text-white/40 uppercase tracking-wider block">
                  Target Intelligence Focus
                </span>
                <p className="text-xs font-medium text-purple-300 mt-0.5">{c.targetFocus}</p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {c.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded text-[10px] bg-white/[0.04] text-white/70 border border-white/5 flex items-center gap-1"
                  >
                    <Tag size={9} className="text-purple-400" />
                    <span>{tag}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Metrics Bar */}
            <div className="mt-5 pt-3.5 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5 text-white/80">
                  <Users size={13} className="text-purple-400" />
                  <span className="font-bold font-mono">{c.entityCount}</span>
                  <span className="text-[10px] text-white/40">Entities</span>
                </div>
                <div className="flex items-center gap-1.5 text-white/80">
                  <Network size={13} className="text-indigo-400" />
                  <span className="font-bold font-mono">{c.relationshipCount}</span>
                  <span className="text-[10px] text-white/40">Relations</span>
                </div>
                <div className="flex items-center gap-1.5 text-white/80">
                  <FileCheck2 size={13} className="text-teal-400" />
                  <span className="font-bold font-mono">{c.evidenceCount}</span>
                  <span className="text-[10px] text-white/40">Evidence</span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-semibold text-purple-300 group-hover:translate-x-1 transition">
                <span>Enter Workspace</span>
                <ArrowRight size={13} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
