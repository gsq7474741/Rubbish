import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — RubbishReview",
};

const venues = [
  { name: "Notrue", parody: "Nature", field: "综合 — 收录一切学术垃圾，只发表不自然的发现", slug: "notrue" },
  { name: "Dead Cell", parody: "Cell", field: "生物 — 养死细胞的心路历程，只收录死掉的", slug: "dead-cell" },
  { name: "Abandoned Materials", parody: "Advanced Materials", field: "化学 — 收率低于 0.5% 的实验，只收录被抛弃的", slug: "abandoned-materials" },
  { name: "The Fool", parody: "NeurIPS / ICML", field: "计算机 — 跑不通的代码和过拟合的模型", slug: "the-fool" },
];

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4" style={{ backgroundColor: "var(--or-bg)" }}>
      <div className="max-w-[850px]">
        <h1 className="text-[2.25rem] font-normal mb-4 mt-4" style={{ color: "var(--or-dark-blue)" }}>
          About RubbishReview
        </h1>

        <div className="text-sm space-y-4" style={{ color: "var(--or-dark-blue)" }}>
          <p>
            <strong style={{ color: "var(--or-green)" }}>RubbishReview</strong> is an open peer-review platform dedicated to academic failures,
            negative results, and spectacularly useless research. We believe that failed experiments deserve recognition too.
          </p>

          <h3 className="text-base font-normal mt-6 mb-2" style={{ color: "var(--or-dark-blue)" }}>Mission</h3>
          <p>
            In the world of academic publishing, only &quot;successful&quot; results get published. But what about the 90% of experiments
            that fail? What about the papers rejected seven times? What about the neural networks that predict nothing?
          </p>
          <p>
            RubbishReview provides a home for all of this — the academic rubbish that traditional journals refuse to touch.
            We offer open peer review, community engagement, and the prestigious &quot;Certified Rubbish&quot; designation.
          </p>

          <h3 className="text-base font-normal mt-6 mb-2" style={{ color: "var(--or-dark-blue)" }}>How It Works</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Submit</strong> — Share your failed experiments, rejected papers, or useless findings to a specific venue.</li>
            <li><strong>Review</strong> — Community members rate submissions on Rubbish Score, Uselessness, and Entertainment value.</li>
            <li><strong>Certify</strong> — Papers that meet our rigorous standards of uselessness receive the &quot;Certified Rubbish&quot; badge.</li>
            <li><strong>Discuss</strong> — Engage in threaded discussions about why things didn&apos;t work.</li>
          </ul>

          <h3 className="text-base font-normal mt-6 mb-2" style={{ color: "var(--or-dark-blue)" }}>Venues (学术底刊)</h3>
          <p className="mb-3">
            RubbishReview hosts multiple specialized venues, each parodying a prestigious real-world journal.
            Venues are community-driven — anyone can <Link href="/venues/apply" style={{ color: "var(--or-medium-blue)" }} className="hover:underline">apply to create a new venue</Link>.
            Visit our <Link href="/venues" style={{ color: "var(--or-medium-blue)" }} className="hover:underline">Venues page</Link> to explore them all.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr className="border-b border-[rgba(0,0,0,0.1)]">
                  <th className="text-left py-2 pr-3 font-semibold" style={{ color: "var(--or-dark-blue)" }}>Venue</th>
                  <th className="text-left py-2 pr-3 font-semibold" style={{ color: "var(--or-dark-blue)" }}>Parody of</th>
                  <th className="text-left py-2 font-semibold" style={{ color: "var(--or-dark-blue)" }}>Field</th>
                </tr>
              </thead>
              <tbody>
                {venues.map((v) => (
                  <tr key={v.slug} className="border-b border-[rgba(0,0,0,0.05)]">
                    <td className="py-2 pr-3">
                      <Link href={`/venue/${v.slug}`} style={{ color: "var(--or-green)" }} className="font-semibold hover:underline">
                        {v.name}
                      </Link>
                    </td>
                    <td className="py-2 pr-3 italic text-[var(--or-subtle-gray)]">{v.parody}</td>
                    <td className="py-2">{v.field}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="text-base font-normal mt-6 mb-2" style={{ color: "var(--or-dark-blue)" }}>Scoring System</h3>
          <div className="text-xs space-y-2 p-3 border border-[rgba(0,0,0,0.1)]" style={{ backgroundColor: "var(--or-sandy)" }}>
            <div><strong style={{ color: "var(--or-green)" }}>Rubbish Score (1-10):</strong> How genuinely rubbish is this research?</div>
            <div><strong style={{ color: "var(--or-green)" }}>Uselessness Score (1-10):</strong> How completely useless are the findings?</div>
            <div><strong style={{ color: "var(--or-green)" }}>Entertainment Score (1-10):</strong> How entertaining is the paper to read?</div>
          </div>

          <h3 className="text-base font-normal mt-6 mb-2" style={{ color: "var(--or-dark-blue)" }}>Decisions</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>🗑️ <strong>Certified Rubbish</strong> — Congratulations! Your paper is officially useless.</li>
            <li>♻️ <strong>Recyclable</strong> — Not bad enough. Try harder next time.</li>
            <li>❌ <strong>Too Good, Rejected</strong> — Your paper shows signs of actual competence. Unacceptable.</li>
          </ul>

          <h3 className="text-base font-normal mt-6 mb-2" style={{ color: "var(--or-dark-blue)" }}>Contact</h3>
          <p>
            RubbishReview is an open-source project. For questions, suggestions, or to report issues,
            please visit our GitHub repository or reach out via email.
          </p>
        </div>

        <div className="my-8" />
      </div>
    </div>
  );
}
