import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  InvestigationCase,
  Entity,
  Relationship,
  Evidence,
  TimelineEvent,
  Alert,
  DocumentSource,
  IntelligenceReport,
  MonitoringStats,
  MonitoringActivityItem,
  AIAnalysisResult,
  AgentStage,
} from '../types';
import {
  MOCK_CASES,
  MOCK_ENTITIES,
  MOCK_RELATIONSHIPS,
  MOCK_EVIDENCE,
  MOCK_TIMELINE,
  MOCK_ALERTS,
  MOCK_DOCUMENTS,
  MOCK_REPORTS,
  MOCK_MONITORING_ACTIVITY,
  MOCK_MONITORING_STATS,
} from '../data/mockData';
import * as api from '../services/api';

interface NavigationState {
  route: string;
  params: Record<string, string>;
}

export interface NotificationToast {
  id: string;
  type: 'INFO' | 'REVIEW' | 'ALERT' | 'SUCCESS';
  title: string;
  message: string;
  timestamp: string;
}

export interface AIMessage {
  id: string;
  sender: 'USER' | 'AI';
  content: string;
  timestamp: string;
  evidenceCitations?: string[];
  linkedEntityIds?: string[];
}

export interface CurrentUser {
  name: string;
  badge: string;
  role: string;
  unit: string;
  email: string;
  clearanceLevel: string;
}

interface InvestigationContextType {
  // Routing
  currentRoute: string;
  routeParams: Record<string, string>;
  navigate: (route: string) => void;

  // Session & User
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  currentUser: CurrentUser;

  // Core Intelligence State
  currentCaseId: string;
  setCurrentCaseId: (id: string) => void;
  currentCase: InvestigationCase | null;
  cases: InvestigationCase[];
  refreshCases: () => Promise<void>;

  // Selection Synchronization (The Global Synchronization Engine)
  selectedEntityId: string | null;
  selectedEntity: Entity | null;
  selectEntity: (id: string | null, navigateToView?: boolean) => void;

  selectedRelationshipId: string | null;
  selectedRelationship: Relationship | null;
  selectRelationship: (id: string | null) => void;

  selectedEvidenceId: string | null;
  selectedEvidence: Evidence | null;
  selectEvidence: (id: string | null, navigateToView?: boolean) => void;

  selectedTimelineEventId: string | null;
  selectedTimelineEvent: TimelineEvent | null;
  selectTimelineEvent: (id: string | null) => void;

  // Collections
  entities: Entity[];
  relationships: Relationship[];
  timelineEvents: TimelineEvent[];
  evidence: Evidence[];
  alerts: Alert[];
  updateAlertStatus: (alertId: string, status: Alert['status']) => void;
  documents: DocumentSource[];
  selectedDocumentId: string | null;
  selectDocument: (id: string | null) => void;
  reports: IntelligenceReport[];
  monitoringEvents: MonitoringActivityItem[];

  // AI & Assistant Context
  aiContext: {
    lastQuery: string;
    lastResult: AIAnalysisResult | null;
  };
  aiMessages: AIMessage[];
  isAILoading: boolean;
  askAI: (query: string) => Promise<AIAnalysisResult>;
  isAIPondering: boolean;

  // Monitoring Cycle State
  isMonitoringRunning: boolean;
  monitoringStage: AgentStage;
  monitoringStats: MonitoringStats | null;
  runMonitoring: () => Promise<void>;

  // Notifications / Signal Pulses
  notifications: NotificationToast[];
  dismissNotification: (id: string) => void;
  triggerSignalPulse: (title: string, message: string, type?: NotificationToast['type']) => void;

  // Quick Action Modals
  isNewCaseModalOpen: boolean;
  setIsNewCaseModalOpen: (open: boolean) => void;
  isUploadModalOpen: boolean;
  setIsUploadModalOpen: (open: boolean) => void;

  // Direct Shortcuts
  openInvestigationWorkspace: (caseId: string) => void;
}

const InvestigationContext = createContext<InvestigationContextType | undefined>(undefined);

function parseHash(): NavigationState {
  const hash = window.location.hash.slice(1) || '/dashboard';
  const parts = hash.split('?')[0].split('/');
  const params: Record<string, string> = {};

  if (parts[1] === 'investigations' && parts[2]) {
    params.caseId = parts[2];
  } else if (parts[1] === 'entities' && parts[2]) {
    params.entityId = parts[2];
  } else if (parts[1] === 'evidence' && parts[2]) {
    params.evidenceId = parts[2];
  } else if (parts[1] === 'reports' && parts[2]) {
    params.reportId = parts[2];
  } else if (parts[1] === 'documents' && parts[2]) {
    params.documentId = parts[2];
  }

  return { route: hash.split('?')[0] || '/dashboard', params };
}

export const InvestigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [navState, setNavState] = useState<NavigationState>(parseHash);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [currentUser] = useState<CurrentUser>({
    name: 'Major Marcus Thorne',
    badge: 'BADGE-4092-CT',
    role: 'Lead Intelligence Analyst',
    unit: 'Directorate Special Operations & Multi-Jurisdictional Taskforce',
    email: 'm.thorne@directorate.intel.gov',
    clearanceLevel: 'TOP SECRET // SCI',
  });

  const [currentCaseId, setCurrentCaseId] = useState<string>('CASE-101');
  const [cases, setCases] = useState<InvestigationCase[]>(MOCK_CASES);
  const [currentCase, setCurrentCase] = useState<InvestigationCase | null>(MOCK_CASES[0] || null);

  const [selectedEntityId, setSelectedEntityId] = useState<string | null>('ENT-P-01');
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);

  const [selectedRelationshipId, setSelectedRelationshipId] = useState<string | null>('REL-001');
  const [selectedRelationship, setSelectedRelationship] = useState<Relationship | null>(null);

  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>('EV-102');
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);

  const [selectedTimelineEventId, setSelectedTimelineEventId] = useState<string | null>('TL-06');
  const [selectedTimelineEvent, setSelectedTimelineEvent] = useState<TimelineEvent | null>(null);

  // Collections
  const [entities, setEntities] = useState<Entity[]>(MOCK_ENTITIES);
  const [relationships, setRelationships] = useState<Relationship[]>(MOCK_RELATIONSHIPS);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>(MOCK_TIMELINE);
  const [evidence, setEvidence] = useState<Evidence[]>(MOCK_EVIDENCE);
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
  const [documents, setDocuments] = useState<DocumentSource[]>(MOCK_DOCUMENTS);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>('DOC-001');
  const [reports, setReports] = useState<IntelligenceReport[]>(MOCK_REPORTS);
  const [monitoringEvents, setMonitoringEvents] = useState<MonitoringActivityItem[]>(MOCK_MONITORING_ACTIVITY);

  // AI State
  const [aiContext, setAiContext] = useState<{
    lastQuery: string;
    lastResult: AIAnalysisResult | null;
  }>({
    lastQuery: 'Show strongest connections around Viktor V. Rao',
    lastResult: null,
  });
  const [isAIPondering, setIsAIPondering] = useState<boolean>(false);
  const [isAILoading, setIsAILoading] = useState<boolean>(false);

  const [aiMessages, setAiMessages] = useState<AIMessage[]>([
    {
      id: 'msg-1',
      sender: 'USER',
      content: 'Summarize the strongest connections around Viktor V. Rao and why they matter.',
      timestamp: '14:30:12',
    },
    {
      id: 'msg-2',
      sender: 'AI',
      content:
        'Viktor V. Rao (ENT-P-01) functions as the key operational nexus bridging financial accounts (ACC-88219-CH) and freight transport hubs (Sector 48 Depot).\n\nKey Grounds for Prioritization:\n1. Shared communication channel with Elena Rostova (ENT-P-02), coordinator for Silvercrest Logistics in Case 205.\n2. Wire batch disbursements structured below the statutory $50k reporting threshold.\n3. Physical co-presence logged alongside commercial vehicle DL-4C-NA-9021 during unmanifested late-night cargo transfers.',
      timestamp: '14:30:15',
      evidenceCitations: ['EV-102', 'EV-147', 'EV-203'],
      linkedEntityIds: ['ENT-P-01', 'ENT-P-02', 'ENT-ACC-01', 'ENT-VEH-01'],
    },
  ]);

  // Monitoring State
  const [isMonitoringRunning, setIsMonitoringRunning] = useState<boolean>(false);
  const [monitoringStage, setMonitoringStage] = useState<AgentStage>('IDLE');
  const [monitoringStats, setMonitoringStats] = useState<MonitoringStats | null>(null);

  const [notifications, setNotifications] = useState<NotificationToast[]>([
    {
      id: 'N-1',
      type: 'ALERT',
      title: 'CROSS-CASE LINK IDENTIFIED',
      message: 'Viktor V. Rao linked to Elena Rostova (Case 101 ↔ Case 205).',
      timestamp: '14:32 UTC',
    },
  ]);

  const [isNewCaseModalOpen, setIsNewCaseModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Sync hash changes
  useEffect(() => {
    const handleHashChange = () => {
      setNavState(parseHash());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = useCallback((route: string) => {
    window.location.hash = route;
    setNavState(parseHash());
  }, []);

  // Refresh cases list and load initial collections
  const refreshCases = useCallback(async () => {
    const data = await api.getCases();
    setCases(data);
    const found = data.find((c) => c.id === currentCaseId) || data[0];
    if (found) setCurrentCase(found);

    const [entList, relList, tlList, evList, alertList, docList, repList, monEvents, monStats] = await Promise.all([
      api.getEntities(),
      api.getRelationships(),
      api.getTimeline(),
      api.getEvidence(),
      api.getAlerts(),
      api.getDocuments(),
      api.getReports(),
      api.getMonitoringActivity(),
      api.getMonitoringStats(),
    ]);

    setEntities(entList);
    setRelationships(relList);
    setTimelineEvents(tlList);
    setEvidence(evList);
    setAlerts(alertList);
    setDocuments(docList);
    setReports(repList);
    setMonitoringEvents(monEvents);
    setMonitoringStats(monStats);
  }, [currentCaseId]);

  useEffect(() => {
    refreshCases();
  }, [refreshCases]);

  // Update current case when ID changes
  useEffect(() => {
    api.getCaseById(currentCaseId).then((c) => {
      if (c) setCurrentCase(c);
    });
  }, [currentCaseId]);

  // Synchronize Entity Selection
  const selectEntity = useCallback(
    async (id: string | null, navigateToView?: boolean) => {
      setSelectedEntityId(id);
      if (!id) {
        setSelectedEntity(null);
        return;
      }
      const ent = await api.getEntityById(id);
      setSelectedEntity(ent);
      if (navigateToView) {
        navigate(`/entities/${id}`);
      }
    },
    [navigate]
  );

  // Synchronize Relationship Selection
  const selectRelationship = useCallback(async (id: string | null) => {
    setSelectedRelationshipId(id);
    if (!id) {
      setSelectedRelationship(null);
      return;
    }
    const rels = await api.getRelationships();
    const found = rels.find((r) => r.id === id) || null;
    setSelectedRelationship(found);
  }, []);

  // Synchronize Evidence Selection
  const selectEvidence = useCallback(
    async (id: string | null, navigateToView?: boolean) => {
      setSelectedEvidenceId(id);
      if (!id) {
        setSelectedEvidence(null);
        return;
      }
      const ev = await api.getEvidenceById(id);
      setSelectedEvidence(ev);
      // Also highlight linked entity if present
      if (ev?.relatedEntityId) {
        setSelectedEntityId(ev.relatedEntityId);
        api.getEntityById(ev.relatedEntityId).then(setSelectedEntity);
      }
      if (navigateToView) {
        navigate(`/evidence/${id}`);
      }
    },
    [navigate]
  );

  // Synchronize Timeline Selection
  const selectTimelineEvent = useCallback(
    async (id: string | null) => {
      setSelectedTimelineEventId(id);
      if (!id) {
        setSelectedTimelineEvent(null);
        return;
      }
      const tl = await api.getTimeline();
      const found = tl.find((t) => t.id === id) || null;
      setSelectedTimelineEvent(found);
      if (found?.entityIds?.[0]) {
        selectEntity(found.entityIds[0]);
      }
      if (found?.evidenceId) {
        selectEvidence(found.evidenceId);
      }
    },
    [selectEntity, selectEvidence]
  );

  const selectDocument = useCallback((id: string | null) => {
    setSelectedDocumentId(id);
  }, []);

  const updateAlertStatus = useCallback((alertId: string, status: Alert['status']) => {
    setAlerts((prev) =>
      prev.map((alt) => (alt.id === alertId ? { ...alt, status } : alt))
    );
  }, []);

  // Initial populate of selections
  useEffect(() => {
    if (selectedEntityId) {
      api.getEntityById(selectedEntityId).then(setSelectedEntity);
    }
    if (selectedRelationshipId) {
      api.getRelationships().then((rels) => {
        const found = rels.find((r) => r.id === selectedRelationshipId);
        if (found) setSelectedRelationship(found);
      });
    }
    if (selectedEvidenceId) {
      api.getEvidenceById(selectedEvidenceId).then(setSelectedEvidence);
    }
    if (selectedTimelineEventId) {
      api.getTimeline().then((tl) => {
        const found = tl.find((t) => t.id === selectedTimelineEventId);
        if (found) setSelectedTimelineEvent(found);
      });
    }
  }, [selectedEntityId, selectedRelationshipId, selectedEvidenceId, selectedTimelineEventId]);

  // AI Assistant Query Handler
  const askAI = useCallback(
    async (query: string): Promise<AIAnalysisResult> => {
      setIsAIPondering(true);
      setIsAILoading(true);

      // Append user message immediately
      const userMsg: AIMessage = {
        id: `msg-${Date.now()}`,
        sender: 'USER',
        content: query,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };
      setAiMessages((prev) => [...prev, userMsg]);

      try {
        const result = await api.askInvestigationAssistant(query, {
          caseId: currentCaseId,
          entityId: selectedEntityId || undefined,
          relationshipId: selectedRelationshipId || undefined,
        });

        setAiContext({
          lastQuery: query,
          lastResult: result,
        });

        const aiReply: AIMessage = {
          id: `ai-${Date.now()}`,
          sender: 'AI',
          content: `${result.summary}\n\nKey Grounds:\n${result.whyExplanation.map((w, idx) => `${idx + 1}. ${w}`).join('\n')}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          evidenceCitations: result.supportingEvidence,
          linkedEntityIds: result.relatedEntityIds,
        };

        setAiMessages((prev) => [...prev, aiReply]);
        return result;
      } finally {
        setIsAIPondering(false);
        setIsAILoading(false);
      }
    },
    [currentCaseId, selectedEntityId, selectedRelationshipId]
  );

  // Trigger Signal Pulse / Notification
  const triggerSignalPulse = useCallback(
    (title: string, message: string, type: NotificationToast['type'] = 'INFO') => {
      const newToast: NotificationToast = {
        id: `toast-${Date.now()}`,
        type,
        title,
        message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setNotifications((prev) => [newToast, ...prev.slice(0, 4)]);
    },
    []
  );

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => (prev || []).filter((n) => n && n.id !== id));
  }, []);

  // Animated Multi-Agent Monitoring Cycle
  const runMonitoring = useCallback(async () => {
    if (isMonitoringRunning) return;
    setIsMonitoringRunning(true);

    const stages: AgentStage[] = [
      'SUPERVISOR',
      'DATA_RETRIEVAL',
      'ENTITY_EXTRACTION',
      'GRAPH_BUILDING',
      'OBFUSCATION_DETECTION',
      'EVIDENCE_LINKING',
      'REPORT_SYNTHESIS',
      'COMPLETE',
    ];

    for (const stage of stages) {
      setMonitoringStage(stage);
      await new Promise((r) => setTimeout(r, 450));
    }

    const { stats } = await api.runMonitoringCycle();
    setMonitoringStats(stats);
    setIsMonitoringRunning(false);
    setMonitoringStage('IDLE');
    triggerSignalPulse(
      'MONITORING CYCLE COMPLETED',
      '8 High-relevance findings detected across 5 active scopes. 1 new cross-case link identified.',
      'ALERT'
    );
  }, [isMonitoringRunning, triggerSignalPulse]);

  const openInvestigationWorkspace = useCallback(
    (caseId: string) => {
      setCurrentCaseId(caseId);
      navigate(`/investigations/${caseId}`);
    },
    [navigate]
  );

  return (
    <InvestigationContext.Provider
      value={{
        currentRoute: navState.route,
        routeParams: navState.params,
        navigate,
        isAuthenticated,
        setIsAuthenticated,
        currentUser,
        currentCaseId,
        setCurrentCaseId,
        currentCase,
        cases,
        refreshCases,
        selectedEntityId,
        selectedEntity,
        selectEntity,
        selectedRelationshipId,
        selectedRelationship,
        selectRelationship,
        selectedEvidenceId,
        selectedEvidence,
        selectEvidence,
        selectedTimelineEventId,
        selectedTimelineEvent,
        selectTimelineEvent,
        entities,
        relationships,
        timelineEvents,
        evidence,
        alerts,
        updateAlertStatus,
        documents,
        selectedDocumentId,
        selectDocument,
        reports,
        monitoringEvents,
        aiContext,
        aiMessages,
        isAILoading,
        askAI,
        isAIPondering,
        isMonitoringRunning,
        monitoringStage,
        monitoringStats,
        runMonitoring,
        notifications,
        dismissNotification,
        triggerSignalPulse,
        isNewCaseModalOpen,
        setIsNewCaseModalOpen,
        isUploadModalOpen,
        setIsUploadModalOpen,
        openInvestigationWorkspace,
      }}
    >
      {children}
    </InvestigationContext.Provider>
  );
};

export function useInvestigation() {
  const context = useContext(InvestigationContext);
  if (!context) {
    throw new Error('useInvestigation must be used within an InvestigationProvider');
  }
  return context;
}
