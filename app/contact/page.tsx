'use client';

import React, { useState } from 'react';
import { saveContactSubmission } from '../../lib/dbService';
import { Mail, MessageSquare, Send, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Parent');
  const [message, setMessage] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      // Save message to Firestore/LocalStorage via dbService
      await saveContactSubmission({
        name,
        email,
        role,
        message
      });

      setSubmitSuccess(true);
      setName('');
      setEmail('');
      setRole('Parent');
      setMessage('');
    } catch (error: any) {
      console.error("Error submitting contact form:", error);
      setSubmitError(
        "We couldn't save your request directly to our database. Please verify your connection or email support at support@nicutracker.com."
      );
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="bg-[#fafbfb] py-16 md:py-24 animate-fade-in flex-grow flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 bg-white rounded-3xl border border-[#e2ecec] shadow-sm overflow-hidden">
          
          {/* Info Panel */}
          <div className="md:col-span-5 bg-[#4a7a7c] text-white p-8 md:p-12 flex flex-col justify-between gap-8">
            <div className="space-y-4">
              <h2 className="font-heading font-bold text-2xl">Get in touch</h2>
              <p className="text-xs leading-relaxed text-primary-100">
                Have questions about our security models, data backup policies, or suggestions for custom tracker metrics? Drop us a note and we'll reply within 24 hours.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary-200" />
                <span>support@nicutracker.com</span>
              </div>
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-primary-200" />
                <span>Active Developer Support</span>
              </div>
            </div>

            <div className="text-[10px] text-primary-200 italic leading-relaxed border-t border-[#3c6365] pt-4">
              * For medical emergencies or urgent clinical questions, please ring the call light in your baby's room or call 911 immediately.
            </div>
          </div>

          {/* Form Panel */}
          <div className="md:col-span-7 p-8 md:p-12">
            <h3 className="font-heading font-bold text-lg text-[#2a3b3c] mb-6">Send us a message</h3>
            
            {submitSuccess && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex gap-2 items-start animate-fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                <div>
                  <strong>Message Sent Successfully!</strong>
                  <p className="mt-1 text-emerald-700">Thank you for reaching out. We have logged your request and will contact you shortly.</p>
                </div>
              </div>
            )}

            {submitError && (
              <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex gap-2 items-start animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <strong>Notice:</strong>
                  <p className="mt-1 text-amber-800">{submitError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#5f7475] mb-1.5" htmlFor="contact-name">
                  Full Name
                </label>
                <input 
                  type="text" 
                  id="contact-name"
                  required
                  placeholder="Enter name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5f7475] mb-1.5" htmlFor="contact-email">
                  Email Address
                </label>
                <input 
                  type="email" 
                  id="contact-email"
                  required
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5f7475] mb-1.5" htmlFor="contact-role">
                  Your Role
                </label>
                <select 
                  id="contact-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="input-field text-sm bg-white"
                >
                  <option value="Parent">NICU Parent</option>
                  <option value="Caregiver">Family Caregiver / Relative</option>
                  <option value="Nurse">NICU Nurse / Clinician</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5f7475] mb-1.5" htmlFor="contact-message">
                  How can we help?
                </label>
                <textarea 
                  id="contact-message"
                  required
                  rows={4}
                  placeholder="Type your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="input-field text-sm resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl font-semibold text-white bg-[#4a7a7c] hover:bg-[#3c6365] disabled:bg-primary-300 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
