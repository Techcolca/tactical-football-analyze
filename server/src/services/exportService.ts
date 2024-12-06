import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';
import path from 'path';
import { 
  MatchAnalysis, 
  TeamFormation, 
  PlayerPosition,
  PerformanceMetrics,
  TacticalEvent
} from '../types/analysis';

class ExportService {
  async exportToPDF(
    analysis: MatchAnalysis,
    formation: TeamFormation,
    metrics: PerformanceMetrics,
    events: TacticalEvent[],
    outputPath: string
  ): Promise<string> {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const stream = fs.createWriteStream(outputPath);

    return new Promise((resolve, reject) => {
      // Encabezado
      doc.fontSize(25)
         .fillColor('#DAA520')
         .text('Análisis Táctico de Partido', { align: 'center' });

      doc.moveDown();

      // Información de la formación
      doc.fontSize(16)
         .fillColor('#000000')
         .text('Formación: ' + formation.pattern);

      // Dibujar campo de fútbol
      await this.drawField(doc, formation.positions);

      // Análisis táctico
      doc.addPage();
      doc.fontSize(18)
         .fillColor('#DAA520')
         .text('Análisis Táctico', { underline: true });

      doc.fontSize(12).fillColor('#000000');
      
      // Fortalezas
      doc.moveDown()
         .text('Fortalezas:', { underline: true });
      analysis.strengths.forEach(strength => {
        doc.text('• ' + strength);
      });

      // Debilidades
      doc.moveDown()
         .text('Debilidades:', { underline: true });
      analysis.weaknesses.forEach(weakness => {
        doc.text('• ' + weakness);
      });

      // Oportunidades de ataque
      doc.moveDown()
         .text('Oportunidades de Ataque:', { underline: true });
      analysis.attackingOpportunities.forEach(opportunity => {
        doc.text('• ' + opportunity);
      });

      // Métricas de rendimiento
      doc.addPage();
      doc.fontSize(18)
         .fillColor('#DAA520')
         .text('Métricas de Rendimiento', { underline: true });

      // Gráficos de métricas
      await this.drawMetricsGraphics(doc, metrics);

      // Eventos tácticos
      doc.addPage();
      doc.fontSize(18)
         .fillColor('#DAA520')
         .text('Eventos Tácticos', { underline: true });

      await this.drawEventTimeline(doc, events);

      // Finalizar PDF
      doc.end();

      stream.on('finish', () => {
        resolve(outputPath);
      });

      stream.on('error', reject);
    });
  }

  async exportToExcel(
    analysis: MatchAnalysis,
    metrics: PerformanceMetrics,
    events: TacticalEvent[],
    outputPath: string
  ): Promise<string> {
    const workbook = new ExcelJS.Workbook();

    // Hoja de análisis táctico
    const analysisSheet = workbook.addWorksheet('Análisis Táctico');
    this.formatAnalysisSheet(analysisSheet, analysis);

    // Hoja de métricas
    const metricsSheet = workbook.addWorksheet('Métricas');
    this.formatMetricsSheet(metricsSheet, metrics);

    // Hoja de eventos
    const eventsSheet = workbook.addWorksheet('Eventos');
    this.formatEventsSheet(eventsSheet, events);

    await workbook.xlsx.writeFile(outputPath);
    return outputPath;
  }

  async exportToVideo(
    events: TacticalEvent[],
    formation: TeamFormation,
    outputPath: string
  ): Promise<string> {
    // Implementar exportación a video usando ffmpeg
    // Esta es una implementación básica que se puede expandir
    return new Promise((resolve, reject) => {
      try {
        // Crear frames para cada evento
        const frames = this.generateEventFrames(events, formation);
        
        // Combinar frames en video
        this.combineFramesToVideo(frames, outputPath)
          .then(() => resolve(outputPath))
          .catch(reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  private async drawField(doc: PDFDocument, positions: PlayerPosition[]) {
    const canvas = createCanvas(400, 600);
    const ctx = canvas.getContext('2d');

    // Dibujar campo
    ctx.fillStyle = '#0A2342';
    ctx.fillRect(0, 0, 400, 600);

    // Líneas del campo
    ctx.strokeStyle = '#DAA520';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, 360, 560);

    // Línea media
    ctx.beginPath();
    ctx.moveTo(20, 300);
    ctx.lineTo(380, 300);
    ctx.stroke();

    // Círculo central
    ctx.beginPath();
    ctx.arc(200, 300, 50, 0, Math.PI * 2);
    ctx.stroke();

    // Dibujar jugadores
    positions.forEach(pos => {
      ctx.beginPath();
      ctx.fillStyle = '#DAA520';
      ctx.arc(pos.x * 400, pos.y * 600, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.fillText(pos.number.toString(), pos.x * 400, pos.y * 600 + 20);
    });

    // Añadir canvas al PDF
    doc.image(canvas.toBuffer(), 100, 100, { width: 400 });
  }

  private async drawMetricsGraphics(doc: PDFDocument, metrics: PerformanceMetrics) {
    const canvas = createCanvas(500, 300);
    const ctx = canvas.getContext('2d');

    // Gráfico de barras para métricas principales
    ctx.fillStyle = '#DAA520';
    
    // Posesión
    const possessionHeight = metrics.possessionPercentage * 2;
    ctx.fillRect(50, 280 - possessionHeight, 40, possessionHeight);
    ctx.fillText('Posesión', 50, 290);

    // Precisión de pases
    const passAccuracyHeight = metrics.passAccuracy * 2;
    ctx.fillRect(150, 280 - passAccuracyHeight, 40, passAccuracyHeight);
    ctx.fillText('Pases', 150, 290);

    // Presión
    const pressureHeight = metrics.pressureSuccess * 2;
    ctx.fillRect(250, 280 - pressureHeight, 40, pressureHeight);
    ctx.fillText('Presión', 250, 290);

    doc.image(canvas.toBuffer(), 50, 50, { width: 500 });
  }

  private async drawEventTimeline(doc: PDFDocument, events: TacticalEvent[]) {
    const canvas = createCanvas(600, 200);
    const ctx = canvas.getContext('2d');

    // Línea de tiempo
    ctx.strokeStyle = '#DAA520';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, 100);
    ctx.lineTo(550, 100);
    ctx.stroke();

    // Eventos en la línea de tiempo
    events.forEach((event, index) => {
      const x = 50 + (event.timestamp / 90) * 500; // Asumiendo 90 minutos de juego
      ctx.beginPath();
      ctx.arc(x, 100, 5, 0, Math.PI * 2);
      ctx.fillStyle = this.getEventColor(event.type);
      ctx.fill();
      ctx.fillText(event.type, x - 20, 120);
    });

    doc.image(canvas.toBuffer(), 50, 50, { width: 600 });
  }

  private formatAnalysisSheet(sheet: ExcelJS.Worksheet, analysis: MatchAnalysis) {
    // Configurar encabezados
    sheet.columns = [
      { header: 'Categoría', key: 'category', width: 20 },
      { header: 'Descripción', key: 'description', width: 60 }
    ];

    // Añadir datos
    analysis.strengths.forEach(strength => {
      sheet.addRow({ category: 'Fortaleza', description: strength });
    });

    analysis.weaknesses.forEach(weakness => {
      sheet.addRow({ category: 'Debilidad', description: weakness });
    });

    // Estilo
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFDAA520' } };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0A2342' } };
  }

  private formatMetricsSheet(sheet: ExcelJS.Worksheet, metrics: PerformanceMetrics) {
    sheet.columns = [
      { header: 'Métrica', key: 'metric', width: 20 },
      { header: 'Valor', key: 'value', width: 15 }
    ];

    sheet.addRow({ metric: 'Posesión', value: metrics.possessionPercentage + '%' });
    sheet.addRow({ metric: 'Precisión de Pases', value: metrics.passAccuracy + '%' });
    sheet.addRow({ metric: 'Tiros a Puerta', value: metrics.shotsOnTarget });
    sheet.addRow({ metric: 'Éxito en Presión', value: metrics.pressureSuccess + '%' });
    sheet.addRow({ metric: 'Distancia Cubierta', value: metrics.distanceCovered + ' km' });
    sheet.addRow({ metric: 'Velocidad Máxima', value: metrics.sprintSpeed + ' km/h' });
  }

  private formatEventsSheet(sheet: ExcelJS.Worksheet, events: TacticalEvent[]) {
    sheet.columns = [
      { header: 'Tiempo', key: 'time', width: 10 },
      { header: 'Tipo', key: 'type', width: 15 },
      { header: 'Jugador', key: 'player', width: 20 },
      { header: 'Éxito', key: 'success', width: 10 },
      { header: 'Detalles', key: 'details', width: 40 }
    ];

    events.forEach(event => {
      sheet.addRow({
        time: this.formatTime(event.timestamp),
        type: event.type,
        player: event.player,
        success: event.success ? 'Sí' : 'No',
        details: JSON.stringify(event.details)
      });
    });
  }

  private getEventColor(type: string): string {
    switch (type) {
      case 'pass':
        return '#4169E1';
      case 'shot':
        return '#FF4500';
      case 'tackle':
        return '#32CD32';
      case 'interception':
        return '#FFD700';
      default:
        return '#DAA520';
    }
  }

  private formatTime(timestamp: number): string {
    const minutes = Math.floor(timestamp);
    const seconds = Math.floor((timestamp - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  private generateEventFrames(events: TacticalEvent[], formation: TeamFormation) {
    // Implementar generación de frames para el video
    return [];
  }

  private async combineFramesToVideo(frames: Buffer[], outputPath: string) {
    // Implementar combinación de frames en video
  }
}

export const exportService = new ExportService();
