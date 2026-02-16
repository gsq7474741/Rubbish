import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — RubbishReview",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4" style={{ backgroundColor: "var(--or-bg)" }}>
      <div className="max-w-[850px]">
        <h1 className="text-[2.25rem] font-normal mb-4 mt-4" style={{ color: "var(--or-dark-blue)" }}>
          Terms of Service
        </h1>

        <div className="text-sm space-y-4" style={{ color: "var(--or-dark-blue)" }}>
          <p className="text-xs text-[var(--or-subtle-gray)]">Last updated: January 2026</p>

          <h3 className="text-base font-normal mt-6 mb-2" style={{ color: "var(--or-dark-blue)" }}>1. Acceptance of Terms</h3>
          <p>
            By accessing or using RubbishReview, you agree to be bound by these Terms of Service. If you do not agree 
            to these terms, please do not use the platform.
          </p>

          <h3 className="text-base font-normal mt-6 mb-2" style={{ color: "var(--or-dark-blue)" }}>2. Description of Service</h3>
          <p>
            RubbishReview is an entertainment and community platform for sharing academic failures, negative results, 
            and humorous research content. It is <strong>not</strong> a formal academic publication venue. Content 
            published on RubbishReview should not be cited as peer-reviewed academic work.
          </p>

          <h3 className="text-base font-normal mt-6 mb-2" style={{ color: "var(--or-dark-blue)" }}>3. User Accounts</h3>
          <p>
            You are responsible for maintaining the security of your account and password. You are responsible 
            for all activities that occur under your account.
          </p>

          <h3 className="text-base font-normal mt-6 mb-2" style={{ color: "var(--or-dark-blue)" }}>4. User Content</h3>
          <p>
            You retain ownership of content you submit to RubbishReview. By submitting content, you grant RubbishReview a 
            non-exclusive, worldwide license to display, distribute, and promote your content on the platform.
          </p>

          <h3 className="text-base font-normal mt-6 mb-2" style={{ color: "var(--or-dark-blue)" }}>5. Prohibited Conduct</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Harassment, abuse, or threats toward other users</li>
            <li>Submitting plagiarized content</li>
            <li>Spam or automated submissions</li>
            <li>Attempting to manipulate reviews or scores</li>
            <li>Any illegal activity</li>
          </ul>

          <h3 className="text-base font-normal mt-6 mb-2" style={{ color: "var(--or-dark-blue)" }}>6. Termination</h3>
          <p>
            We reserve the right to suspend or terminate accounts that violate these terms or our 
            Community Guidelines at our sole discretion.
          </p>

          <h3 className="text-base font-normal mt-6 mb-2" style={{ color: "var(--or-dark-blue)" }}>7. Disclaimer</h3>
          <p>
            RubbishReview is provided &quot;as is&quot; without warranties of any kind. We do not guarantee the accuracy, 
            completeness, or usefulness of any content on the platform — in fact, we guarantee the opposite.
          </p>

          <h3 className="text-base font-normal mt-6 mb-2" style={{ color: "var(--or-dark-blue)" }}>8. Changes to Terms</h3>
          <p>
            We may update these terms from time to time. Continued use of the platform after changes 
            constitutes acceptance of the new terms.
          </p>
        </div>

        <div className="my-8" />
      </div>
    </div>
  );
}
