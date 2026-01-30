import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import AdminSidebar from '../components/layout/AdminSidebar';
import Header from '../components/layout/Header';
import AIChatbot from '../components/chatbot/AIChatbot';

const DashboardLayout = ({ isAdmin = false }) => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default', pt: isAdmin ? { xs: '64px', lg: 0 } : '64px' }}>
      {(!isAdmin) ? <Header /> : <div className="lg:hidden"><Header /></div>}
      {isAdmin && <AdminSidebar onToggleChatbot={() => setIsChatbotOpen(true)} />}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0,
          width: { lg: isAdmin ? `calc(100% - 288px)` : '100%' },
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div className="flex-1 w-full relative">
          <Outlet />
        </div>
      </Box>
      {/* AI Chatbot - Rendered at root level */}
      {isAdmin && <AIChatbot isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} />}
    </Box>
  );
};

export default DashboardLayout;
