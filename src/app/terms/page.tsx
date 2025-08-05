import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Terms of Service</CardTitle>
            <CardDescription>
              Last updated: {new Date().toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-sm leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p className="mb-3">
                By accessing and using P2P ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
              <p className="mb-3">
                P2P provides a platform for peer-to-peer interactions and authentication services. The Service allows users to create accounts, authenticate using Google OAuth, and manage their profiles.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
              <p className="mb-3">
                To use certain features of the Service, you must create an account. You are responsible for:
              </p>
              <ul className="list-disc pl-6 mb-3 space-y-1">
                <li>Maintaining the confidentiality of your account information</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use of your account</li>
                <li>Ensuring your account information is accurate and up-to-date</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Authentication and Security</h2>
              <p className="mb-3">
                Our Service uses Google OAuth for authentication. By using this service, you agree to:
              </p>
              <ul className="list-disc pl-6 mb-3 space-y-1">
                <li>Comply with Google's Terms of Service</li>
                <li>Provide accurate information during authentication</li>
                <li>Not attempt to circumvent security measures</li>
                <li>Report any security vulnerabilities you discover</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Acceptable Use</h2>
              <p className="mb-3">You agree not to use the Service to:</p>
              <ul className="list-disc pl-6 mb-3 space-y-1">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon the rights of others</li>
                <li>Transmit harmful, offensive, or inappropriate content</li>
                <li>Attempt to gain unauthorized access to the Service</li>
                <li>Interfere with the proper functioning of the Service</li>
                <li>Use the Service for any commercial purpose without permission</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Privacy and Data Protection</h2>
              <p className="mb-3">
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices regarding the collection and use of your information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Intellectual Property</h2>
              <p className="mb-3">
                The Service and its original content, features, and functionality are and will remain the exclusive property of P2P and its licensors. The Service is protected by copyright, trademark, and other laws.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Termination</h2>
              <p className="mb-3">
                We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Limitation of Liability</h2>
              <p className="mb-3">
                In no event shall P2P, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Changes to Terms</h2>
              <p className="mb-3">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">11. Contact Information</h2>
              <p className="mb-3">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <p className="mb-3">
                Email: legal@p2p.com<br />
                Address: [Your Business Address]
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 