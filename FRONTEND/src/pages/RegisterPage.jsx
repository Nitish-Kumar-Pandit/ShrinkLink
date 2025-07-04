import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import RegisterForm from '../components/RegisterForm';

const RegisterPage = () => {
  const navigate = useNavigate();

  const handleSwitchToLogin = () => {
    navigate({ to: '/auth' });
  };

  return <RegisterForm state={handleSwitchToLogin} />;
};

export default RegisterPage;
