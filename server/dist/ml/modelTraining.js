"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.modelTrainer = exports.ModelTrainer = void 0;
const tf = __importStar(require("@tensorflow/tfjs-node"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
class ModelTrainer {
    constructor() {
        this.modelsPath = path_1.default.join(__dirname, '../../../models');
        this.batchSize = 32;
        this.epochs = 100;
        this.ensureModelDirectories();
    }
    async ensureModelDirectories() {
        const directories = [
            'formation_model',
            'performance_model',
            'match_model'
        ];
        for (const dir of directories) {
            const dirPath = path_1.default.join(this.modelsPath, dir);
            await fs_1.promises.mkdir(dirPath, { recursive: true });
        }
    }
    // Modelo de Predicción de Formación
    async trainFormationModel(trainingData) {
        const model = tf.sequential();
        // Capas del modelo
        model.add(tf.layers.dense({
            units: 128,
            activation: 'relu',
            inputShape: [this.calculateInputFeatures()],
        }));
        model.add(tf.layers.dropout({ rate: 0.3 }));
        model.add(tf.layers.dense({
            units: 64,
            activation: 'relu',
        }));
        model.add(tf.layers.dropout({ rate: 0.2 }));
        model.add(tf.layers.dense({
            units: this.getFormationOutputUnits(),
            activation: 'softmax',
        }));
        // Compilar modelo
        model.compile({
            optimizer: tf.train.adam(0.001),
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy'],
        });
        // Preparar datos
        const { inputs, outputs } = this.prepareFormationData(trainingData);
        // Entrenar modelo
        await model.fit(inputs, outputs, {
            epochs: this.epochs,
            batchSize: this.batchSize,
            validationSplit: 0.2,
            callbacks: {
                onEpochEnd: (epoch, logs) => {
                    console.log(`Epoch ${epoch + 1}: loss = ${logs === null || logs === void 0 ? void 0 : logs.loss.toFixed(4)}, accuracy = ${logs === null || logs === void 0 ? void 0 : logs.acc.toFixed(4)}`);
                },
            },
        });
        // Guardar modelo
        await model.save(`file://${path_1.default.join(this.modelsPath, 'formation_model')}`);
    }
    // Modelo de Predicción de Rendimiento
    async trainPerformanceModel(trainingData) {
        const model = tf.sequential();
        // Arquitectura del modelo
        model.add(tf.layers.dense({
            units: 64,
            activation: 'relu',
            inputShape: [this.calculatePlayerFeatures()],
        }));
        model.add(tf.layers.dense({
            units: 32,
            activation: 'relu',
        }));
        model.add(tf.layers.dense({
            units: 6, // rating + 5 stats
            activation: 'linear',
        }));
        model.compile({
            optimizer: tf.train.adam(0.001),
            loss: 'meanSquaredError',
        });
        // Preparar datos
        const { inputs, outputs } = this.preparePerformanceData(trainingData);
        // Entrenar modelo
        await model.fit(inputs, outputs, {
            epochs: this.epochs,
            batchSize: this.batchSize,
            validationSplit: 0.2,
        });
        // Guardar modelo
        await model.save(`file://${path_1.default.join(this.modelsPath, 'performance_model')}`);
    }
    // Modelo de Predicción de Partido
    async trainMatchModel(trainingData) {
        const model = tf.sequential();
        // Arquitectura del modelo
        model.add(tf.layers.dense({
            units: 128,
            activation: 'relu',
            inputShape: [this.calculateMatchFeatures()],
        }));
        model.add(tf.layers.dropout({ rate: 0.3 }));
        model.add(tf.layers.dense({
            units: 64,
            activation: 'relu',
        }));
        model.add(tf.layers.dense({
            units: 5, // goalsFor, goalsAgainst, winProb, drawProb, lossProb
            activation: 'linear',
        }));
        model.compile({
            optimizer: tf.train.adam(0.001),
            loss: 'meanSquaredError',
        });
        // Preparar datos
        const { inputs, outputs } = this.prepareMatchData(trainingData);
        // Entrenar modelo
        await model.fit(inputs, outputs, {
            epochs: this.epochs,
            batchSize: this.batchSize,
            validationSplit: 0.2,
        });
        // Guardar modelo
        await model.save(`file://${path_1.default.join(this.modelsPath, 'match_model')}`);
    }
    // Métodos auxiliares para preparación de datos
    calculateInputFeatures() {
        // Calcular número total de características de entrada
        return 0; // Implementar cálculo real
    }
    getFormationOutputUnits() {
        // Número de formaciones posibles
        return 0; // Implementar cálculo real
    }
    calculatePlayerFeatures() {
        // Calcular características del jugador
        return 0; // Implementar cálculo real
    }
    calculateMatchFeatures() {
        // Calcular características del partido
        return 0; // Implementar cálculo real
    }
    prepareFormationData(data) {
        // Preparar datos para el modelo de formación
        return { inputs: tf.tensor([]), outputs: tf.tensor([]) };
    }
    preparePerformanceData(data) {
        // Preparar datos para el modelo de rendimiento
        return { inputs: tf.tensor([]), outputs: tf.tensor([]) };
    }
    prepareMatchData(data) {
        // Preparar datos para el modelo de partido
        return { inputs: tf.tensor([]), outputs: tf.tensor([]) };
    }
}
exports.ModelTrainer = ModelTrainer;
exports.modelTrainer = new ModelTrainer();
//# sourceMappingURL=modelTraining.js.map