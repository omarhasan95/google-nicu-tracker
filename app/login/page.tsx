import React from 'react';
import type { Metadata } from 'next';
import LoginClient from './LoginClient';

export const metadata: Metadata = {
  title: "Log In - RIMS NICU Tracker",
  description: "Access your baby's private NICU progress journal, logs, and care questions in our secure dashboard.",
};

export default function Login() {
  return <LoginClient />;
}
