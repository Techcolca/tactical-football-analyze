"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const exportService_1 = require("../services/exportService");
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const router = (0, express_1.Router)();
router.post('/export', async (req, res) => {
    try {
        const { format, options, analysis, formation, metrics, events } = req.body;
        // Create a temporary directory for exports
        const tempDir = path_1.default.join(os_1.default.tmpdir(), 'tactical-analysis-exports');
        const timestamp = new Date().getTime();
        const fileName = `analysis-${timestamp}`;
        let outputPath;
        let result;
        switch (format) {
            case 'pdf':
                outputPath = path_1.default.join(tempDir, `${fileName}.pdf`);
                result = await exportService_1.exportService.exportToPDF(analysis, formation, metrics, events, outputPath);
                break;
            case 'excel':
                outputPath = path_1.default.join(tempDir, `${fileName}.xlsx`);
                result = await exportService_1.exportService.exportToExcel(analysis, metrics, events, outputPath);
                break;
            case 'video':
                outputPath = path_1.default.join(tempDir, `${fileName}.mp4`);
                result = await exportService_1.exportService.exportToVideo(events, formation, outputPath);
                break;
            default:
                return res.status(400).json({ error: 'Formato de exportación no soportado' });
        }
        // Send the file as a response
        res.download(result, path_1.default.basename(result), (err) => {
            if (err) {
                console.error('Error sending file:', err);
                // Clean up the file after sending or in case of error
                try {
                    fs.unlinkSync(result);
                }
                catch (cleanupErr) {
                    console.error('Error cleaning up file:', cleanupErr);
                }
            }
        });
    }
    catch (error) {
        console.error('Error in export:', error);
        res.status(500).json({
            error: 'Error al exportar el análisis',
            details: error.message
        });
    }
});
exports.default = router;
//# sourceMappingURL=export.routes.js.map