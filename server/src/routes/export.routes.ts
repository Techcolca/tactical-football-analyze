import { Router } from 'express';
import { exportService } from '../services/exportService';
import path from 'path';
import os from 'os';

const router = Router();

router.post('/export', async (req, res) => {
  try {
    const { format, options, analysis, formation, metrics, events } = req.body;
    
    // Create a temporary directory for exports
    const tempDir = path.join(os.tmpdir(), 'tactical-analysis-exports');
    const timestamp = new Date().getTime();
    const fileName = `analysis-${timestamp}`;
    let outputPath: string;
    let result: string;

    switch (format) {
      case 'pdf':
        outputPath = path.join(tempDir, `${fileName}.pdf`);
        result = await exportService.exportToPDF(
          analysis,
          formation,
          metrics,
          events,
          outputPath
        );
        break;

      case 'excel':
        outputPath = path.join(tempDir, `${fileName}.xlsx`);
        result = await exportService.exportToExcel(
          analysis,
          metrics,
          events,
          outputPath
        );
        break;

      case 'video':
        outputPath = path.join(tempDir, `${fileName}.mp4`);
        result = await exportService.exportToVideo(
          events,
          formation,
          outputPath
        );
        break;

      default:
        return res.status(400).json({ error: 'Formato de exportación no soportado' });
    }

    // Send the file as a response
    res.download(result, path.basename(result), (err) => {
      if (err) {
        console.error('Error sending file:', err);
        // Clean up the file after sending or in case of error
        try {
          fs.unlinkSync(result);
        } catch (cleanupErr) {
          console.error('Error cleaning up file:', cleanupErr);
        }
      }
    });

  } catch (error) {
    console.error('Error in export:', error);
    res.status(500).json({ 
      error: 'Error al exportar el análisis',
      details: error.message 
    });
  }
});

export default router;
