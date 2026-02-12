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

  <p>Here is how it works. The algorithm listens to natural conversation and tracks three things: what someone repeats, what they give weight to, and what they quietly avoid. Over time it measures how those signals shift, compound, and decay. The output is a living cognitive profile that updates with every interaction. Not a summary. Not a keyword cloud. A structured model of what actually matters to a person, built from their own language. Two patents filed, grounded in the neuroscience of how brains assign importance.</p>

  <p>We proved it by pointing the algorithm at music. No retraining, no domain-specific tuning. Out came <a href="https://wax-feed.com" style="color: #6366f1;">WaxFeed</a>: 553,000 albums indexed, and 26 distinct listener archetypes that the algorithm discovered on its own. Nobody designed those archetypes. The math surfaced them from how people talk about what they listen to. WaxFeed is live, people use it, and every conversation on the platform feeds back into the research. The full technical breakdown of the algorithm is here: <a href="https://algorithm.polarity-lab.com" style="color: #6366f1;">algorithm.polarity-lab.com</a></p>

  <p>We then deployed the same algorithm to problem-solving (<a href="https://painpoints.site" style="color: #6366f1;">Painpoints</a>, where it matches builders to bounties using cognitive fingerprints) and talent discovery, all without changing the underlying math. Four domains, zero retraining. The algorithm does not know what music is or what a bounty is. It knows what things weigh.</p>

  <p>${focusMatch.closer}</p>

  <p>The team: Theodore Addo, MD candidate at Brown, MIT Boyden Lab, 11 years on this question. Shadrack Annor, Brown CS '27, built WaxFeed, patent #1. Nathan Amankwah, UOttawa '27, formalized the algorithm, patent #2. We also produce <a href="https://polarity-lab.com" style="color: #6366f1;">AVDP</a>, a long-form podcast where every episode is research data the algorithm trains on. Entertainment that doubles as science.</p>

  <p>Happy to do 30 minutes and show you what we have built.</p>

  <p>Best,<br/>
  <strong>Polarity Lab</strong><br/>
  A research lab that ships. Providence, RI.<br/>
  <a href="https://polarity-lab.com" style="color: #6366f1;">polarity-lab.com</a></p>
</div>
`.trim();

  const text = `${vc.name.split(" ")[0]},

${focusMatch.opener}

Here is how it works. The algorithm listens to natural conversation and tracks three things: what someone repeats, what they give weight to, and what they quietly avoid. Over time it measures how those signals shift, compound, and decay. The output is a living cognitive profile that updates with every interaction. Not a summary. Not a keyword cloud. A structured model of what actually matters to a person, built from their own language. Two patents filed, grounded in the neuroscience of how brains assign importance.

We proved it by pointing the algorithm at music. No retraining, no domain-specific tuning. Out came WaxFeed (https://wax-feed.com): 553,000 albums indexed, and 26 distinct listener archetypes that the algorithm discovered on its own. Nobody designed those archetypes. The math surfaced them from how people talk about what they listen to. WaxFeed is live, people use it, and every conversation on the platform feeds back into the research. The full technical breakdown of the algorithm is here: algorithm.polarity-lab.com

We then deployed the same algorithm to problem-solving (Painpoints, https://painpoints.site, where it matches builders to bounties using cognitive fingerprints) and talent discovery, all without changing the underlying math. Four domains, zero retraining. The algorithm does not know what music is or what a bounty is. It knows what things weigh.

${focusMatch.closer}

The team: Theodore Addo, MD candidate at Brown, MIT Boyden Lab, 11 years on this question. Shadrack Annor, Brown CS '27, built WaxFeed, patent #1. Nathan Amankwah, UOttawa '27, formalized the algorithm, patent #2. We also produce AVDP, a long-form podcast where every episode is research data the algorithm trains on. Entertainment that doubles as science.

Happy to do 30 minutes and show you what we have built.

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
      subject: "The cognitive layer that is missing from every AI system",
      opener:
        "Every AI company is optimizing within the same architecture. Stateless models reading context as text. After 500 conversations, the model still does not know what matters to you. We built the layer that teaches systems what to hold onto.",
      closer:
        "WaxFeed is the proof that the algorithm works in production. 553,000 albums, 26 emergent archetypes, real users, real conversations feeding the research. The model does not need to be smarter. It needs to understand what matters. We built that understanding and it is live today.",
    };
  }

  if (focusLower.some((f) => f.includes("consumer") || f.includes("social") || f.includes("community"))) {
    return {
      subject: "553k albums, 26 archetypes, one algorithm, zero retraining",
      opener:
        "ChatGPT costs $20 and forgets you. A throwaway question from Tuesday and the project that kept you up for months sit side by side with equal weight. We built the algorithm that teaches AI what matters, then proved it works by shipping WaxFeed, a music platform where the algorithm discovered 26 listener archetypes on its own from 553,000 albums.",
      closer:
        "Every product we ship generates real conversations. Those conversations make the algorithm smarter. The thing people use and the thing we study are the same thing. WaxFeed is live, Painpoints is live, and every user session is research data. That is a flywheel nobody else has.",
    };
  }

  if (focusLower.some((f) => f.includes("music") || f.includes("entertainment") || f.includes("media") || f.includes("creator"))) {
    return {
      subject: "We pointed an algorithm at music and 26 archetypes emerged on their own",
      opener:
        "We did not build a music app. We built an algorithm that measures what things weigh in someone's life, then pointed it at music without changing the math. The result is WaxFeed: 553,000 albums indexed, 26 unique listener archetypes that nobody designed. The algorithm surfaced them from how people naturally talk about what they listen to.",
      closer:
        "Music was first because it is emotional, personal, and people talk about it freely. But the algorithm does not know what music is. It knows what things weigh. Healthcare, finance, education all work the same way. The consumer products are the proof. The business is the cognitive measurement layer underneath.",
    };
  }

  if (focusLower.some((f) => f.includes("health") || f.includes("biotech") || f.includes("digital health"))) {
    return {
      subject: "An algorithm that detects when someone quietly stops following their treatment plan",
      opener:
        "Patient portals store data. They do not understand people. Our founder is an MD candidate at Brown, trained at MIT Boyden Lab in whole brain imaging. He spent 11 years on one question: how do you measure what matters to someone? The answer is an algorithm that detects drift, when behavior quietly diverges from baseline.",
      closer:
        "We proved it works by deploying the algorithm on music first, with zero retraining. WaxFeed now has 553,000 albums indexed and 26 emergent listener archetypes the algorithm discovered on its own. Healthcare is where the algorithm matters most. Behavioral drift detection. Treatment adherence. Patient understanding that goes beyond the chart.",
    };
  }

  if (focusLower.some((f) => f.includes("fintech") || f.includes("finance") || f.includes("wealth"))) {
    return {
      subject: "A wealth manager with 200 clients who finally knows what keeps each one up at night",
      opener:
        "Financial advisors track portfolios. They do not understand people. We built an algorithm grounded in neuroscience that measures what things weigh in someone's life. What repeats, what changes, what defines them. We proved it works on music first, where WaxFeed discovered 26 listener archetypes from 553,000 albums, then deployed it across three more domains without retraining.",
      closer:
        "The algorithm does not know what finance is. It knows what things weigh. A financial advisor powered by Polarity does not just know your risk tolerance. It knows what that tolerance is protecting.",
    };
  }

  if (focusLower.some((f) => f.includes("enterprise") || f.includes("saas") || f.includes("b2b") || f.includes("platform"))) {
    return {
      subject: "The cognitive identity layer your platform is missing",
      opener:
        "Your platform processes thousands of users and treats them all the same. A power user with 40 sessions and someone who onboarded last week get identical experiences. We built the cognitive measurement layer that sits under any AI system. WaxFeed is the proof: 553,000 albums, 26 emergent listener archetypes, zero manual tuning. Same algorithm, deployed four times across different domains without retraining.",
      closer:
        "Think Stripe for payments, Twilio for communications. We are building the infrastructure for cognitive understanding. You bring the domain, we bring the algorithm. Two patents, MIT neuroscience foundation, four live deployments. Your competitors cannot replicate what they cannot see.",
    };
  }

  // Default, general VC
  return {
    subject: "553k albums, 26 archetypes nobody designed, and an algorithm that works across any domain",
    opener:
      "You forget things, but you know what is important enough to hold onto. That is what makes you human. AI forgets things but has no way to know what is important enough to hold onto. We built the fix and proved it by pointing the algorithm at music. WaxFeed now has 553,000 albums indexed and 26 listener archetypes the algorithm discovered on its own, no retraining, no manual design.",
    closer:
      "An MD candidate from Brown with MIT Boyden Lab training spent 11 years on this question. Three cofounders, two patents, four live deployments, one algorithm. The math does not change. The vocabulary adapts. We are raising to scale the platform and the research lab behind it.",
  };
}
