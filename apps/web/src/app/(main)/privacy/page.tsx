import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — RubbishReview",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4" style={{ backgroundColor: "var(--or-bg)" }}>
      <div className="max-w-[850px]">
        <h1 className="text-[2.25rem] font-normal mb-4 mt-4" style={{ color: "var(--or-dark-blue)" }}>
          Privacy Policy
        </h1>

        <div className="text-sm space-y-4" style={{ color: "var(--or-dark-blue)" }}>
          <p className="text-xs text-[var(--or-subtle-gray)]">Last updated: January 2026</p>

          <h3 className="text-base font-normal mt-6 mb-2" style={{ color: "var(--or-dark-blue)" }}>1. Information We Collect</h3>
          <p>When you create an account, we collect:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Email address</li>
            <li>Username and display name</li>
            <li>Institution and research field (optional)</li>
            <li>Profile biography (optional)</li>
          </ul>
          <p>When you use the platform, we automatically collect:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Usage data (pages visited, actions taken)</li>
            <li>Device and browser information</li>
            <li>IP address</li>
          </ul>

          <h3 className="text-base font-normal mt-6 mb-2" style={{ color: "var(--or-dark-blue)" }}>2. How We Use Your Information</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>To provide and maintain the RubbishReview platform</li>
            <li>To authenticate your identity</li>
            <li>To send notifications about activity on your submissions</li>
            <li>To improve the platform experience</li>
          </ul>

          <h3 className="text-base font-normal mt-6 mb-2" style={{ color: "var(--or-dark-blue)" }}>3. Information Sharing</h3>
          <p>
            We do not sell your personal information. Your public profile information (username, display name, 
            institution, bio) is visible to other users. Your email address is never publicly displayed.
          </p>

          <h3 className="text-base font-normal mt-6 mb-2" style={{ color: "var(--or-dark-blue)" }}>4. Data Storage</h3>
          <p>
            Your data is stored securely using Supabase infrastructure. We implement appropriate technical 
            and organizational measures to protect your personal data.
          </p>

          <h3 className="text-base font-normal mt-6 mb-2" style={{ color: "var(--or-dark-blue)" }}>5. Your Rights</h3>
          <p>You have the right to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your account and data</li>
            <li>Export your data</li>
          </ul>

          <h3 className="text-base font-normal mt-6 mb-2" style={{ color: "var(--or-dark-blue)" }}>6. Cookies</h3>
          <p>
            We use essential cookies for authentication and session management. No third-party tracking 
            cookies are used.
          </p>

          <h3 className="text-base font-normal mt-6 mb-2" style={{ color: "var(--or-dark-blue)" }}>7. Changes to This Policy</h3>
          <p>
            We may update this privacy policy from time to time. We will notify you of any significant 
            changes via email or platform notification.
          </p>

          <h3 className="text-base font-normal mt-6 mb-2" style={{ color: "var(--or-dark-blue)" }}>8. Contact</h3>
          <p>
            If you have questions about this privacy policy, please contact us through the platform.
          </p>
        </div>

        <div className="my-8" />
      </div>
    </div>
  );
}
