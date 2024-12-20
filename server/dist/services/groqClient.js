"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.groqClient = exports.GroqClient = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
function detectLanguage(text) {
    // Artículos y preposiciones comunes en cada idioma
    const spanishCommon = ['el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'de', 'del', 'para', 'por', 'con', 'en'];
    const frenchCommon = ['le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'pour', 'par', 'avec', 'en', 'dans', 'sur'];
    // Palabras específicas del fútbol en cada idioma
    const spanishFootball = [
        'fútbol', 'futbol', 'equipo', 'jugadores', 'partido', 'juego', 'campo', 'pelota',
        'balón', 'gol', 'portero', 'defensa', 'medio', 'delantero', 'entrenador', 'técnico',
        'ejercicio', 'práctica', 'estrategia', 'formación', 'posición', 'pase', 'tiro',
        'táctica', 'técnica', 'entrenamiento', 'arquero', 'cancha', 'arco', 'portería'
    ];
    const frenchFootball = [
        'football', 'équipe', 'joueurs', 'match', 'jeu', 'terrain', 'ballon',
        'but', 'gardien', 'défenseur', 'milieu', 'attaquant', 'entraîneur', 'coach',
        'exercice', 'pratique', 'stratégie', 'formation', 'position', 'passe', 'tir',
        'tactique', 'technique', 'entraînement', 'arbitre', 'championnat', 'ligue',
        'ailier', 'avant-centre', 'défense', 'attaque'
    ];
    // Verbos y expresiones comunes
    const spanishVerbs = ['necesito', 'quiero', 'busco', 'tengo', 'dame', 'dime', 'explica', 'ayuda', 'puedes', 'cómo'];
    const frenchVerbs = ['je', 'besoin', 'veux', 'cherche', 'avoir', 'donnez', 'dites', 'expliquez', 'aidez', 'pouvez', 'comment'];
    const normalizedText = text.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, ""); // Eliminar acentos para mejor comparación
    // Función para contar palabras exactas
    const countExactWords = (words, text) => {
        const textWords = text.split(/\s+/);
        return words.reduce((count, word) => {
            const regex = new RegExp(`\\b${word}\\b`, 'g');
            const matches = text.match(regex);
            return count + (matches ? matches.length : 0);
        }, 0);
    };
    // Calcular puntuaciones
    let spanishScore = countExactWords(spanishCommon, normalizedText) * 1 +
        countExactWords(spanishFootball, normalizedText) * 2 +
        countExactWords(spanishVerbs, normalizedText) * 2;
    let frenchScore = countExactWords(frenchCommon, normalizedText) * 1 +
        countExactWords(frenchFootball, normalizedText) * 2 +
        countExactWords(frenchVerbs, normalizedText) * 2;
    console.log('Language detection scores:', {
        spanish: spanishScore,
        french: frenchScore,
        text: normalizedText
    });
    // Bias hacia francés si hay patrones específicos
    if (normalizedText.includes('je') ||
        normalizedText.includes('vous') ||
        normalizedText.includes('nous') ||
        /\b(le|la|les|des|du)\b/.test(normalizedText)) {
        frenchScore += 2;
    }
    if (spanishScore > frenchScore)
        return 'spanish';
    if (frenchScore > spanishScore)
        return 'french';
    return 'english';
}
function getSystemPromptByLanguage(language) {
    switch (language) {
        case 'spanish':
            return `Eres un entrenador de fútbol profesional que habla español nativo.
IMPORTANTE: Debes responder SIEMPRE en español, usando el vocabulario y expresiones naturales del fútbol en español.
NO uses traducciones literales del inglés. Usa términos como "cancha" en lugar de "campo", "arco" en lugar de "portería", etc.

Tu tarea es proporcionar análisis detallados y sugerencias para tácticas y estrategias de fútbol.
Si la pregunta no está relacionada con fútbol, indica amablemente que solo puedes ayudar con temas de fútbol.

Formato de respuesta:
1. Resumen Breve: Una descripción concisa de la situación
2. Análisis Táctico: Explicación detallada de la estrategia
3. Puntos Clave: Aspectos importantes a considerar
4. Recomendaciones: Sugerencias específicas para implementar
5. Variaciones: Alternativas posibles

Usa términos naturales del fútbol en español como:
- "cancha" en vez de "campo"
- "arco" o "portería" en vez de "goal"
- "arquero" o "portero" en vez de "goalkeeper"
- "lateral" en vez de "fullback"
- "volante" en vez de "midfielder"
- "delantero" en vez de "forward"`;
        case 'french':
            return `Vous êtes un entraîneur de football professionnel qui parle français natif.
IMPORTANT: Vous devez TOUJOURS répondre en français, en utilisant le vocabulaire et les expressions naturelles du football en français.
N'utilisez PAS de traductions littérales de l'anglais. Utilisez des termes comme "terrain" au lieu de "champ", "cage" au lieu de "but", etc.

Votre tâche est de fournir des analyses détaillées et des suggestions pour les tactiques et stratégies de football.
Si la question n'est pas liée au football, indiquez poliment que vous ne pouvez aider qu'avec des sujets liés au football.

Format de réponse:
1. Bref Résumé: Une description concise de la situation
2. Analyse Tactique: Explication détaillée de la stratégie
3. Points Clés: Aspects importants à considérer
4. Recommandations: Suggestions spécifiques pour la mise en œuvre
5. Variations: Alternatives possibles

Utilisez des termes naturels du football en français comme:
- "terrain" au lieu de "champ"
- "cage" ou "but" au lieu de "goal"
- "gardien" au lieu de "goalkeeper"
- "arrière" au lieu de "fullback"
- "milieu" au lieu de "midfielder"
- "attaquant" au lieu de "forward"`;
        default:
            return `You are a professional football coach who speaks native English.
Your task is to provide detailed analysis and suggestions for football tactics and strategies.
If the question is not related to football, kindly indicate that you can only help with football-related topics.

Response format:
1. Brief Summary: A concise description of the situation
2. Tactical Analysis: Detailed explanation of the strategy
3. Key Points: Important aspects to consider
4. Recommendations: Specific suggestions for implementation
5. Variations: Possible alternatives`;
    }
}
function getExamplePromptByLanguage(language) {
    switch (language) {
        case 'spanish':
            return `Ejemplo de una buena respuesta en español:

1. Resumen Breve:
La formación 4-3-3 es una táctica ofensiva que prioriza el control del mediocampo y la presión alta.

2. Análisis Táctico:
Esta formación utiliza dos volantes de contención y un volante creativo, apoyados por tres delanteros móviles que presionan constantemente la salida rival.

3. Puntos Clave:
- Presión alta de los delanteros
- Control del mediocampo
- Triangulaciones rápidas
- Transiciones veloces

4. Recomendaciones:
- Trabajar la resistencia física
- Practicar pases cortos y precisos
- Coordinar movimientos de presión

5. Variaciones:
- 4-3-3 con falso 9
- 4-3-3 con extremos invertidos`;
        case 'french':
            return `Exemple d'une bonne réponse en français:

1. Bref Résumé:
La formation 4-3-3 est une tactique offensive qui privilégie le contrôle du milieu de terrain et le pressing haut.

2. Analyse Tactique:
Cette formation utilise deux milieux défensifs et un milieu créatif, soutenus par trois attaquants mobiles qui pressent constamment la sortie adverse.

3. Points Clés:
- Pressing haut des attaquants
- Contrôle du milieu de terrain
- Triangulations rapides
- Transitions rapides

4. Recommandations:
- Travailler l'endurance physique
- Pratiquer les passes courtes et précises
- Coordonner les mouvements de pressing

5. Variations:
- 4-3-3 avec faux 9
- 4-3-3 avec ailiers inversés`;
        default:
            return '';
    }
}
class GroqClient {
    constructor() {
        this.apiKey = process.env.GROQ_API_KEY || '';
        if (!this.apiKey) {
            throw new Error('GROQ_API_KEY is not set in environment variables');
        }
        console.log('GroqClient initialized with API key length:', this.apiKey.length);
    }
    getSystemPromptByLanguage(language) {
        switch (language) {
            case 'es':
                return `Eres un experto entrenador de fútbol que proporciona análisis tácticos detallados y consejos técnicos. 
                        Tus respuestas deben ser SIEMPRE en ESPAÑOL.
                        Estructura tus respuestas en las siguientes secciones:
                        - Resumen:
                        - Análisis Táctico:
                        - Puntos Clave:
                        - Recomendaciones:
                        - Variaciones:`;
            case 'fr':
                return `Vous êtes un expert entraîneur de football qui fournit des analyses tactiques détaillées et des conseils techniques. 
                        Vos réponses doivent être TOUJOURS en FRANÇAIS.
                        Structurez vos réponses dans les sections suivantes:
                        - Résumé:
                        - Analyse Tactique:
                        - Points Clés:
                        - Recommandations:
                        - Variations:`;
            default:
                return `You are an expert football coach providing detailed tactical analysis and technical advice.
                        Your responses must ALWAYS be in ENGLISH.
                        Structure your responses in the following sections:
                        - Summary:
                        - Tactical Analysis:
                        - Key Points:
                        - Recommendations:
                        - Variations:`;
        }
    }
    getExamplePromptByLanguage(language) {
        switch (language) {
            case 'es':
                return '¿Puedes analizar la formación 4-3-3 y sus variantes tácticas?';
            case 'fr':
                return 'Pouvez-vous analyser la formation 4-3-3 et ses variantes tactiques ?';
            default:
                return 'Can you analyze the 4-3-3 formation and its tactical variations?';
        }
    }
    getExampleResponseByLanguage(language) {
        switch (language) {
            case 'es':
                return `Aquí está mi análisis táctico:

Resumen:
El 4-3-3 es una formación ofensiva que equilibra ataque y defensa. Proporciona buena cobertura del campo y opciones de pase.

Análisis Táctico:
- La línea defensiva de 4 jugadores da estabilidad
- El mediocampo de 3 controla el centro del campo
- Los 3 delanteros crean amenazas ofensivas

Puntos Clave:
- Mantener la posesión del balón
- Presionar alto cuando sea posible
- Crear triangulaciones en ataque

Recomendaciones:
- Los laterales deben apoyar el ataque
- El mediocampista central debe cubrir espacios
- Los extremos deben replegarse en defensa

Variaciones:
- 4-3-3 posesión con mediapunta
- 4-3-3 presión alta
- 4-3-3 contraataque`;
            case 'fr':
                return `Voici mon analyse tactique :

Résumé :
Le 4-3-3 est une formation offensive qui équilibre l'attaque et la défense. Il offre une bonne couverture du terrain et des options de passe.

Analyse Tactique :
- La ligne défensive de 4 joueurs apporte de la stabilité
- Le milieu de terrain à 3 contrôle le centre du terrain
- Les 3 attaquants créent des menaces offensives

Points Clés :
- Maintenir la possession du ballon
- Presser haut quand possible
- Créer des triangles en attaque

Recommandations :
- Les latéraux doivent soutenir l'attaque
- Le milieu central doit couvrir les espaces
- Les ailiers doivent se replier en défense

Variations :
- 4-3-3 possession avec numéro 10
- 4-3-3 pressing haut
- 4-3-3 contre-attaque`;
            default:
                return `Here's my tactical analysis:

Summary:
The 4-3-3 is an offensive formation that balances attack and defense. It provides good field coverage and passing options.

Tactical Analysis:
- Back 4 provides defensive stability
- Midfield 3 controls the center
- Front 3 creates offensive threats

Key Points:
- Maintain ball possession
- Press high when possible
- Create attacking triangles

Recommendations:
- Fullbacks should support attack
- Central midfielder must cover spaces
- Wingers should track back

Variations:
- 4-3-3 possession with number 10
- 4-3-3 high press
- 4-3-3 counter-attack`;
        }
    }
    async generateTacticalAnalysis(prompt, language = 'en') {
        try {
            console.log('Generating analysis with language:', language);
            const systemPrompt = this.getSystemPromptByLanguage(language);
            const examplePrompt = this.getExamplePromptByLanguage(language);
            const exampleResponse = this.getExampleResponseByLanguage(language);
            // Añadir instrucción específica de idioma al prompt
            let languagePrompt = prompt;
            if (language === 'es') {
                languagePrompt = `[INSTRUCCIÓN: RESPONDE COMPLETAMENTE EN ESPAÑOL] ${prompt}`;
            }
            else if (language === 'fr') {
                languagePrompt = `[INSTRUCTION: RÉPONDEZ ENTIÈREMENT EN FRANÇAIS] ${prompt}`;
            }
            else {
                languagePrompt = `[INSTRUCTION: RESPOND ENTIRELY IN ENGLISH] ${prompt}`;
            }
            const messages = [
                {
                    role: 'system',
                    content: `${systemPrompt}\n\nIMPORTANT: You MUST respond ONLY in ${language === 'es' ? 'SPANISH' :
                        language === 'fr' ? 'FRENCH' :
                            'ENGLISH'}. DO NOT use ANY other language in your response.`
                },
                { role: 'user', content: examplePrompt },
                { role: 'assistant', content: exampleResponse },
                { role: 'user', content: languagePrompt }
            ];
            console.log('Sending request to Groq API with language:', language);
            const response = await axios_1.default.post(GROQ_API_URL, {
                model: 'mixtral-8x7b-32768',
                messages,
                temperature: 0.7,
                max_tokens: 2048,
                top_p: 1,
                stop: null,
                stream: false
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.data.choices || response.data.choices.length === 0) {
                throw new Error(language === 'es' ? 'No se recibió respuesta del modelo' :
                    language === 'fr' ? 'Aucune réponse reçue du modèle' :
                        'No response received from the model');
            }
            let result = response.data.choices[0].message.content;
            // Asegurarse de que las secciones estén en el idioma correcto
            if (language === 'es') {
                result = result
                    .replace(/Summary:/gi, 'Resumen:')
                    .replace(/Tactical Analysis:/gi, 'Análisis Táctico:')
                    .replace(/Key Points:/gi, 'Puntos Clave:')
                    .replace(/Recommendations:/gi, 'Recomendaciones:')
                    .replace(/Variations:/gi, 'Variaciones:');
            }
            else if (language === 'fr') {
                result = result
                    .replace(/Summary:/gi, 'Résumé:')
                    .replace(/Tactical Analysis:/gi, 'Analyse Tactique:')
                    .replace(/Key Points:/gi, 'Points Clés:')
                    .replace(/Recommendations:/gi, 'Recommandations:')
                    .replace(/Variations:/gi, 'Variations:');
            }
            console.log('Generated response length:', result.length);
            return result;
        }
        catch (error) {
            console.error('Error in generateTacticalAnalysis:', error);
            throw new Error(language === 'es' ? 'Error al generar el análisis: ' + (error.message || 'Error desconocido') :
                language === 'fr' ? 'Erreur lors de la génération de l\'analyse: ' + (error.message || 'Erreur inconnue') :
                    'Error generating analysis: ' + (error.message || 'Unknown error'));
        }
    }
}
exports.GroqClient = GroqClient;
exports.groqClient = new GroqClient();
//# sourceMappingURL=groqClient.js.map