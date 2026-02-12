/**
 * Email templates for VC outreach — no DB dependencies.
 * Used by both the runner script and the Next.js API routes.
 *
 * Team:
 *   Theodore Addo — Founder & PI. MD Candidate, Brown Alpert '26. MIT Boyden Lab. 11 years on core question.
 *   Shadrack Annor — Cofounder. Brown CS & Religious Studies '27. Built WaxFeed. Creative Director WBRU. Patent #1.
 *   Nathan Amankwah — Cofounder. UOttawa Telfer '27. Full-stack dev. Formalized CCX. Patent #2.
 */

export interface VCContact {
  name: string;
  email: string;
  firm: string;
  title?: string;
  focus?: string[];
  website?: string;
  linkedinUrl?: string;
  stage?: string;
  checkSize?: string;
  location?: string;
  notes?: string;
}

export function generateVCEmail(vc: VCContact): { subject: string; html: string; text: string } {
  const focusMatch = getFocusMatch(vc.focus || []);

  const subject = focusMatch.subject;

  const html = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; color: #1a1a1a; line-height: 1.6;">
  <p>${vc.name.split(" ")[0]},</p>

  <p>${focusMatch.opener}</p>

  <p>We built the first algorithm that measures <em>importance</em> — not what users did, but what they care about. What repeats carries weight. What changes carries weight. Who someone is compounds over time. The algorithm measures all of it.</p>

  <p><strong>The proof it's domain-agnostic:</strong> We deployed the same math on music without retraining. Out came <a href="https://wax-feed.com" style="color: #6366f1;">WaxFeed</a> — 553k albums indexed, 26 unique listener archetypes that emerged from the data (we didn't design them), and user-to-user matching based on how people actually <em>think</em> about music.</p>

  <p>Same algorithm, different vocabulary → <a href="https://fuckonmydj.com" style="color: #6366f1;">FUCKONMYDJ</a> (DJ marketplace). Same algorithm → <a href="https://painpoints.site" style="color: #6366f1;">Painpoints</a> (fund problems, not promises). Four deployments. Zero retraining. That's what domain-agnostic means.</p>

  <p><strong>The team:</strong></p>
  <ul style="padding-left: 20px;">
    <li><strong>Theodore Addo</strong> — Founder & PI. MD Candidate, Brown Alpert '26. MIT Boyden Lab (whole brain imaging). 11 years on the core question.</li>
    <li><strong>Shadrack Annor</strong> — Cofounder. Brown CS '27. Built WaxFeed. Creative Director at WBRU. Patent #1.</li>
    <li><strong>Nathan Amankwah</strong> — Cofounder. UOttawa '27. Formalized the CCX algorithm. Patent #2.</li>
  </ul>

  <p><strong>What exists today:</strong></p>
  <ul style="padding-left: 20px;">
    <li><a href="https://algorithm.polarity-lab.com" style="color: #6366f1;">The Algorithm</a> — full technical pitch, one page</li>
    <li><a href="https://polarity-lab.com" style="color: #6366f1;">Polarity OS</a> — 205+ API endpoints. Full cognitive operating system.</li>
    <li><a href="https://wax-feed.com" style="color: #6366f1;">WaxFeed</a> — music deployment. 553k albums. 26 emergent archetypes.</li>
    <li><a href="https://fuckonmydj.com" style="color: #6366f1;">FUCKONMYDJ</a> — DJ marketplace</li>
    <li><a href="https://painpoints.site" style="color: #6366f1;">Painpoints</a> — problem marketplace</li>
    <li>2 patents filed. Grounded in neuroscience (Yeo 7-network model, Bayesian memory retrieval).</li>
  </ul>

  <p>${focusMatch.closer}</p>

  <p>30 minutes. See if there's alignment.</p>

  <p>—<br/>
  <strong>Polarity Lab</strong><br/>
  Providence, RI · Est. 2025<br/>
  <a href="https://polarity-lab.com" style="color: #6366f1;">polarity-lab.com</a> · <a href="https://algorithm.polarity-lab.com" style="color: #6366f1;">the algorithm</a></p>
</div>
`.trim();

  const text = `${vc.name.split(" ")[0]},

${focusMatch.opener}

We built the first algorithm that measures importance — not what users did, but what they care about. What repeats carries weight. What changes carries weight. Who someone is compounds over time. The algorithm measures all of it.

The proof it's domain-agnostic: We deployed the same math on music without retraining. Out came WaxFeed (https://wax-feed.com) — 553k albums indexed, 26 unique listener archetypes that emerged from the data (we didn't design them), and user-to-user matching based on how people actually think about music.

Same algorithm, different vocabulary -> FUCKONMYDJ (https://fuckonmydj.com) (DJ marketplace). Same algorithm -> Painpoints (https://painpoints.site) (fund problems, not promises). Four deployments. Zero retraining. That's what domain-agnostic means.

The team:
- Theodore Addo — Founder & PI. MD Candidate, Brown Alpert '26. MIT Boyden Lab (whole brain imaging). 11 years on the core question.
- Shadrack Annor — Cofounder. Brown CS '27. Built WaxFeed. Creative Director at WBRU. Patent #1.
- Nathan Amankwah — Cofounder. UOttawa '27. Formalized the CCX algorithm. Patent #2.

What exists today:
- The Algorithm (https://algorithm.polarity-lab.com) — full technical pitch
- Polarity OS (https://polarity-lab.com) — 205+ API endpoints, full cognitive OS
- WaxFeed (https://wax-feed.com) — music deployment, 553k albums, 26 emergent archetypes
- FUCKONMYDJ (https://fuckonmydj.com) — DJ marketplace
- Painpoints (https://painpoints.site) — problem marketplace
- 2 patents filed. Grounded in neuroscience (Yeo 7-network model, Bayesian memory retrieval).

${focusMatch.closer}

30 minutes. See if there's alignment.

--
Polarity Lab
Providence, RI | Est. 2025
polarity-lab.com | algorithm.polarity-lab.com
`.trim();

  return { subject, html, text };
}

function getFocusMatch(focus: string[]): { subject: string; opener: string; closer: string } {
  const focusLower = focus.map((f) => f.toLowerCase());

  if (focusLower.some((f) => f.includes("ai") || f.includes("machine learning") || f.includes("artificial"))) {
    return {
      subject: "The cognitive layer that's missing from every AI system",
      opener:
        "Every AI company is optimizing within the same architecture: stateless models reading context as text. After 500 conversations, the model still doesn't know what matters to you. We built the layer that teaches systems what to hold onto.",
      closer:
        "The model doesn't need to be smarter. It needs to understand what matters. An MD candidate from Brown with 11 years in neuroscience research built that understanding into an algorithm. It's live across four domains today. We're looking for a partner to make it the cognitive infrastructure under every AI system.",
    };
  }

  if (focusLower.some((f) => f.includes("consumer") || f.includes("social") || f.includes("community"))) {
    return {
      subject: "One algorithm, four domains, zero retraining — the cognitive layer for consumer AI",
      opener:
        "ChatGPT costs $20 and forgets you. A throwaway question from Tuesday and the project that kept you up for months sit side by side. We built the algorithm that teaches AI what matters — and proved it by shipping it in four different domains without changing the math.",
      closer:
        "Every product we ship generates real conversations. Those conversations make the algorithm smarter. The thing people use and the thing we study are the same thing. That's a data flywheel no one else has. We're raising to scale the platform.",
    };
  }

  if (focusLower.some((f) => f.includes("music") || f.includes("entertainment") || f.includes("media") || f.includes("creator"))) {
    return {
      subject: "We pointed an algorithm at music — 26 archetypes emerged from the data",
      opener:
        "We didn't build a music app. We built an algorithm that measures what things weigh in someone's life, then pointed it at music without changing the math. 553k albums indexed. 26 unique listener archetypes emerged. We didn't design them — the algorithm found them.",
      closer:
        "Music was first because it's emotional, personal, and people talk about it freely. But the algorithm doesn't know what music is. It knows what things weigh. Healthcare, finance, education — same engine, different vocabulary. The consumer products are the evidence. The business is the cognitive measurement layer.",
    };
  }

  if (focusLower.some((f) => f.includes("health") || f.includes("biotech") || f.includes("digital health"))) {
    return {
      subject: "An algorithm that detects when someone quietly stops following their treatment plan",
      opener:
        "Patient portals store data. They don't understand people. Our founder is an MD candidate at Brown, trained at MIT Boyden Lab in whole brain imaging. He spent 11 years on one question: how do you measure what matters to someone? The answer is an algorithm that detects drift — when behavior diverges from baseline.",
      closer:
        "We proved the algorithm is domain-agnostic by deploying it on music first (26 emergent archetypes, zero retraining). Healthcare is where it matters most. Behavioral drift detection. Treatment adherence. Patient understanding that goes beyond the chart. The neuroscience is real — Yeo 7-network classification, Bayesian memory retrieval, 2 patents filed.",
    };
  }

  if (focusLower.some((f) => f.includes("fintech") || f.includes("finance") || f.includes("wealth"))) {
    return {
      subject: "A wealth manager with 200 clients who finally knows what keeps each one up at night",
      opener:
        "Financial advisors track portfolios. They don't understand people. We built an algorithm grounded in neuroscience that measures what things weigh in someone's life — what repeats, what changes, what defines them. It's been deployed across four domains without retraining.",
      closer:
        "The algorithm doesn't know what finance is. It knows what things weigh. A financial advisor powered by Polarity doesn't just know your risk tolerance — it knows what that tolerance is protecting. 2 patents filed, grounded in MIT neuroscience research.",
    };
  }

  if (focusLower.some((f) => f.includes("enterprise") || f.includes("saas") || f.includes("b2b") || f.includes("platform"))) {
    return {
      subject: "The cognitive identity layer your platform is missing",
      opener:
        "Your platform processes thousands of users and treats them all the same. A power user with 40 sessions and someone who onboarded last week get identical experiences. We built the cognitive measurement layer that goes under every AI system — and proved it's domain-agnostic by deploying it four times without changing the math.",
      closer:
        "Think Stripe for payments, Twilio for communications — we're building the infrastructure for cognitive understanding. 15% lab fee. You bring the domain, we bring the understanding. 205+ API endpoints, 2 patents, MIT neuroscience foundation. Your competitors can't replicate what they can't see.",
    };
  }

  // Default — general VC
  return {
    subject: "We built the algorithm that teaches AI what to hold onto — shipped it 4 times to prove it",
    opener:
      "You forget things, but you know what's important enough to hold onto. That's what makes you human. AI forgets things but has no clue what's important enough to hold onto. We built the fix — and we've deployed it across four domains without retraining to prove the math is universal.",
    closer:
      "An MD candidate from Brown with MIT Boyden Lab training spent 11 years on this question. Three cofounders, two patents, five live products, one algorithm. Domain-agnostic. The math doesn't change — the vocabulary adapts. We're raising to scale the platform and the research lab behind it.",
  };
}
