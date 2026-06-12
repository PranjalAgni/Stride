import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Dashboard from './routes/Dashboard';
import History from './routes/History';
import Calendar from './routes/Calendar';
import Badges from './routes/Badges';
import Settings from './routes/Settings';
import { BottomTabs } from './components/BottomTabs';
import { useTheme } from './hooks/useTheme';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      >
        <Routes location={location}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/history" element={<History />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/badges" element={<Badges />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function Shell() {
  useTheme();
  return (
    <div className="min-h-full mx-auto max-w-md pb-24">
      <AnimatedRoutes />
      <BottomTabs />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  );
}
