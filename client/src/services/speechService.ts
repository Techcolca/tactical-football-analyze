class SpeechService {
    private recognition: SpeechRecognition | null = null;
    private synthesis: SpeechSynthesis;
    private isListening: boolean = false;
    private language: string = 'en-US';

    constructor() {
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
            this.setupRecognition();
        }
        this.synthesis = window.speechSynthesis;
    }

    private setupRecognition() {
        if (!this.recognition) return;

        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = this.language;
    }

    setLanguage(text: string) {
        // Detect language and set appropriate voice language
        if (text.match(/[áéíóúñ¿¡]/i) || /hola|gracias|por favor/i.test(text)) {
            this.language = 'es-ES';
        } else if (/bonjour|merci|s'il vous plaît/i.test(text)) {
            this.language = 'fr-FR';
        } else {
            this.language = 'en-US';
        }
        
        if (this.recognition) {
            this.recognition.lang = this.language;
        }
    }

    startListening(onResult: (text: string) => void, onError: (error: string) => void) {
        if (!this.recognition) {
            onError('Speech recognition is not supported in this browser');
            return;
        }

        if (this.isListening) return;

        this.isListening = true;
        
        this.recognition.onresult = (event) => {
            const text = event.results[0][0].transcript;
            onResult(text);
        };

        this.recognition.onerror = (event) => {
            onError(`Error occurred in recognition: ${event.error}`);
        };

        this.recognition.onend = () => {
            this.isListening = false;
        };

        try {
            this.recognition.start();
        } catch (error) {
            onError('Error starting speech recognition');
            this.isListening = false;
        }
    }

    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
        }
    }

    speak(text: string, onEnd?: () => void) {
        // Cancel any ongoing speech
        this.synthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = this.language;

        // Get the appropriate voice for the language
        const voices = this.synthesis.getVoices();
        const voice = voices.find(v => v.lang.startsWith(this.language.split('-')[0]));
        if (voice) {
            utterance.voice = voice;
        }

        if (onEnd) {
            utterance.onend = onEnd;
        }

        this.synthesis.speak(utterance);
    }

    isSupported(): boolean {
        return 'webkitSpeechRecognition' in window && 'speechSynthesis' in window;
    }
}

export const speechService = new SpeechService();
