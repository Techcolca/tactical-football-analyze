import React from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route,
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements
} from 'react-router-dom';
import TacticalBoard from './components/TacticalBoard';
import Layout from './components/Layout';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Layout />}>
      <Route path="/" element={<TacticalBoard />} />
    </Route>
  ),
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }
  }
);

const App: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default App;
