import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineContent,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector,
} from '@mui/lab';
import {
  Refresh as RefreshIcon,
  TrendingUp,
  Speed,
  Assessment,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { IPlayer } from '../../types/player';
import { Formation } from '../../types/collaboration';

interface PredictiveInsightsProps {
  team: IPlayer[];
  formation: Formation;
  opponent: string;
  matchEvents: any[];
  onRefresh: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const PredictiveInsights: React.FC<PredictiveInsightsProps> = ({
  team,
  formation,
  opponent,
  matchEvents,
  onRefresh,
}) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<any>(null);

  useEffect(() => {
    loadInsights();
  }, [team, formation, opponent]);

  const loadInsights = async () => {
    setLoading(true);
    try {
      // Aquí iría la llamada al servicio de predicción
      // const data = await predictiveAnalysisService.getInsights(...);
      // setInsights(data);
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Análisis Predictivo</Typography>
        <Tooltip title="Actualizar análisis">
          <IconButton onClick={onRefresh}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        textColor="primary"
        indicatorColor="primary"
        variant="fullWidth"
      >
        <Tab icon={<TrendingUp />} label="Tendencias" />
        <Tab icon={<Speed />} label="Rendimiento" />
        <Tab icon={<Assessment />} label="Táctico" />
      </Tabs>

      {/* Tendencias */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: 'background.default',
                height: '300px',
              }}
            >
              <Typography variant="subtitle2" gutterBottom>
                Evolución del Rendimiento
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={insights?.trends?.performance || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Line
                    type="monotone"
                    dataKey="rating"
                    stroke={theme.palette.primary.main}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: 'background.default',
                height: '300px',
              }}
            >
              <Typography variant="subtitle2" gutterBottom>
                Posesión y Control
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={insights?.trends?.possession || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="minute" />
                  <YAxis />
                  <RechartsTooltip />
                  <Area
                    type="monotone"
                    dataKey="possession"
                    stroke={theme.palette.success.main}
                    fill={theme.palette.success.main}
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: 'background.default',
                height: '300px',
              }}
            >
              <Typography variant="subtitle2" gutterBottom>
                Presión y Territorio
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={insights?.trends?.pressure || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="minute" />
                  <YAxis />
                  <RechartsTooltip />
                  <Area
                    type="monotone"
                    dataKey="pressure"
                    stroke={theme.palette.warning.main}
                    fill={theme.palette.warning.main}
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Rendimiento */}
      <TabPanel value={tabValue} index={1}>
        <Timeline position="alternate">
          {insights?.performance?.predictions?.map((prediction: any, index: number) => (
            <TimelineItem key={index}>
              <TimelineSeparator>
                <TimelineDot color="primary" />
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: 'background.default',
                  }}
                >
                  <Typography variant="subtitle2">
                    {prediction.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {prediction.description}
                  </Typography>
                  <Box mt={1}>
                    <Typography variant="caption" color="primary">
                      Confianza: {prediction.confidence}%
                    </Typography>
                  </Box>
                </Paper>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </TabPanel>

      {/* Táctico */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={2}>
          {insights?.tactical?.recommendations?.map((recommendation: any, index: number) => (
            <Grid item xs={12} key={index}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: 'background.default',
                  borderLeft: 4,
                  borderColor: 'primary.main',
                }}
              >
                <Typography variant="subtitle2">{recommendation.title}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {recommendation.description}
                </Typography>
                <Box
                  mt={1}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="caption" color="primary">
                    Impacto: {recommendation.impact}
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    Prioridad: {recommendation.priority}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </TabPanel>
    </Box>
  );
};

export default PredictiveInsights;
