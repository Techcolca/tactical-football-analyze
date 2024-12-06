import axios from 'axios';
import { saveAs } from 'file-saver';
import { 
  MatchAnalysis, 
  TeamFormation, 
  PerformanceMetrics,
  TacticalEvent
} from '../types/analysis';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export interface ExportOptions {
  includeHeatmaps: boolean;
  includePlayerStats: boolean;
  includeTimeline: boolean;
  includeAnalysis: boolean;
  quality: 'low' | 'medium' | 'high';
}

class ExportService {
  async exportAnalysis(
    format: string,
    options: ExportOptions,
    analysis: MatchAnalysis,
    formation: TeamFormation,
    metrics: PerformanceMetrics,
    events: TacticalEvent[]
  ): Promise<void> {
    try {
      const response = await axios({
        url: `${API_URL}/api/export`,
        method: 'POST',
        responseType: 'blob',
        data: {
          format,
          options,
          analysis,
          formation,
          metrics,
          events
        }
      });

      // Generate filename based on date and format
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `tactical-analysis-${timestamp}.${this.getFileExtension(format)}`;

      // Save the file using file-saver
      saveAs(new Blob([response.data]), filename);
    } catch (error) {
      console.error('Error exporting analysis:', error);
      throw new Error('Error al exportar el análisis. Por favor, inténtelo de nuevo.');
    }
  }

  private getFileExtension(format: string): string {
    switch (format) {
      case 'pdf':
        return 'pdf';
      case 'excel':
        return 'xlsx';
      case 'video':
        return 'mp4';
      case 'presentation':
        return 'pptx';
      default:
        return 'pdf';
    }
  }
}

export const exportService = new ExportService();
