import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community Guidelines — RubbishReview",
};

export default function GuidelinesPage() {
  return (
    <div className="container mx-auto px-4" style={{ backgroundColor: "var(--or-bg)" }}>
      <div className="max-w-[850px]">
        <h1 className="text-[2.25rem] font-normal mb-4 mt-4" style={{ color: "var(--or-dark-blue)" }}>
          Community Guidelines
        </h1>

        <div className="text-sm space-y-4" style={{ color: "var(--or-dark-blue)" }}>
          <p>
            RubbishReview is a community built on humor, honesty, and the shared experience of academic failure. 
            To keep this space enjoyable for everyone, please follow these guidelines.
          </p>

          <h3 className="text-base font-normal mt-6 mb-2" style={{ color: "var(--or-dark-blue)" }}>1. Be Respectful</h3>
          <p>
            We laugh at failed experiments, not at people. Personal attacks, harassment, and discrimination 
            are strictly prohibited. Critique the work, not the researcher.
          </p>

          <h3 className="text-base font-normal mt-6 mb-2" style={{ color: "var(--or-dark-blue)" }}>2. Keep It Academic</h3>
          <p>
            Submissions should be related to academic research, experiments, or scholarly work — even if 
            the results are completely useless. Off-topic content will be removed.
          </p>

          <h3 className="text-base font-normal mt-6 mb-2" style={{ color: "var(--or-dark-blue)" }}>3. Original Content</h3>
          <p>
            Submit your own work or content you have permission to share. Do not plagiarize or submit 
            others&apos; work without attribution.
          </p>

          <h3 className="text-base font-normal mt-6 mb-2" style={{ color: "var(--or-dark-blue)" }}>4. Honest Reviews</h3>
          <p>
            When reviewing papers, provide genuine and constructive feedback. Rate papers fairly on the 
            Rubbish Score, Uselessness, and Entertainment dimensions. Do not engage in review manipulation.
          </p>

          <h3 className="text-base font-normal mt-6 mb-2" style={{ color: "var(--or-dark-blue)" }}>5. No Spam</h3>
          <p>
            Do not submit duplicate content, promotional material, or low-effort posts designed solely 
            to farm karma.
          </p>

          <h3 className="text-base font-normal mt-6 mb-2" style={{ color: "var(--or-dark-blue)" }}>6. Embrace Failure</h3>
          <p>
            The whole point of RubbishReview is to celebrate academic failures. Don&apos;t be afraid to share your 
            worst results. The more spectacularly useless, the better.
          </p>

          <h3 className="text-base font-normal mt-6 mb-2" style={{ color: "var(--or-dark-blue)" }}>Enforcement</h3>
          <p>
            Violations of these guidelines may result in content removal, temporary suspension, or 
            permanent ban depending on severity. If you see content that violates these guidelines, 
            please use the report function.
          </p>

          <div className="p-3 border border-[rgba(0,0,0,0.1)] mt-6" style={{ backgroundColor: "var(--or-sandy)" }}>
            <p className="text-xs text-[var(--or-subtle-gray)]">
              These guidelines may be updated from time to time. Last updated: January 2026.
            </p>
          </div>
        </div>

        <div className="my-8" />
      </div>
    </div>
  );
}
