import React, { createContext, useContext, useState, useCallback } from 'react';
import { 
  MatchAnalysis, 
  TeamFormation, 
  PerformanceMetrics,
  TacticalEvent
} from '../types/analysis';

interface AnalysisContextType {
  analysis: MatchAnalysis | null;
  formation: TeamFormation | null;
  metrics: PerformanceMetrics | null;
  events: TacticalEvent[];
  selectedTool: string;
  setAnalysis: (analysis: MatchAnalysis) => void;
  setFormation: (formation: TeamFormation) => void;
  setMetrics: (metrics: PerformanceMetrics) => void;
  setEvents: (events: TacticalEvent[]) => void;
  setSelectedTool: (toolId: string) => void;
  clearAnalysis: () => void;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export const AnalysisProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [analysis, setAnalysis] = useState<MatchAnalysis | null>(null);
  const [formation, setFormation] = useState<TeamFormation | null>(null);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [events, setEvents] = useState<TacticalEvent[]>([]);
  const [selectedTool, setSelectedTool] = useState<string>('heatmap');

  const clearAnalysis = useCallback(() => {
    setAnalysis(null);
    setFormation(null);
    setMetrics(null);
    setEvents([]);
  }, []);

  const value = {
    analysis,
    formation,
    metrics,
    events,
    selectedTool,
    setAnalysis,
    setFormation,
    setMetrics,
    setEvents,
    setSelectedTool,
    clearAnalysis,
  };

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
};

export const useAnalysisContext = () => {
  const context = useContext(AnalysisContext);
  if (context === undefined) {
    throw new Error('useAnalysisContext must be used within an AnalysisProvider');
  }
  return context;
};
