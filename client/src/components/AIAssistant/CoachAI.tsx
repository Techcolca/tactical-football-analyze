import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Tab,
  Tabs,
  CircularProgress,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { useAITacticalAssistant } from '../../services/aiTacticalAssistant';
import { generateFormation } from '../../services/formationService';
import { speechService } from '../../services/speechService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const CoachAI: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [formation, setFormation] = useState('4-4-2');
  const [tacticalPrompt, setTacticalPrompt] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [tacticalPlay, setTacticalPlay] = useState<any>(null);
  const [formationData, setFormationData] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { getCoachAdvice } = useAITacticalAssistant();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const response = await getCoachAdvice(text);
      const responseText = typeof response === 'string' ? response : JSON.stringify(response, null, 2);
      
      const assistantMessage: Message = { 
        role: 'assistant', 
        content: responseText
      };
      setMessages(prev => [...prev, assistantMessage]);
      
      if (speechService.isSupported() && !isSpeaking) {
        setIsSpeaking(true);
        speechService.setLanguage(text);
        speechService.speak(responseText, () => setIsSpeaking(false));
      }
    } catch (err) {
      setError('Failed to get response from the coach. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (!speechService.isSupported()) {
      setError('Speech recognition is not supported in your browser.');
      return;
    }

    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      speechService.startListening(
        (text) => {
          setInput(text);
          handleSubmit(text);
          setIsListening(false);
        },
        (error) => {
          setError(error);
          setIsListening(false);
        }
      );
    }
  };

  const stopSpeaking = () => {
    if (isSpeaking) {
      speechService.speak('');  
      setIsSpeaking(false);
    }
  };

  const handleFormationGenerate = async () => {
    try {
      setLoading(true);
      const result = await generateFormation(formation);
      setFormationData(result);
      setResponse(result.analysis);
      setError(null);
    } catch (err) {
      setError('Error generating formation. Please try again.');
      console.error('Formation generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTacticalPlay = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3006/api/tactical-plays/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tacticalPrompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate tactical play');
      }

      const data = await response.json();
      setTacticalPlay(data.tacticalPlay);
      setResponse(data.analysis);
      setError(null);
    } catch (err) {
      setError('Error generating tactical play. Please try again.');
      console.error('Tactical play generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="basic tabs example">
          <Tab label="Chat" />
          <Tab label="Tactical Plays" />
          <Tab label="Formations" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Typography variant="h5" gutterBottom>
          Football Coach AI Assistant
        </Typography>

        <div className="messages-container">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
            >
              <div className="message-content">
                {message.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="message assistant-message">
              <div className="message-content">Thinking...</div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
          <Button
            onClick={handleVoiceInput}
            variant="contained"
            color={isListening ? "secondary" : "primary"}
            sx={{ minWidth: 'auto', p: 1 }}
          >
            {isListening ? '🔴' : '🎤'}
          </Button>

          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            placeholder="Ask me about football tactics, strategies, or specific game situations..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit(input)}
            disabled={isListening}
            sx={{ mb: 2 }}
          />

          {isSpeaking && (
            <Button
              onClick={stopSpeaking}
              variant="contained"
              color="secondary"
              sx={{ minWidth: 'auto', p: 1 }}
            >
              🔇
            </Button>
          )}

          <Button
            variant="contained"
            color="primary"
            onClick={() => handleSubmit(input)}
            disabled={!input.trim() || loading}
          >
            Send
          </Button>
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Typography variant="h5" gutterBottom>
          Generate Tactical Plays
        </Typography>

        <TextField
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          placeholder="Describe the tactical play you want to generate (e.g., 'Quick counter-attack starting from the goalkeeper, with wingers making diagonal runs')"
          value={tacticalPrompt}
          onChange={(e) => setTacticalPrompt(e.target.value)}
          sx={{ mb: 2 }}
        />

        <Button
          variant="contained"
          color="primary"
          onClick={handleGenerateTacticalPlay}
          disabled={loading || !tacticalPrompt.trim()}
        >
          Generate Play
        </Button>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Typography variant="h5" gutterBottom>
          Formations
        </Typography>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Formation</InputLabel>
          <Select
            value={formation}
            label="Formation"
            onChange={(e) => setFormation(e.target.value)}
          >
            <MenuItem value="4-4-2">4-4-2</MenuItem>
            <MenuItem value="4-3-3">4-3-3</MenuItem>
            <MenuItem value="3-5-2">3-5-2</MenuItem>
            <MenuItem value="4-2-3-1">4-2-3-1</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="contained"
          color="primary"
          onClick={handleFormationGenerate}
          disabled={loading}
          sx={{ mr: 2 }}
        >
          Generate Formation
        </Button>
      </TabPanel>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <CircularProgress />
        </Box>
      )}

      {response && (
        <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Analysis
          </Typography>
          {typeof response === 'string' ? (
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {response}
            </Typography>
          ) : (
            <>
              {response.summary && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Summary
                  </Typography>
                  <Typography variant="body1">
                    {response.summary}
                  </Typography>
                </Box>
              )}
              
              {response.tacticalAnalysis && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Tactical Analysis
                  </Typography>
                  <Typography variant="body1">
                    {response.tacticalAnalysis}
                  </Typography>
                </Box>
              )}
              
              {response.keyPlayers && response.keyPlayers.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Key Players
                  </Typography>
                  <ul>
                    {response.keyPlayers.map((player: string, index: number) => (
                      <Typography component="li" key={index}>
                        {player}
                      </Typography>
                    ))}
                  </ul>
                </Box>
              )}
              
              {response.recommendations && response.recommendations.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Recommendations
                  </Typography>
                  <ul>
                    {response.recommendations.map((rec: string, index: number) => (
                      <Typography component="li" key={index}>
                        {rec}
                      </Typography>
                    ))}
                  </ul>
                </Box>
              )}
              
              {response.variants && response.variants.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Tactical Variants
                  </Typography>
                  <ul>
                    {response.variants.map((variant: string, index: number) => (
                      <Typography component="li" key={index}>
                        {variant}
                      </Typography>
                    ))}
                  </ul>
                </Box>
              )}
            </>
          )}
        </Paper>
      )}

      {tacticalPlay && (
        <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Generated Tactical Play
          </Typography>
          <pre style={{ overflow: 'auto', maxHeight: '300px' }}>
            {JSON.stringify(tacticalPlay, null, 2)}
          </pre>
        </Paper>
      )}

      {formationData && (
        <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Generated Formation
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Formation: {formation}
          </Typography>
          <pre style={{ overflow: 'auto', maxHeight: '300px' }}>
            {JSON.stringify(formationData.formation, null, 2)}
          </pre>
        </Paper>
      )}
    </Box>
  );
};

export default CoachAI;
