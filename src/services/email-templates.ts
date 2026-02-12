/**
 * Email templates for VC outreach. No DB dependencies.
 * Used by both the runner script and the Next.js API routes.
 *
 * Informed by the CCX (Conversational Connectomics) research corpus.
 *
 * Team:
 *   Theodore Addo, Founder & PI. MD Candidate, Brown Alpert '26. MIT Boyden Lab.
 *   Shadrack Annor, Cofounder. Brown CS '27. Built WaxFeed. Patent #1.
 *   Nathan Amankwah, Cofounder. UOttawa Telfer '27. Formalized CCX. Patent #2.
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
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; color: #1a1a1a; line-height: 1.7;">
  <p>${vc.name.split(" ")[0]},</p>

  <p>${focusMatch.opener}</p>

  <p>We call the science <a href="https://polarity-lab.com" style="color: #6366f1;">Conversational Connectomics</a>. Every conversation carries signal: what repeats, what gets emphasis, what you avoid, what you protect. The algorithm picks up all of it and builds a living profile of what matters to someone. Not a chat log. Comprehension. Two patents filed, grounded in the neuroscience of how brains actually assign importance.</p>

  <p>We proved it's domain-agnostic by pointing it at music without changing the math. Out came <a href="https://wax-feed.com" style="color: #6366f1;">WaxFeed</a>: 553k albums indexed, 26 listener archetypes that emerged from the data on their own. Then we pointed it at problem-solving and built <a href="https://painpoints.site" style="color: #6366f1;">Painpoints</a>, where real money backs real problems and the algorithm matches builders to bounties using cognitive fingerprinting. Same engine. Different vocabulary. Four deployments. Zero retraining.</p>

  <p>The team: Theodore Addo, MD candidate at Brown, MIT Boyden Lab, 11 years on this question. Shadrack Annor, Brown CS '27, built WaxFeed, patent #1. Nathan Amankwah, UOttawa '27, formalized the algorithm, patent #2. We also produce <a href="https://polarity-lab.com" style="color: #6366f1;">AVDP</a>, a long-form podcast where every episode is research data the algorithm trains on. Entertainment that doubles as science.</p>

  <p>${focusMatch.closer}</p>

  <p>The full technical pitch is one page: <a href="https://algorithm.polarity-lab.com" style="color: #6366f1;">algorithm.polarity-lab.com</a></p>

  <p>Happy to do 30 minutes and show you what we've built.</p>

  <p>Best,<br/>
  <strong>Polarity Lab</strong><br/>
  A research lab that ships. Providence, RI.<br/>
  <a href="https://polarity-lab.com" style="color: #6366f1;">polarity-lab.com</a></p>
</div>
`.trim();

  const text = `${vc.name.split(" ")[0]},

${focusMatch.opener}

We call the science Conversational Connectomics (https://polarity-lab.com). Every conversation carries signal: what repeats, what gets emphasis, what you avoid, what you protect. The algorithm picks up all of it and builds a living profile of what matters to someone. Not a chat log. Comprehension. Two patents filed, grounded in the neuroscience of how brains actually assign importance.

We proved it's domain-agnostic by pointing it at music without changing the math. Out came WaxFeed (https://wax-feed.com): 553k albums indexed, 26 listener archetypes that emerged from the data on their own. Then we pointed it at problem-solving and built Painpoints (https://painpoints.site), where real money backs real problems and the algorithm matches builders to bounties using cognitive fingerprinting. Same engine. Different vocabulary. Four deployments. Zero retraining.

The team: Theodore Addo, MD candidate at Brown, MIT Boyden Lab, 11 years on this question. Shadrack Annor, Brown CS '27, built WaxFeed, patent #1. Nathan Amankwah, UOttawa '27, formalized the algorithm, patent #2. We also produce AVDP, a long-form podcast where every episode is research data the algorithm trains on. Entertainment that doubles as science.

${focusMatch.closer}

The full technical pitch is one page: algorithm.polarity-lab.com

Happy to do 30 minutes and show you what we've built.

Best,
Polarity Lab
A research lab that ships. Providence, RI.
polarity-lab.com
`.trim();

  return { subject, html, text };
}

function getFocusMatch(focus: string[]): { subject: string; opener: string; closer: string } {
  const focusLower = focus.map((f) => f.toLowerCase());

  if (focusLower.some((f) => f.includes("ai") || f.includes("machine learning") || f.includes("artificial"))) {
    return {
      subject: "The cognitive layer that's missing from every AI system",
      opener:
        "Every AI company is optimizing within the same architecture. Stateless models reading context as text. After 500 conversations, the model still doesn't know what matters to you. We built the layer that teaches systems what to hold onto.",
      closer:
        "The model doesn't need to be smarter. It needs to understand what matters. We built that understanding into an algorithm and it's live across four domains today. We're looking for a partner who sees cognitive infrastructure as the next fundamental layer.",
    };
  }

  if (focusLower.some((f) => f.includes("consumer") || f.includes("social") || f.includes("community"))) {
    return {
      subject: "One algorithm, four domains, zero retraining",
      opener:
        "ChatGPT costs $20 and forgets you. A throwaway question from Tuesday and the project that kept you up for months sit side by side with equal weight. We built the algorithm that teaches AI what matters, and proved it by shipping it across four different domains without changing the math.",
      closer:
        "Every product we ship generates real conversations. Those conversations make the algorithm smarter. The thing people use and the thing we study are the same thing. That's a data flywheel nobody else has. We're raising to scale the platform.",
    };
  }

  if (focusLower.some((f) => f.includes("music") || f.includes("entertainment") || f.includes("media") || f.includes("creator"))) {
    return {
      subject: "We pointed an algorithm at music and 26 archetypes emerged from the data",
      opener:
        "We didn't build a music app. We built an algorithm that measures what things weigh in someone's life, then pointed it at music without changing the math. 553k albums indexed. 26 unique listener archetypes emerged. We didn't design them. The algorithm found them.",
      closer:
        "Music was first because it's emotional, personal, and people talk about it freely. But the algorithm doesn't know what music is. It knows what things weigh. Healthcare, finance, education: same engine, different vocabulary. The consumer products are the proof. The business is the cognitive measurement layer underneath.",
    };
  }

  if (focusLower.some((f) => f.includes("health") || f.includes("biotech") || f.includes("digital health"))) {
    return {
      subject: "An algorithm that detects when someone quietly stops following their treatment plan",
      opener:
        "Patient portals store data. They don't understand people. Our founder is an MD candidate at Brown, trained at MIT Boyden Lab in whole brain imaging. He spent 11 years on one question: how do you measure what matters to someone? The answer is an algorithm that detects drift, when behavior quietly diverges from baseline.",
      closer:
        "We proved the algorithm works across domains by deploying it on music first. 26 emergent archetypes, zero retraining. Healthcare is where it matters most. Behavioral drift detection. Treatment adherence. Patient understanding that goes beyond the chart.",
    };
  }

  if (focusLower.some((f) => f.includes("fintech") || f.includes("finance") || f.includes("wealth"))) {
    return {
      subject: "A wealth manager with 200 clients who finally knows what keeps each one up at night",
      opener:
        "Financial advisors track portfolios. They don't understand people. We built an algorithm grounded in neuroscience that measures what things weigh in someone's life. What repeats, what changes, what defines them. It's been deployed across four domains without retraining.",
      closer:
        "The algorithm doesn't know what finance is. It knows what things weigh. A financial advisor powered by Polarity doesn't just know your risk tolerance, it knows what that tolerance is protecting.",
    };
  }

  if (focusLower.some((f) => f.includes("enterprise") || f.includes("saas") || f.includes("b2b") || f.includes("platform"))) {
    return {
      subject: "The cognitive identity layer your platform is missing",
      opener:
        "Your platform processes thousands of users and treats them all the same. A power user with 40 sessions and someone who onboarded last week get identical experiences. We built the cognitive measurement layer that goes under every AI system, and proved it's domain-agnostic by deploying it four times without changing the math.",
      closer:
        "Think Stripe for payments, Twilio for communications. We're building the infrastructure for cognitive understanding. You bring the domain, we bring the understanding. 205+ API endpoints, two patents, MIT neuroscience foundation. Your competitors can't replicate what they can't see.",
    };
  }

  // Default, general VC
  return {
    subject: "We built the algorithm that teaches AI what to hold onto, and shipped it 4 times to prove it",
    opener:
      "You forget things, but you know what's important enough to hold onto. That's what makes you human. AI forgets things but has no way to know what's important enough to hold onto. We built the fix, and we've deployed it across four domains without retraining to prove the math is universal.",
    closer:
      "An MD candidate from Brown with MIT Boyden Lab training spent 11 years on this question. Three cofounders, two patents, five live products, one algorithm. The math doesn't change, the vocabulary adapts. We're raising to scale the platform and the research lab behind it.",
  };
}
