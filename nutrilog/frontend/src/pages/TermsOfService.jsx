import React from 'react';
import { Link } from 'react-router-dom';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <Link to="/" className="text-primary-600 hover:underline text-sm">&larr; Back</Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-4 mb-2">Terms of Service</h1>
        <p className="text-gray-500 text-sm mb-8">Last updated: {new Date().toLocaleDateString()}</p>
        <div className="space-y-6 text-gray-700 dark:text-slate-300">
          <section><h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">1. Acceptance of Terms</h2><p>By accessing and using NutriLog, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.</p></section>
          <section><h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2. Not Medical Advice</h2><p className="font-medium text-red-600 dark:text-red-400">IMPORTANT: NutriLog is a general wellness app and is NOT a medical device. The information provided is for informational purposes only and does not constitute medical advice. Always consult a qualified healthcare provider before making changes to your diet, exercise routine, or health regimen.</p></section>
          <section><h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3. Subscription and Payments</h2><p>Paid subscriptions are billed monthly. You may cancel at any time. Cancellation takes effect at the end of your current billing period. Refunds are not provided for partial months.</p></section>
          <section><h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4. User Conduct</h2><p>You agree not to use NutriLog to: (a) violate any laws; (b) upload harmful content; (c) attempt to gain unauthorized access; (d) share another user's personal information without consent.</p></section>
          <section><h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">5. Intellectual Property</h2><p>NutriLog and its original content, features, and functionality are owned by NutriLog and are protected by international copyright, trademark, and other intellectual property laws.</p></section>
          <section><h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">6. Limitation of Liability</h2><p>NutriLog shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.</p></section>
          <section><h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">7. Contact</h2><p>Questions about these terms? Contact us at: <a href="mailto:legal@nutrilog.com" className="text-primary-600">legal@nutrilog.com</a></p></section>
        </div>
      </div>
    </div>
  );
}
