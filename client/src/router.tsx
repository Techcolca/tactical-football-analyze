import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './components/Layout';
import TacticalBoard from './components/TacticalBoard';
import CoachAI from './components/AIAssistant/CoachAI';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <TacticalBoard />
      },
      {
        path: '/coach-ai',
        element: <CoachAI />
      }
    ]
  }
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
});

export default function Router() {
  return <RouterProvider router={router} />;
}
