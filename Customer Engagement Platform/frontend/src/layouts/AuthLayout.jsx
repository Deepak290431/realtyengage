import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';

const AuthLayout = () => {
  return (
    <div className="w-full h-full min-h-screen flex">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
