import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from './pages/Dashboard';
import Funds from './pages/Funds';
import FundDetails from './pages/FundDetails';
import DeploymentCenter from './pages/DeploymentCenter';
import DeploymentJournal from './pages/DeploymentJournal';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import AppLayout from './layouts/AppLayout';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/funds" element={<Funds />} />
            <Route path="/funds/:id" element={<FundDetails />} />
            <Route path="/deployment-center" element={<DeploymentCenter />} />
            <Route path="/deployment-journal" element={<DeploymentJournal />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </AppLayout>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
