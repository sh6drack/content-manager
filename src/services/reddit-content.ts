/**
 * Reddit Content Generator
 *
 * Generates authentic, value-first content for Reddit communities.
 * Each post is tailored to the subreddit's culture and rules.
 * NOT spam — genuine contributions that happen to showcase Polarity Lab products.
 */

export interface RedditPost {
  subreddit: string;
  title: string;
  body: string;
  flair?: string;
}

// ─── Subreddit Targets & Content ───

export const REDDIT_POSTS: RedditPost[] = [
  // ── r/startups ──
  {
    subreddit: "startups",
    title: "We built an algorithm that measures what things weigh in someone's life — shipped 5 products in 4 months",
    flair: "SaaS",
    body: `Hey r/startups,

We're Polarity Lab, a two-person team out of Providence, RI. We incorporated in September 2025 and have shipped 5 live products since, all running on the same core algorithm.

**The algorithm:** It measures what things *weigh* in someone's life. Not what they said — what carried enough gravity to define them. It works across any domain because it doesn't care about the domain. It cares about the person.

**The proof:** We pointed it at music without changing the math. Out came [WaxFeed](https://wax-feed.com) — a living cognitive profile of how you experience music. 26 unique listener archetypes emerged from the data, not from us deciding what they should be.

**What we've shipped:**
- [The Algorithm](https://algorithm.polarity-lab.com) — the full pitch, one page
- [Polarity OS](https://polarity-lab.com) — 205+ API endpoints, full cognitive operating system
- [WaxFeed](https://wax-feed.com) — music cognitive profiles
- [FUCKONMYDJ](https://fuckonmydj.com) — DJ marketplace
- [Painpoints](https://painpoints.site) — fund problems, not promises

**Business model:** 15% lab fee for developers who build on the platform (lower than App Store's 30%). You bring the domain, we bring the understanding.

**The ask:** We're pre-revenue and raising. Would love feedback from this community on the pitch and approach. What questions would you have as an investor seeing this for the first time?

Happy to answer anything.`,
  },

  // ── r/artificial ──
  {
    subreddit: "artificial",
    title: "We're building AI that understands what matters to people — not just what they said",
    body: `After 500 conversations, ChatGPT still doesn't know what matters to you. The project that kept you up for months and a throwaway question from Tuesday sit side by side. It has your history. It doesn't feel the weight of any of it.

We built an algorithm that fixes this.

**The core idea:** Things that repeat carry weight. Change carries weight. Who someone is compounds over time. A system that understands someone should know what was heavy enough to hold onto and let the rest go.

**How it works:**
- **Patterns** — Things that recur across sessions are identified and confirmed
- **Drift** — The algorithm knows what "normal" looks like for each person and detects when it shifts
- **Identity** — A living cognitive profile that reflects that people aren't static
- **Memory** — Not a chat log. Comprehension. It keeps what mattered and lets the rest go.

We classify every interaction across 7 cognitive networks (based on the Yeo 7-network neuroscience model): frontoparietal, default mode, dorsal attention, ventral attention, limbic, somatomotor, visual.

**The proof it works:** We pointed it at music without retraining. Same math, different vocabulary. Out came [WaxFeed](https://wax-feed.com) — 26 unique listener archetypes that emerged from the data.

The algorithm is domain-agnostic. Music was first. Healthcare, finance, education — the math doesn't change.

Full technical pitch: [algorithm.polarity-lab.com](https://algorithm.polarity-lab.com)

Would love to discuss the approach with this community. What are the biggest risks you see?`,
  },

  // ── r/MachineLearning ──
  {
    subreddit: "MachineLearning",
    title: "[P] Conversational Connectomics — measuring cognitive weight from conversational data",
    body: `We're working on what we call "Conversational Connectomics" (CCX) — an approach to building persistent cognitive profiles from conversational interactions.

**The problem:** Current LLM architectures are stateless. Memory solutions (RAG, long context) treat all information as equally weighted. A mention of your mother's health and a question about pizza toppings occupy the same semantic space.

**Our approach:**

We built an algorithm that assigns cognitive weight to conversational elements based on:

1. **Repetition** (0.20 weight) — Appears multiple times across sessions
2. **Emotional charge** (0.25) — Strong affect markers detected
3. **Connection** (0.15) — Links to existing confirmed patterns
4. **Personal relevance** (0.25) — Relates to goals/identity markers
5. **Novelty** (0.15) — New behavior worth tracking

Messages are classified using the Yeo 7-network model (frontoparietal, DMN, dorsal attention, ventral attention, limbic, somatomotor, visual) to capture the cognitive mode of each interaction.

**Pattern lifecycle:**
- Emerging (1-2 sessions) → Track, don't rely on
- Confirming (3-4 sessions) → Weight in predictions
- Confirmed (5+ sessions) → Core to identity profile
- Fading (absent 3+ sessions) → Flag, may remove

**Memory retrieval** uses Bayesian 5-dimensional scoring rather than pure semantic similarity.

**Drift detection** monitors behavioral divergence from established baselines — useful for both personalization and potential clinical applications.

**Results:** Deployed on music domain without retraining. Generated 26 distinct behavioral archetypes from user data. User-to-user matching based on cognitive profiles outperforms playlist overlap.

Working toward fine-tuning on aggregated relationship data — training a model that understands dyadic dynamics as a first-class concept.

Lab site: [polarity-lab.com](https://polarity-lab.com)
Technical pitch: [algorithm.polarity-lab.com](https://algorithm.polarity-lab.com)

Happy to discuss methodology, limitations, and directions.`,
  },

  // ── r/SaaS ──
  {
    subreddit: "SaaS",
    title: "Built a platform company with a 15% take rate (vs App Store's 30%) — here's the model",
    body: `We're Polarity Lab. We built an algorithm that measures what things matter to people based on how they talk about it. Then we turned it into a platform.

**The platform model:**
- Developers build on top of our cognitive identity layer
- 15% lab fee on revenue (half of App Store's 30%)
- They get: the algorithm, authentication via cognitive fingerprint, user base, and discovery
- We get: more conversation data that makes the algorithm smarter

**What we provide to developers:**
- Cognitive identity API — know your users deeply
- Pattern detection — what matters to each person
- Drift detection — when behavior changes
- Domain-agnostic — works for any vertical

**Our own products as proof:**
- [WaxFeed](https://wax-feed.com) — music cognitive profiles
- [FUCKONMYDJ](https://fuckonmydj.com) — DJ marketplace
- [Painpoints](https://painpoints.site) — problem marketplace

**Pricing tiers for end users:**
- Free: 100 msgs/mo
- Pro ($15/mo): 1,000 msgs/mo
- Pro+ ($25/mo): 3,000 msgs/mo
- Vault ($40/mo): Unlimited

**Year 1 projection at 10K users:** ~$832K revenue

We've been live since October 2025. Two founders. Providence, RI. Pre-revenue, raising.

Full details: [polarity-lab.com](https://polarity-lab.com)

What would make you build on a platform like this vs rolling your own personalization?`,
  },

  // ── r/musicproduction ──
  {
    subreddit: "musicproduction",
    title: "We built an AI that actually understands how you listen to music — not just what you play",
    body: `Most music recommendation is based on what you play. Spotify looks at listening history, collaborative filtering, audio features. It works, but it doesn't *understand* you.

We built something different.

[WaxFeed](https://wax-feed.com) builds a cognitive profile of how you experience music. Not your playlist — your relationship with sound.

**How it works:**
- Tracks what repeats in how you talk about and interact with music
- Identifies what changes over time (your taste evolves, the system evolves with you)
- Builds a living profile that reflects who you are as a listener

**What came out of it:**
- 26 unique listener archetypes emerged from the data. We didn't design them — they appeared.
- User-to-user matching based on how people actually think about music, not overlapping playlists
- Your "TasteID" — a cognitive identity that's yours and portable

The algorithm underneath isn't even a music algorithm. It's a general-purpose system that measures what things *weigh* in someone's life. We pointed it at music and this is what came out.

Built by [Polarity Lab](https://polarity-lab.com) in Providence, RI.

Curious what this community thinks about the approach. What would you want a system like this to know about how you experience music?`,
  },

  // ── r/DJs ──
  {
    subreddit: "DJs",
    title: "We built a DJ marketplace that's actually about the music — no agencies, no middlemen",
    body: `Launched [FUCKONMYDJ](https://fuckonmydj.com) this week.

The idea is simple: find DJs by their actual sound, book them directly. No agencies taking a cut, no middlemen, no bullshit.

**How it works:**
- Browse DJs by genre, location, and vibe
- See ratings, hourly rates, and verified status
- Book directly

We built it on top of [Polarity Lab's](https://polarity-lab.com) algorithm — the same system that powers [WaxFeed](https://wax-feed.com) (music cognitive profiles). Eventually the matching will be cognitive, not just tag-based. You'll find DJs who think about music the way you do.

Just launched, so the DJ roster is early. If you're a DJ who wants to be listed, hit us up.

Would love feedback from this community. What's missing from how you currently find/book gigs or find DJs for events?`,
  },

  // ── r/entrepreneur ──
  {
    subreddit: "Entrepreneur",
    title: "Two founders, 5 products in 4 months, zero funding — here's what we learned",
    body: `We're Polarity Lab, incorporated September 2025 in Providence, RI. Two founders. No funding. Five live products.

**The timeline:**
- Sep '25 — Incorporated
- Oct '25 — Launched AVDP (long-form conversation podcast that doubles as research data)
- Dec '25 — Polarity ships agentic tools (web search, workspace, live documents)
- Jan '26 — WaxFeed beta (first live deployment of the algorithm on music)
- Jan '26 — Painpoints.site launches (fund problems, not promises)
- Feb '26 — FUCKONMYDJ launches (DJ marketplace)

**What connects them all:** One algorithm. It measures what things *weigh* in someone's life. Every product we ship generates real conversations. Those conversations make the algorithm smarter. The thing people use and the thing we study are the same thing.

**Biggest lessons:**

1. **Ship the proof, not the pitch.** Nobody cares about your algorithm until they can touch what it built. WaxFeed made the algorithm real.

2. **Same math, different words.** The algorithm is domain-agnostic. When we deployed to music, we didn't retrain. We adapted the vocabulary. That's the moat.

3. **Two people can ship a lot if you don't overthink it.** Every product was built and shipped in days, not months. The algorithm does the heavy lifting.

4. **Entertainment is research.** AVDP (our podcast) generates the conversation data the algorithm learns from. The entertainment product IS the research pipeline.

5. **15% > 30%.** Our platform take rate is 15% (vs App Store 30%). Developers who build on our cognitive identity layer keep more.

Full story: [polarity-lab.com](https://polarity-lab.com)
The algorithm: [algorithm.polarity-lab.com](https://algorithm.polarity-lab.com)

Happy to answer questions about the build process, the tech, or the business model.`,
  },

  // ── r/technology ──
  {
    subreddit: "technology",
    title: "A research lab built an algorithm that measures what matters to people — and it's domain-agnostic",
    body: `Polarity Lab (Providence, RI) published their algorithm pitch at [algorithm.polarity-lab.com](https://algorithm.polarity-lab.com).

The core claim: They built an algorithm that measures the "weight" that things carry in someone's life. Not what was said — what was important enough to hold onto.

**Key points:**
- Uses what they call "Conversational Connectomics" — analyzing patterns in how people talk to measure cognitive weight
- Domain-agnostic: the same algorithm, without retraining, was deployed on music and generated 26 unique listener archetypes
- Based on the Yeo 7-network neuroscience model for cognitive classification
- Detects "drift" — when someone's behavior diverges from their established baseline
- Built-in ethics: no predictive policing, no risk scoring, coercion detection, right to deletion, IRB for research

**Live products:**
- [WaxFeed](https://wax-feed.com) — music cognitive profiles
- [FUCKONMYDJ](https://fuckonmydj.com) — DJ marketplace
- [Painpoints](https://painpoints.site) — problem marketplace

They're positioning it as a layer that sits underneath existing systems to give them the ability to understand the people they serve.

Interesting approach. The privacy/ethics stance is explicit. Thoughts?`,
  },

  // ── r/Providence ──
  {
    subreddit: "providence",
    title: "Local AI startup just shipped 5 products — Polarity Lab, based here in PVD",
    body: `Hey Providence,

Just wanted to share — there's a startup called [Polarity Lab](https://polarity-lab.com) based here in Providence that's been shipping like crazy.

They built an algorithm that measures what things matter to people based on how they talk about it, then deployed it across multiple products:

- [WaxFeed](https://wax-feed.com) — music app that builds your cognitive listening profile
- [FUCKONMYDJ](https://fuckonmydj.com) — DJ marketplace (just launched)
- [Painpoints](https://painpoints.site) — platform for funding solutions to problems
- Plus their podcast AVDP (A Very Distant Perspective)

Two founders, incorporated here in September 2025. Pretty cool to see this kind of tech coming out of PVD.

Full pitch: [algorithm.polarity-lab.com](https://algorithm.polarity-lab.com)`,
  },

  // ── r/indiehackers ──
  {
    subreddit: "indiehackers",
    title: "Shipped 5 products on the same core algorithm — here's the compounding loop",
    body: `Most indie hackers build separate products. We built one algorithm and pointed it at different domains.

**The algorithm:** Measures what things *weigh* in someone's life. Not sentiment analysis. Not keyword extraction. Cognitive weight — based on what repeats, what changes, and what defines someone over time.

**The compounding loop:**
1. Every product generates conversations
2. Those conversations feed the algorithm
3. The algorithm gets smarter
4. Smarter algorithm = better products
5. Better products = more conversations
6. Repeat

**The products:**
- WaxFeed (music) — pointed the algorithm at music, 26 archetypes emerged
- FUCKONMYDJ (DJ marketplace) — same algorithm, different domain
- Painpoints (problem marketplace) — fund solutions to real problems
- AVDP (podcast) — entertainment that doubles as research data
- Polarity OS (the platform) — 205+ API endpoints

**The economics:**
- Two founders, no funding
- Every product shares the same backend
- Each new deployment is vocabulary adaptation, not rebuilding
- 15% platform fee for third-party developers

This is the flywheel: more products → more data → better algorithm → more products.

[polarity-lab.com](https://polarity-lab.com) | [algorithm.polarity-lab.com](https://algorithm.polarity-lab.com)`,
  },
];

export function getRedditPostsForSubreddits(subreddits: string[]): RedditPost[] {
  return REDDIT_POSTS.filter((post) =>
    subreddits.includes(post.subreddit)
  );
}

export function getAllSubreddits(): string[] {
  return [...new Set(REDDIT_POSTS.map((p) => p.subreddit))];
}
