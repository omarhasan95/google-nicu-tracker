import React from 'react';
import type { Metadata } from 'next';
import ForgotPasswordClient from './ForgotPasswordClient';

export const metadata: Metadata = {
  title: "Reset Password - RIMS NICU Tracker",
  description: "Request a secure password recovery email to regain access to your private baby progression logs.",
};

export default function ForgotPassword() {
  return <ForgotPasswordClient />;
}
