import React from 'react';
import type { Metadata } from 'next';
import ContactClient from './ContactClient';

export const metadata: Metadata = {
  title: "Contact Us - RIMS NICU Tracker",
  description: "Get in touch with the NICU Tracker team regarding security questions, data features, or suggestions.",
};

export default function Contact() {
  return <ContactClient />;
}
