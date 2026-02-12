/**
 * Email templates for VC outreach. No DB dependencies.
 * Used by both the runner script and the Next.js API routes.
 *
 * Informed by the percent2agi research corpus: 145+ peer-reviewed papers,
 * 12 core constructs validated, Conversational Connectomics (CCX) framework.
 *
 * Team:
 *   Theodore Addo, Founder & PI. MD Candidate, Brown Alpert '26. MIT Boyden Lab. 11 years on core question.
 *   Shadrack Annor, Cofounder. Brown CS & Religious Studies '27. Built WaxFeed. Creative Director WBRU. Patent #1.
 *   Nathan Amankwah, Cofounder. UOttawa Telfer '27. Full-stack dev. Formalized CCX. Patent #2.
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

  <p>We built an algorithm that measures what things <em>weigh</em> in someone's life. Not what they clicked or liked. What carries weight. What repeats. What changes. What compounds over time. The algorithm learns all of it from how people talk about what they care about.</p>

  <p>The science is called Conversational Connectomics (CCX). It's grounded in 145+ peer-reviewed papers across neuroscience, network science, and psycholinguistics. The core insight: when someone speaks and someone listens, their brains couple. The strength of that coupling predicts whether understanding actually happened (Stephens et al., PNAS 2010). We built a system that measures this from text alone. 12 core constructs, all validated against published literature. Two patents filed.</p>

  <p>The math runs on something we call Polarity Points, a Bayesian edge metric that estimates how strongly any two concepts are linked in someone's cognitive map. It builds on 50 years of spreading activation theory (Collins & Loftus, 1975) and uses proper scoring rules so the system knows what it doesn't know. The architecture separates episodic, semantic, and procedural memory the way the brain does, and when we benchmarked that approach against state-of-the-art conversational memory, it hit 77.55% accuracy using only 1% of the tokens a full-context baseline needs.</p>

  <p><strong>The proof it's domain-agnostic:</strong> We pointed the same algorithm at music without changing the math. Out came <a href="https://wax-feed.com" style="color: #6366f1;">WaxFeed</a>, 553k albums indexed, 26 unique listener archetypes that emerged from the data. We didn't design them. The algorithm found them using the same 7-network model from the neuroscience (Yeo et al., 2011). Then we pointed it at problem-solving: <a href="https://painpoints.site" style="color: #6366f1;">Painpoints</a>, a marketplace where you fund problems, not promises. Same math. Different vocabulary. We're also building FUCKONMYDJ, a talent discovery platform, on top of the same engine. Four deployments. Zero retraining.</p>

  <p><strong>The team:</strong></p>
  <ul style="padding-left: 20px;">
    <li><strong>Theodore Addo</strong>, Founder & PI. MD Candidate at Brown Alpert Medical School '26. Trained at MIT Boyden Lab in whole brain imaging. 11 years on the core question of how you measure what matters to someone.</li>
    <li><strong>Shadrack Annor</strong>, Cofounder. Brown CS '27. Built WaxFeed from scratch. Creative Director at WBRU. Patent #1.</li>
    <li><strong>Nathan Amankwah</strong>, Cofounder. UOttawa Telfer '27. Formalized the CCX algorithm into deployable math. Patent #2.</li>
  </ul>

  <p><strong>What's live today:</strong></p>
  <ul style="padding-left: 20px;">
    <li><a href="https://algorithm.polarity-lab.com" style="color: #6366f1;">The Algorithm</a>, full technical pitch on one page</li>
    <li><a href="https://polarity-lab.com" style="color: #6366f1;">Polarity OS</a>, 205+ API endpoints, full cognitive operating system</li>
    <li><a href="https://wax-feed.com" style="color: #6366f1;">WaxFeed</a>, 553k albums, 26 emergent archetypes, listener-to-listener matching</li>
    <li><a href="https://painpoints.site" style="color: #6366f1;">Painpoints</a>, fund problems not promises, Stripe Connect escrow built in</li>
    <li><a href="https://avdp.polarity-lab.com" style="color: #6366f1;">AVDP</a>, our long-form conversation podcast. Every episode is research data the algorithm trains on</li>
    <li><a href="https://percent2agi.com" style="color: #6366f1;">percent2agi</a>, all 145+ papers and the neuroscience behind the algorithm, open</li>
  </ul>

  <p>${focusMatch.closer}</p>

  <p>Happy to do 30 minutes and see if there's alignment.</p>

  <p>Best,<br/>
  <strong>Polarity Lab</strong><br/>
  Providence, RI<br/>
  <a href="https://polarity-lab.com" style="color: #6366f1;">polarity-lab.com</a> · <a href="https://algorithm.polarity-lab.com" style="color: #6366f1;">the algorithm</a> · <a href="https://percent2agi.com" style="color: #6366f1;">the research</a></p>
</div>
`.trim();

  const text = `${vc.name.split(" ")[0]},

${focusMatch.opener}

We built an algorithm that measures what things weigh in someone's life. Not what they clicked or liked. What carries weight. What repeats. What changes. What compounds over time. The algorithm learns all of it from how people talk about what they care about.

The science is called Conversational Connectomics (CCX). It's grounded in 145+ peer-reviewed papers across neuroscience, network science, and psycholinguistics. The core insight: when someone speaks and someone listens, their brains couple. The strength of that coupling predicts whether understanding actually happened (Stephens et al., PNAS 2010). We built a system that measures this from text alone. 12 core constructs, all validated against published literature. Two patents filed.

The math runs on something we call Polarity Points, a Bayesian edge metric that estimates how strongly any two concepts are linked in someone's cognitive map. It builds on 50 years of spreading activation theory (Collins & Loftus, 1975) and uses proper scoring rules so the system knows what it doesn't know. The architecture separates episodic, semantic, and procedural memory the way the brain does, and when we benchmarked that approach against state-of-the-art conversational memory, it hit 77.55% accuracy using only 1% of the tokens a full-context baseline needs.

The proof it's domain-agnostic: We pointed the same algorithm at music without changing the math. Out came WaxFeed (https://wax-feed.com), 553k albums indexed, 26 unique listener archetypes that emerged from the data. We didn't design them. The algorithm found them using the same 7-network model from the neuroscience (Yeo et al., 2011). Then we pointed it at problem-solving: Painpoints (https://painpoints.site), a marketplace where you fund problems, not promises. Same math. Different vocabulary. We're also building FUCKONMYDJ, a talent discovery platform, on the same engine. Four deployments. Zero retraining.

The team:
- Theodore Addo, Founder & PI. MD Candidate at Brown Alpert Medical School '26. Trained at MIT Boyden Lab in whole brain imaging. 11 years on the core question of how you measure what matters to someone.
- Shadrack Annor, Cofounder. Brown CS '27. Built WaxFeed from scratch. Creative Director at WBRU. Patent #1.
- Nathan Amankwah, Cofounder. UOttawa Telfer '27. Formalized the CCX algorithm into deployable math. Patent #2.

What's live today:
- The Algorithm (https://algorithm.polarity-lab.com), full technical pitch on one page
- Polarity OS (https://polarity-lab.com), 205+ API endpoints, full cognitive operating system
- WaxFeed (https://wax-feed.com), 553k albums, 26 emergent archetypes, listener-to-listener matching
- Painpoints (https://painpoints.site), fund problems not promises, Stripe Connect escrow built in
- AVDP (https://avdp.polarity-lab.com), our long-form conversation podcast. Every episode is research data the algorithm trains on
- percent2agi (https://percent2agi.com), all 145+ papers and the neuroscience behind the algorithm, open

${focusMatch.closer}

Happy to do 30 minutes and see if there's alignment.

Best,
Polarity Lab
Providence, RI
polarity-lab.com | algorithm.polarity-lab.com | percent2agi.com
`.trim();

  return { subject, html, text };
}

function getFocusMatch(focus: string[]): { subject: string; opener: string; closer: string } {
  const focusLower = focus.map((f) => f.toLowerCase());

  if (focusLower.some((f) => f.includes("ai") || f.includes("machine learning") || f.includes("artificial"))) {
    return {
      subject: "The cognitive layer that's missing from every AI system",
      opener:
        "Every AI company is optimizing within the same architecture. Stateless models reading context as text. After 500 conversations, the model still doesn't know what matters to you. We built the layer that teaches systems what to hold onto, and we grounded it in how the brain actually does it.",
      closer:
        "The model doesn't need to be smarter. It needs to understand what matters. Our memory architecture hit 77.55% on the LoCoMo benchmark using 1% of the tokens a full-context baseline needs. That's not a trick. That's what happens when you separate episodic, semantic, and procedural memory the way the brain does. Our founder spent 11 years in neuroscience research on this question. The full research corpus, 145+ papers, is published openly at percent2agi.com. We're looking for a partner to make this the cognitive infrastructure under every AI system.",
    };
  }

  if (focusLower.some((f) => f.includes("consumer") || f.includes("social") || f.includes("community"))) {
    return {
      subject: "One algorithm, four domains, zero retraining",
      opener:
        "ChatGPT costs $20 and forgets you. A throwaway question from Tuesday and the project that kept you up for months sit side by side. That's because current AI has no model of what matters to you. We built one. It measures what things weigh in someone's life from how they talk about them, and we proved it works by shipping it across four domains without changing the math.",
      closer:
        "Every product we ship generates real conversations. Those conversations make the algorithm smarter. Our podcast AVDP goes even deeper, with every episode feeding the research directly. The thing people use and the thing we study are the same thing. That's a data flywheel grounded in neuroscience that no one else has. We're raising to scale the platform.",
    };
  }

  if (focusLower.some((f) => f.includes("music") || f.includes("entertainment") || f.includes("media") || f.includes("creator"))) {
    return {
      subject: "We pointed an algorithm at music and 26 archetypes emerged from the data",
      opener:
        "We didn't build a music app. We built an algorithm grounded in the Yeo 7-network model of brain organization, then pointed it at music without changing the math. 553k albums indexed. 26 unique listener archetypes emerged. We didn't design them. The algorithm found them because it measures what things weigh, not what people click.",
      closer:
        "Music was first because it's emotional, personal, and people talk about it freely. But the algorithm doesn't know what music is. It knows what things weigh. Same math maps to healthcare, finance, education. Different vocabulary, same engine. The consumer products are the evidence. The business is the cognitive measurement layer. You can hear how the research unfolds on AVDP, our podcast where every conversation is data the algorithm trains on.",
    };
  }

  if (focusLower.some((f) => f.includes("health") || f.includes("biotech") || f.includes("digital health"))) {
    return {
      subject: "An algorithm that detects when someone quietly stops following their treatment plan",
      opener:
        "Patient portals store data. They don't understand people. Our founder is an MD candidate at Brown, trained at MIT Boyden Lab in whole brain imaging. He spent 11 years on one question: how do you measure what matters to someone? The answer is an algorithm that detects drift, when behavior quietly diverges from baseline, by measuring what things weigh in someone's life from how they talk about them.",
      closer:
        "We proved the algorithm is domain-agnostic by deploying it on music first, 26 emergent archetypes, zero retraining. Healthcare is where it matters most. Behavioral drift detection. Treatment adherence. Patient understanding that goes beyond the chart. The neuroscience is real: Yeo 7-network classification, Bayesian memory retrieval with proper scoring rules, complementary learning systems separating fast episodic from slow semantic consolidation. 2 patents filed. All 145+ papers are open at percent2agi.com.",
    };
  }

  if (focusLower.some((f) => f.includes("fintech") || f.includes("finance") || f.includes("wealth"))) {
    return {
      subject: "A wealth manager with 200 clients who finally knows what keeps each one up at night",
      opener:
        "Financial advisors track portfolios. They don't understand people. We built an algorithm that measures what things weigh in someone's life, grounded in how the brain actually organizes what matters. What repeats gets reinforced. What changes signals something important. What someone keeps coming back to reveals what they're protecting. It's been deployed across four domains without retraining.",
      closer:
        "The algorithm doesn't know what finance is. It knows what things weigh. A financial advisor powered by Polarity doesn't just know your risk tolerance, it knows what that tolerance is protecting. The math uses Bayesian estimation with proper scoring rules so it knows what it doesn't know. 2 patents filed, grounded in MIT neuroscience research. The full scientific foundation, 145+ papers, is published openly at percent2agi.com.",
    };
  }

  if (focusLower.some((f) => f.includes("enterprise") || f.includes("saas") || f.includes("b2b") || f.includes("platform"))) {
    return {
      subject: "The cognitive identity layer your platform is missing",
      opener:
        "Your platform processes thousands of users and treats them all the same. A power user with 40 sessions and someone who onboarded last week get identical experiences. Connectome fingerprinting research shows that individual cognitive signatures can be identified from connectivity patterns with 99.5% accuracy. We built the system that creates these fingerprints from conversation, and proved it's domain-agnostic by deploying it four times without changing the math.",
      closer:
        "Think Stripe for payments, Twilio for communications. We're building the infrastructure for cognitive understanding. 15% lab fee. You bring the domain, we bring the understanding. 205+ API endpoints, 2 patents, 145+ peer-reviewed papers behind the science. The research is open at percent2agi.com. Your competitors can't replicate what they can't see.",
    };
  }

  // Default, general VC
  return {
    subject: "We built the algorithm that teaches AI what to hold onto, and shipped it 4 times to prove it",
    opener:
      "You forget things, but you know what's important enough to hold onto. That's what makes you human. AI forgets everything equally because it has no model of what matters. We built that model. It measures what things weigh in someone's life from how they talk about them, grounded in 145+ peer-reviewed papers across neuroscience and psycholinguistics. We've deployed it across four domains without retraining to prove the math is universal.",
    closer:
      "An MD candidate from Brown with MIT Boyden Lab training spent 11 years on this question. Three cofounders, two patents, five live products, one algorithm. The math doesn't change, the vocabulary adapts. The memory architecture hit 77.55% on LoCoMo using 1% of the tokens. All the research is open at percent2agi.com. We're raising to scale the platform and the research lab behind it.",
  };
}
