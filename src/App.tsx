import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Lazy load components for better performance
const LoginForm = React.lazy(() => import('./components/Auth/LoginForm'));
const Sidebar = React.lazy(() => import('./components/Layout/Sidebar'));
const Header = React.lazy(() => import('./components/Layout/Header'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Leads = React.lazy(() => import('./pages/Leads'));
const Vehicles = React.lazy(() => import('./pages/Vehicles'));
const Appointments = React.lazy(() => import('./pages/Appointments'));
const Users = React.lazy(() => import('./pages/Users'));
const Reports = React.lazy(() => import('./pages/Reports'));
const Catalog = React.lazy(() => import('./pages/Catalog'));
const CatalogEditor = React.lazy(() => import('./pages/CatalogEditor'));
const Settings = React.lazy(() => import('./pages/Settings'));
const Integrations = React.lazy(() => import('./pages/Integrations'));

const AppContent: React.FC = () => {
  const { user, adminUser, logout, authLoading } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCatalog, setShowCatalog] = useState(false);

  // Check if we should show catalog (public view)
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const catalogParam = urlParams.get('catalog');
    const adminParam = urlParams.get('admin');
    
    console.log('🔍 Verificando parâmetros da URL:');
    console.log('  catalog:', catalogParam);
    console.log('  admin:', adminParam);
    
    if (catalogParam === 'true' && adminParam) {
      setShowCatalog(true);
      console.log('✅ Modo catálogo ativado para admin:', adminParam);
    }
  }, []);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Show public catalog if requested
  if (showCatalog) {
    return (
      <React.Suspense fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }>
        <Catalog />
      </React.Suspense>
    );
  }
  
  if (!user) {
    return (
      <React.Suspense fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }>
        <LoginForm />
      </React.Suspense>
    );
  }

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'dashboard':
        return 'Dashboard';
      case 'leads':
        return 'CRM - Gestão de Leads';
      case 'vehicles':
        return 'Estoque de Veículos';
      case 'appointments':
        return 'Agendamentos';
      case 'users':
        return 'Gestão de Usuários';
      case 'reports':
        return 'Relatórios';
      case 'catalog-editor':
        return 'Editor do Catálogo';
      case 'settings':
        return 'Configurações';
      case 'integrations':
        return 'Integrações';
      default:
        return 'Dashboard';
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <React.Suspense fallback={<div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div></div>}>
            <Dashboard />
          </React.Suspense>
        );
      case 'leads':
        return (
          <React.Suspense fallback={<div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div></div>}>
            <Leads />
          </React.Suspense>
        );
      case 'vehicles':
        return (
          <React.Suspense fallback={<div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div></div>}>
            <Vehicles />
          </React.Suspense>
        );
      case 'appointments':
        return (
          <React.Suspense fallback={<div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div></div>}>
            <Appointments />
          </React.Suspense>
        );
      case 'users':
        return (
          <React.Suspense fallback={<div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div></div>}>
            <Users />
          </React.Suspense>
        );
      case 'reports':
        return (
          <React.Suspense fallback={<div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div></div>}>
            <Reports />
          </React.Suspense>
        );
      case 'catalog-editor':
        return (
          <React.Suspense fallback={<div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div></div>}>
            <CatalogEditor />
          </React.Suspense>
        );
      case 'settings':
        return (
          <React.Suspense fallback={<div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div></div>}>
            <Settings />
          </React.Suspense>
        );
      case 'integrations':
        return (
          <React.Suspense fallback={<div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div></div>}>
            <Integrations />
          </React.Suspense>
        );
      default:
        return (
          <React.Suspense fallback={<div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div></div>}>
            <Dashboard />
          </React.Suspense>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 relative">
      <React.Suspense fallback={<div className="w-64 bg-slate-800"></div>}>
        <Sidebar 
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
      </React.Suspense>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <React.Suspense fallback={<div className="h-16 bg-white border-b border-gray-200"></div>}>
          <Header 
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          />
        </React.Suspense>
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {renderSection()}
        </main>
      </div>
      
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/*" element={<AppContent />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;