import React from 'react';
import { 
  BrowserRouter,
  Routes,
  Route
} from 'react-router-dom';
import TacticalBoard from './components/TacticalBoard';
import Layout from './components/Layout';
import CoachAI from './components/AIAssistant/CoachAI';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<TacticalBoard />} />
          <Route path="/coach" element={<CoachAI />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
