import React from 'react';
import type { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: "NICU Tracker - Supporting Parents on their NICU Journey",
  description: "A calm, simple, and secure way to track your baby's NICU progress, feedings, weight changes, milestones, and care team questions.",
};

export default function Home() {
  return <HomeClient />;
}
