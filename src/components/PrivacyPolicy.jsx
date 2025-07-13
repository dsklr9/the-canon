import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <div className="prose prose-invert">
          <p className="text-gray-400 mb-6"><strong>Last Updated: January 11, 2025</strong></p>
          
          <h2 className="text-xl font-bold mb-3">1. Information We Collect</h2>
          
          <h3 className="text-lg font-semibold mb-2">Information You Provide:</h3>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Email address and username</li>
            <li>Profile information from authentication providers (Google)</li>
            <li>Rankings and artist preferences</li>
            <li>Debate posts and comments</li>
            <li>Face-off votes</li>
          </ul>
          
          <h3 className="text-lg font-semibold mb-2">Automatically Collected Information:</h3>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Login timestamps</li>
            <li>Basic usage statistics (votes cast, lists created)</li>
            <li>Browser type and device information</li>
          </ul>
          
          <h2 className="text-xl font-bold mb-3">2. How We Use Your Information</h2>
          <p className="mb-4">We use collected information to:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Provide and maintain the Service</li>
            <li>Create aggregated rankings and statistics</li>
            <li>Personalize your experience</li>
            <li>Send service-related communications</li>
            <li>Improve the Service</li>
            <li>Prevent fraud and abuse</li>
          </ul>
          
          <h2 className="text-xl font-bold mb-3">3. Information Sharing</h2>
          <p className="mb-4">We do NOT sell your personal information. We may share information:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li><strong>Publicly</strong>: Your username, rankings, and debates are visible to other users</li>
            <li><strong>Aggregated Data</strong>: Vote counts and ranking statistics (anonymized)</li>
            <li><strong>Legal Requirements</strong>: If required by law or to protect rights and safety</li>
            <li><strong>Service Providers</strong>: With Supabase for authentication and data storage</li>
          </ul>
          
          <h2 className="text-xl font-bold mb-3">4. Data Storage and Security</h2>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Data is stored using Supabase's secure infrastructure</li>
            <li>We use industry-standard security measures</li>
            <li>However, no method of transmission over the Internet is 100% secure</li>
            <li>You are responsible for maintaining the security of your account credentials</li>
          </ul>
          
          <h2 className="text-xl font-bold mb-3">5. Your Rights and Choices</h2>
          <p className="mb-4">You have the right to:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Access your personal information</li>
            <li>Update or correct your information</li>
            <li>Delete your account and associated data</li>
            <li>Opt-out of non-essential communications</li>
          </ul>
          
          <h2 className="text-xl font-bold mb-3">6. Children's Privacy</h2>
          <p className="mb-6">
            The Service is not intended for children under 13. We do not knowingly collect information from children under 13. 
            If we discover such information, we will promptly delete it.
          </p>
          
          <h2 className="text-xl font-bold mb-3">7. Third-Party Services</h2>
          <p className="mb-4">We use:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li><strong>Supabase</strong>: For authentication and database services (Supabase Privacy Policy)</li>
            <li><strong>Google OAuth</strong>: For authentication (Google Privacy Policy)</li>
          </ul>
          
          <h2 className="text-xl font-bold mb-3">8. Cookies and Tracking</h2>
          <p className="mb-4">We use:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Essential cookies for authentication</li>
            <li>Local storage for user preferences</li>
            <li>No third-party tracking or advertising cookies</li>
          </ul>
          
          <h2 className="text-xl font-bold mb-3">9. Data Retention</h2>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Active account data is retained while your account is active</li>
            <li>Deleted accounts have personal information removed within 30 days</li>
            <li>Aggregated statistics may be retained indefinitely</li>
          </ul>
          
          <h2 className="text-xl font-bold mb-3">10. International Users</h2>
          <p className="mb-6">
            The Service is operated in the United States. By using the Service, you consent to the transfer and processing 
            of your information in the United States.
          </p>
          
          <h2 className="text-xl font-bold mb-3">11. California Privacy Rights</h2>
          <p className="mb-4">California residents have additional rights under the CCPA, including the right to:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Know what personal information is collected</li>
            <li>Request deletion of personal information</li>
            <li>Opt-out of the sale of personal information (we do not sell personal information)</li>
          </ul>
          
          <h2 className="text-xl font-bold mb-3">12. Changes to Privacy Policy</h2>
          <p className="mb-6">
            We may update this Privacy Policy periodically. We will notify users of material changes via email or Service notification.
          </p>
          
          <h2 className="text-xl font-bold mb-3">13. Contact Us</h2>
          <p className="mb-4">
            For privacy-related questions or to exercise your rights, contact: 
            <a href="mailto:info@thecanon.io" className="text-purple-400 hover:text-purple-300 ml-1">info@thecanon.io</a>
          </p>
          <p className="mb-6">
            To request data deletion, email: 
            <a href="mailto:info@thecanon.io?subject=Data%20Deletion%20Request" className="text-purple-400 hover:text-purple-300 ml-1">
              info@thecanon.io
            </a> with subject line "Data Deletion Request"
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;