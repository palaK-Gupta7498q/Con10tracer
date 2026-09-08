import * as mockApi from './mockApi';
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
  ObfuscationDetection,
  AIAnalysisResult,
} from '../types';

/**
 * CON10TRACERS API Service Layer
 * Clean abstraction separating UI components from data source.
 * In future iterations, replace mockApi calls with FastAPI fetch calls.
 */

export async function getCases(): Promise<InvestigationCase[]> {
  return mockApi.getCases();
}

export async function getCaseById(id: string): Promise<InvestigationCase | null> {
  return mockApi.getCaseById(id);
}

export async function createCase(payload: {
  title: string;
  description: string;
  referenceId?: string;
}): Promise<InvestigationCase> {
  return mockApi.createCase(payload);
}

export async function getEntities(caseId?: string): Promise<Entity[]> {
  return mockApi.getEntities(caseId);
}

export async function getEntityById(id: string): Promise<Entity | null> {
  return mockApi.getEntityById(id);
}

export async function getRelationships(caseId?: string): Promise<Relationship[]> {
  return mockApi.getRelationships(caseId);
}

export async function getGraphData(caseId?: string): Promise<{
  entities: Entity[];
  relationships: Relationship[];
}> {
  return mockApi.getGraphData(caseId);
}

export async function getEvidence(caseId?: string): Promise<Evidence[]> {
  return mockApi.getEvidence(caseId);
}

export async function getEvidenceById(id: string): Promise<Evidence | null> {
  return mockApi.getEvidenceById(id);
}

export async function getTimeline(caseId?: string): Promise<TimelineEvent[]> {
  return mockApi.getTimeline(caseId);
}

export async function getAlerts(priorityFilter?: string): Promise<Alert[]> {
  return mockApi.getAlerts(priorityFilter);
}

export async function getMonitoringStats(): Promise<MonitoringStats> {
  return mockApi.getMonitoringStats();
}

export async function getMonitoringActivity(): Promise<MonitoringActivityItem[]> {
  return mockApi.getMonitoringActivity();
}

export async function runMonitoringCycle(): Promise<{
  stats: MonitoringStats;
  newAlerts: Alert[];
  findingsCount: number;
}> {
  return mockApi.runMonitoringCycle();
}

export async function getDocuments(caseId?: string): Promise<DocumentSource[]> {
  return mockApi.getDocuments(caseId);
}

export async function uploadDocument(
  file: File | { name: string; size: number },
  caseId: string
): Promise<DocumentSource> {
  return mockApi.uploadDocument(file, caseId);
}

export async function runDocumentAnalysis(docId: string): Promise<{
  extractedEntities: Entity[];
  extractedRelationships: Relationship[];
  evidenceGenerated: Evidence[];
}> {
  return mockApi.runDocumentAnalysis(docId);
}

export async function getReports(caseId?: string): Promise<IntelligenceReport[]> {
  return mockApi.getReports(caseId);
}

export async function getReportById(id: string): Promise<IntelligenceReport | null> {
  return mockApi.getReportById(id);
}

export async function generateReport(caseId: string): Promise<IntelligenceReport> {
  return mockApi.generateReport(caseId);
}

export async function analyzeObfuscation(rawText: string): Promise<ObfuscationDetection> {
  return mockApi.analyzeObfuscation(rawText);
}

export async function getObfuscationSamples(): Promise<ObfuscationDetection[]> {
  return mockApi.getObfuscationSamples();
}

export async function askInvestigationAssistant(
  query: string,
  context?: {
    caseId?: string;
    entityId?: string;
    relationshipId?: string;
  }
): Promise<AIAnalysisResult> {
  return mockApi.askInvestigationAssistant(query, context);
}
