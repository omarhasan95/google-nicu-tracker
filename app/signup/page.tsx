import React from 'react';
import type { Metadata } from 'next';
import SignupClient from './SignupClient';

export const metadata: Metadata = {
  title: "Sign Up - RIMS NICU Tracker",
  description: "Create a secure, private account to start tracking your baby's NICU logs, feedings, and progress reports.",
};

export default function Signup() {
  return <SignupClient />;
}
