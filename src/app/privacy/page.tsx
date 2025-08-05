import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Privacy Policy</CardTitle>
            <CardDescription>
              Last updated: {new Date().toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-sm leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
              <p className="mb-3">
                P2P ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
              <h3 className="text-lg font-medium mb-2">2.1 Personal Information</h3>
              <p className="mb-3">
                When you use our Service, we may collect the following personal information:
              </p>
              <ul className="list-disc pl-6 mb-3 space-y-1">
                <li>Email address (from Google OAuth)</li>
                <li>Display name (from Google OAuth)</li>
                <li>Profile picture (from Google OAuth)</li>
                <li>Account creation and last sign-in timestamps</li>
                <li>Authentication tokens and session information</li>
              </ul>

              <h3 className="text-lg font-medium mb-2">2.2 Usage Information</h3>
              <p className="mb-3">
                We may also collect information about how you use our Service:
              </p>
              <ul className="list-disc pl-6 mb-3 space-y-1">
                <li>IP address and device information</li>
                <li>Browser type and version</li>
                <li>Pages visited and time spent on the Service</li>
                <li>Error logs and performance data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
              <p className="mb-3">We use the collected information for the following purposes:</p>
              <ul className="list-disc pl-6 mb-3 space-y-1">
                <li>To provide and maintain our Service</li>
                <li>To authenticate and authorize users</li>
                <li>To personalize your experience</li>
                <li>To communicate with you about your account</li>
                <li>To improve our Service and develop new features</li>
                <li>To ensure the security of our Service</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Information Sharing and Disclosure</h2>
              <p className="mb-3">We do not sell, trade, or otherwise transfer your personal information to third parties except in the following circumstances:</p>
              <ul className="list-disc pl-6 mb-3 space-y-1">
                <li><strong>Service Providers:</strong> We may share information with trusted third-party service providers who assist us in operating our Service</li>
                <li><strong>Legal Requirements:</strong> We may disclose information if required by law or in response to valid legal requests</li>
                <li><strong>Safety and Security:</strong> We may share information to protect the safety and security of our users and Service</li>
                <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, user information may be transferred</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Google OAuth Integration</h2>
              <p className="mb-3">
                Our Service uses Google OAuth for authentication. When you sign in with Google, we receive:
              </p>
              <ul className="list-disc pl-6 mb-3 space-y-1">
                <li>Your Google account email address</li>
                <li>Your Google display name</li>
                <li>Your Google profile picture (if available)</li>
                <li>Authentication tokens for session management</li>
              </ul>
              <p className="mb-3">
                We do not have access to your Google password or other Google account information. Your use of Google OAuth is also subject to Google's Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Data Security</h2>
              <p className="mb-3">
                We implement appropriate security measures to protect your personal information:
              </p>
              <ul className="list-disc pl-6 mb-3 space-y-1">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure authentication through Firebase</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication requirements</li>
                <li>Secure data storage practices</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Data Retention</h2>
              <p className="mb-3">
                We retain your personal information for as long as necessary to provide our Service and fulfill the purposes outlined in this Privacy Policy. We may retain certain information for longer periods if required by law or for legitimate business purposes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Your Rights and Choices</h2>
              <p className="mb-3">You have the following rights regarding your personal information:</p>
              <ul className="list-disc pl-6 mb-3 space-y-1">
                <li><strong>Access:</strong> Request access to your personal information</li>
                <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
                <li><strong>Objection:</strong> Object to certain processing of your information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Cookies and Tracking</h2>
              <p className="mb-3">
                We may use cookies and similar tracking technologies to enhance your experience on our Service. These technologies help us:
              </p>
              <ul className="list-disc pl-6 mb-3 space-y-1">
                <li>Maintain your authentication session</li>
                <li>Remember your preferences</li>
                <li>Analyze how our Service is used</li>
                <li>Improve our Service performance</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Children's Privacy</h2>
              <p className="mb-3">
                Our Service is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">11. International Data Transfers</h2>
              <p className="mb-3">
                Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws and implement appropriate safeguards to protect your information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">12. Changes to This Privacy Policy</h2>
              <p className="mb-3">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">13. Contact Us</h2>
              <p className="mb-3">
                If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
              </p>
              <p className="mb-3">
                Email: privacy@p2p.com<br />
                Address: [Your Business Address]<br />
                Phone: [Your Phone Number]
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 