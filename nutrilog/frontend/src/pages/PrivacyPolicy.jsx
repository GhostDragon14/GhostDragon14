import React from 'react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <Link to="/" className="text-primary-600 hover:underline text-sm">&larr; Back</Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-4 mb-2">Privacy Policy</h1>
        <p className="text-gray-500 text-sm mb-8">Last updated: {new Date().toLocaleDateString()}</p>
        <div className="prose dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-slate-300">
          <section><h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">1. Information We Collect</h2><p>We collect information you provide directly to us, including your name, email address, and health/fitness data you choose to track. This includes food logs, workout data, weight measurements, water intake, and step counts.</p></section>
          <section><h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2. How We Use Your Information</h2><p>We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you. We use your health data solely to provide personalized tracking and analytics features.</p></section>
          <section><h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3. GDPR Rights</h2><p>If you are in the European Union, you have the following rights:</p><ul className="list-disc pl-6 mt-2 space-y-1"><li>Right to access your personal data</li><li>Right to rectification of inaccurate data</li><li>Right to erasure (right to be forgotten)</li><li>Right to data portability</li><li>Right to object to processing</li></ul><p className="mt-2">To exercise these rights, contact us at privacy@nutrilog.com.</p></section>
          <section><h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4. Data Security</h2><p>We implement industry-standard security measures to protect your personal information, including encryption in transit and at rest, secure authentication tokens, and regular security audits.</p></section>
          <section><h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">5. Third-Party Services</h2><p>We integrate with third-party services including Nutritionix, USDA FoodData Central, Stripe for payments, Cloudinary for photo storage, and optionally Strava and Google Fit. These services have their own privacy policies.</p></section>
          <section><h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">6. Contact</h2><p>For privacy inquiries, contact us at: <a href="mailto:privacy@nutrilog.com" className="text-primary-600">privacy@nutrilog.com</a></p></section>
        </div>
      </div>
    </div>
  );
}
