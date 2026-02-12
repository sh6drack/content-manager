/**
 * VC Target List for Polarity Lab
 *
 * Categorized by investment thesis alignment:
 * - AI/ML focused
 * - Consumer / Social
 * - Music / Entertainment / Creator
 * - Healthcare / Digital Health
 * - Fintech
 * - Platform / SaaS / Enterprise
 * - Pre-seed / Seed generalist
 *
 * NOTE: Email addresses marked with [NEEDS_EMAIL] need to be found.
 * Use LinkedIn, firm websites, or Hunter.io to locate.
 * Most VC email patterns: firstname@firm.com or first.last@firm.com
 */

import type { VCContact } from "./email-templates";

// ─── AI / ML Focused VCs ───

const AI_ML_VCS: VCContact[] = [
  // Tier 1 — AI-native funds
  { name: "Ian Hogarth", email: "ian@airstreetcapital.com", firm: "Air Street Capital", title: "General Partner", focus: ["ai", "machine learning", "deep tech"], stage: "seed", location: "London / SF" },
  { name: "Sarah Guo", email: "sarah@conviction.com", firm: "Conviction", title: "General Partner", focus: ["ai", "machine learning", "enterprise ai"], stage: "seed", location: "San Francisco" },
  { name: "Matt Bornstein", email: "matt@a16z.com", firm: "a16z", title: "General Partner", focus: ["ai", "machine learning", "infrastructure"], stage: "seed", location: "San Francisco" },
  { name: "Jill Chase", email: "jill@basisset.com", firm: "Basis Set Ventures", title: "Managing Partner", focus: ["ai", "machine learning"], stage: "seed", location: "San Francisco" },
  { name: "Rob Toews", email: "rob@radical.vc", firm: "Radical Ventures", title: "Partner", focus: ["ai", "machine learning", "deep tech"], stage: "seed", location: "Toronto" },
  { name: "Zavain Dar", email: "zavain@lux.capital", firm: "Lux Capital", title: "Partner", focus: ["ai", "deep tech", "frontier"], stage: "seed", location: "New York" },
  { name: "Martin Casado", email: "martin@a16z.com", firm: "a16z", title: "General Partner", focus: ["ai", "infrastructure", "open source"], stage: "seed", location: "San Francisco" },
  { name: "Tina Huang", email: "tina@translinkcapital.com", firm: "Translink Capital", title: "Managing Partner", focus: ["ai", "deep tech"], stage: "seed", location: "San Francisco" },
  { name: "Ash Fontana", email: "ash@zettaventure.com", firm: "Zetta Venture Partners", title: "Managing Partner", focus: ["ai", "machine learning", "analytics"], stage: "seed", location: "San Francisco" },
  { name: "Nathan Benaich", email: "nathan@airstreetcapital.com", firm: "Air Street Capital", title: "General Partner", focus: ["ai", "machine learning"], stage: "seed", location: "London" },
  { name: "Darian Shirazi", email: "darian@gradient.com", firm: "Gradient Ventures", title: "General Partner", focus: ["ai", "machine learning"], stage: "seed", location: "San Francisco" },
  { name: "Andrew Ng", email: "contact@aifund.ai", firm: "AI Fund", title: "Managing General Partner", focus: ["ai", "machine learning", "deep tech"], stage: "seed", location: "Palo Alto" },
  { name: "Pieter Abbeel", email: "pieter@covariant.ai", firm: "Robot Fund", title: "General Partner", focus: ["ai", "robotics", "machine learning"], stage: "seed", location: "Berkeley" },

  // Tier 2 — AI-interested generalists
  { name: "Elad Gil", email: "elad@eladgil.com", firm: "Elad Gil", title: "Investor", focus: ["ai", "consumer", "infrastructure"], stage: "seed", location: "San Francisco" },
  { name: "Lachy Groom", email: "lachy@lachygroom.com", firm: "Lachy Groom", title: "Solo GP", focus: ["ai", "fintech", "infrastructure"], stage: "seed", location: "San Francisco" },
  { name: "Jack Altman", email: "jack@altmancap.com", firm: "Altman Capital", title: "General Partner", focus: ["ai", "saas", "enterprise"], stage: "seed", location: "San Francisco" },
  { name: "Dylan Field", email: "dylan@lemniscap.com", firm: "Angel Investor", title: "Investor", focus: ["ai", "design", "creator tools"], stage: "seed", location: "San Francisco" },
];

// ─── Consumer / Social VCs ───

const CONSUMER_SOCIAL_VCS: VCContact[] = [
  { name: "Josh Buckley", email: "josh@contrary.com", firm: "Contrary", title: "General Partner", focus: ["consumer", "social", "community"], stage: "seed", location: "San Francisco" },
  { name: "Rex Woodbury", email: "rex@indexventures.com", firm: "Index Ventures", title: "Partner", focus: ["consumer", "social", "creator economy"], stage: "seed", location: "San Francisco" },
  { name: "Kirsten Green", email: "kirsten@forerunnerventures.com", firm: "Forerunner Ventures", title: "Founder & Managing Partner", focus: ["consumer", "commerce", "culture"], stage: "seed", location: "San Francisco" },
  { name: "Niko Bonatsos", email: "niko@generalcatalyst.com", firm: "General Catalyst", title: "Managing Director", focus: ["consumer", "ai", "social"], stage: "seed", location: "San Francisco" },
  { name: "Andrew Chen", email: "andrew@a16z.com", firm: "a16z", title: "General Partner", focus: ["consumer", "social", "marketplace", "network effects"], stage: "seed", location: "San Francisco" },
  { name: "Alexis Ohanian", email: "alexis@776.org", firm: "776", title: "Founder", focus: ["consumer", "social", "community", "creator economy"], stage: "seed", location: "New York" },
  { name: "Turner Novak", email: "turner@bananacapital.com", firm: "Banana Capital", title: "Founder & GP", focus: ["consumer", "social", "creator economy"], stage: "pre-seed", location: "Austin" },
  { name: "Li Jin", email: "li@variantfund.com", firm: "Variant", title: "General Partner", focus: ["creator economy", "consumer", "social"], stage: "seed", location: "San Francisco" },
  { name: "Brian Norgard", email: "brian@fifth.vc", firm: "Fifth Wall", title: "Advisor", focus: ["consumer", "marketplace", "social"], stage: "seed", location: "Los Angeles" },
  { name: "Jason Calacanis", email: "jason@calacanis.com", firm: "LAUNCH", title: "General Partner", focus: ["consumer", "ai", "startups"], stage: "seed", location: "San Francisco" },
  { name: "Cyan Banister", email: "cyan@longjourney.vc", firm: "Long Journey Ventures", title: "General Partner", focus: ["consumer", "social", "moonshots"], stage: "seed", location: "San Francisco" },
  { name: "Chris Dixon", email: "chris@a16z.com", firm: "a16z crypto", title: "General Partner", focus: ["consumer", "platform", "web3"], stage: "seed", location: "San Francisco" },
  { name: "Blake Robbins", email: "blake@ludlow.vc", firm: "Ludlow Ventures", title: "General Partner", focus: ["consumer", "social", "gaming", "creator economy"], stage: "seed", location: "Detroit" },
  { name: "Brianne Kimmel", email: "brianne@worklife.vc", firm: "Work-Life Ventures", title: "Founder & GP", focus: ["consumer", "social", "future of work"], stage: "pre-seed", location: "San Francisco" },
];

// ─── Music / Entertainment / Creator VCs ───

const MUSIC_ENTERTAINMENT_VCS: VCContact[] = [
  { name: "Troy Carter", email: "troy@q-and-a.com", firm: "Q&A", title: "Founder & GP", focus: ["music", "entertainment", "creator economy"], stage: "seed", location: "Los Angeles" },
  { name: "Scooter Braun", email: "info@sbprojects.com", firm: "SB Projects / TQ Ventures", title: "Managing Partner", focus: ["music", "entertainment", "media"], stage: "seed", location: "Los Angeles" },
  { name: "Guy Oseary", email: "guy@soundventures.com", firm: "Sound Ventures", title: "Managing Partner", focus: ["music", "entertainment", "technology"], stage: "seed", location: "Los Angeles" },
  { name: "Ashton Kutcher", email: "ashton@soundventures.com", firm: "Sound Ventures", title: "Co-founder", focus: ["entertainment", "consumer", "technology"], stage: "seed", location: "Los Angeles" },
  { name: "Zach Katz", email: "zach@lyricfinancial.com", firm: "Raised in Space", title: "Co-founder", focus: ["music", "technology", "blockchain"], stage: "seed", location: "Los Angeles" },
  { name: "Shara Senderoff", email: "shara@raisedspace.com", firm: "Raised in Space", title: "Co-founder & President", focus: ["music", "technology", "innovation"], stage: "seed", location: "Los Angeles" },
  { name: "Ben Horowitz", email: "ben@a16z.com", firm: "a16z", title: "Co-founder & GP", focus: ["entertainment", "consumer", "enterprise"], stage: "seed", location: "San Francisco", notes: "Huge hip-hop head. Writes about music constantly." },
  { name: "MC Hammer", email: "info@alchemisthub.com", firm: "Alchemist Accelerator", title: "Advisor", focus: ["music", "technology", "ai"], stage: "seed", location: "San Francisco" },
  { name: "Chamillionaire", email: "cham@convoypartners.com", firm: "Convoy Ventures", title: "General Partner", focus: ["music", "entertainment", "consumer"], stage: "seed", location: "Houston" },
  { name: "Will.i.am", email: "info@iamplus.com", firm: "i.am+", title: "Founder", focus: ["music", "ai", "technology"], stage: "seed", location: "Los Angeles" },
  { name: "Nas", email: "info@queenbridge.vc", firm: "Queensbridge Venture Partners", title: "General Partner", focus: ["music", "consumer", "technology"], stage: "seed", location: "New York" },
  { name: "D.A. Wallach", email: "da@tvcapital.com", firm: "Time BioVentures", title: "Partner", focus: ["music", "biotech", "technology"], stage: "seed", location: "Los Angeles", notes: "Former Spotify artist-in-residence. Deep music-tech." },
  { name: "Nihal Mehta", email: "nihal@eniac.vc", firm: "Eniac Ventures", title: "General Partner", focus: ["consumer", "mobile", "music tech"], stage: "pre-seed", location: "New York" },
];

// ─── Healthcare / Digital Health VCs ───

const HEALTH_VCS: VCContact[] = [
  { name: "Julie Yoo", email: "julie@a16z.com", firm: "a16z Bio", title: "General Partner", focus: ["digital health", "healthcare", "ai"], stage: "seed", location: "San Francisco" },
  { name: "Vijay Pande", email: "vijay@a16z.com", firm: "a16z Bio", title: "General Partner", focus: ["digital health", "ai", "biotech"], stage: "seed", location: "San Francisco" },
  { name: "Halle Tecco", email: "halle@rockhealth.com", firm: "Rock Health", title: "Co-founder", focus: ["digital health", "healthcare technology"], stage: "seed", location: "San Francisco" },
  { name: "Unity Stoakes", email: "unity@startuphealth.com", firm: "StartUp Health", title: "Co-founder & President", focus: ["digital health", "healthcare innovation"], stage: "seed", location: "New York" },
  { name: "Steve Kraus", email: "steve@bvp.com", firm: "Bessemer Venture Partners", title: "Partner", focus: ["healthcare", "digital health"], stage: "seed", location: "San Francisco" },
  { name: "Lynne Chou O'Keefe", email: "lynne@definecapital.com", firm: "Define Ventures", title: "Founder & Managing Partner", focus: ["digital health", "healthcare ai"], stage: "seed", location: "San Francisco" },
  { name: "Jorge Conde", email: "jorge@a16z.com", firm: "a16z Bio", title: "General Partner", focus: ["healthcare", "biotech", "ai"], stage: "seed", location: "San Francisco" },
  { name: "Deena Shakir", email: "deena@luxcapital.com", firm: "Lux Capital", title: "Partner", focus: ["digital health", "ai", "deep tech"], stage: "seed", location: "San Francisco" },
];

// ─── Fintech VCs ───

const FINTECH_VCS: VCContact[] = [
  { name: "Angela Strange", email: "angela@a16z.com", firm: "a16z Fintech", title: "General Partner", focus: ["fintech", "financial services", "ai"], stage: "seed", location: "San Francisco" },
  { name: "Anish Acharya", email: "anish@a16z.com", firm: "a16z Fintech", title: "General Partner", focus: ["fintech", "consumer finance"], stage: "seed", location: "San Francisco" },
  { name: "Sheel Mohnot", email: "sheel@betterfuture.vc", firm: "Better Tomorrow Ventures", title: "General Partner", focus: ["fintech"], stage: "pre-seed", location: "San Francisco" },
  { name: "Jake Gibson", email: "jake@betterfuture.vc", firm: "Better Tomorrow Ventures", title: "General Partner", focus: ["fintech"], stage: "pre-seed", location: "San Francisco" },
  { name: "Nik Milanovic", email: "nik@thisfuture.co", firm: "This Week in Fintech", title: "Founder", focus: ["fintech", "consumer finance"], stage: "seed", location: "New York" },
  { name: "Matt Harris", email: "matt@bain.com", firm: "Bain Capital Ventures", title: "Partner", focus: ["fintech", "financial services"], stage: "seed", location: "New York" },
  { name: "Amias Gerety", email: "amias@qed.com", firm: "QED Investors", title: "Partner", focus: ["fintech", "financial services", "ai"], stage: "seed", location: "Washington DC" },
  { name: "Nigel Morris", email: "nigel@qed.com", firm: "QED Investors", title: "Co-founder & Managing Partner", focus: ["fintech", "financial services"], stage: "seed", location: "Washington DC" },
];

// ─── Platform / SaaS / Enterprise VCs ───

const PLATFORM_VCS: VCContact[] = [
  { name: "David Sacks", email: "david@craft.co", firm: "Craft Ventures", title: "General Partner", focus: ["saas", "enterprise", "marketplace", "ai"], stage: "seed", location: "San Francisco" },
  { name: "Jason Lemkin", email: "jason@saastr.com", firm: "SaaStr Fund", title: "General Partner", focus: ["saas", "enterprise", "b2b"], stage: "seed", location: "San Francisco" },
  { name: "Tomasz Tunguz", email: "tomasz@theory.vc", firm: "Theory Ventures", title: "General Partner", focus: ["ai", "saas", "data infrastructure"], stage: "seed", location: "San Francisco" },
  { name: "Ed Sim", email: "ed@boldstart.vc", firm: "Boldstart Ventures", title: "Founder & Managing Partner", focus: ["enterprise", "developer tools", "ai"], stage: "pre-seed", location: "New York" },
  { name: "Immad Akhund", email: "immad@mercury.com", firm: "Mercury Fund", title: "CEO & Investor", focus: ["saas", "fintech", "ai"], stage: "seed", location: "San Francisco" },
  { name: "Harry Stebbings", email: "harry@20vc.com", firm: "20VC", title: "Founder & Managing Partner", focus: ["saas", "consumer", "ai"], stage: "seed", location: "London / SF" },
  { name: "Eric Newcomer", email: "eric@newcomer.co", firm: "Newcomer", title: "Journalist & Angel", focus: ["enterprise", "ai"], stage: "seed", location: "San Francisco" },
  { name: "Garry Tan", email: "garry@ycombinator.com", firm: "Y Combinator", title: "CEO & President", focus: ["saas", "ai", "consumer", "enterprise"], stage: "pre-seed", location: "San Francisco" },
];

// ─── Pre-seed / Seed Generalist VCs ───

const GENERALIST_VCS: VCContact[] = [
  { name: "Sahil Lavingia", email: "sahil@shl.vc", firm: "SHL Capital", title: "Founder & GP", focus: ["consumer", "creator economy", "ai"], stage: "pre-seed", location: "San Francisco" },
  { name: "Ryan Hoover", email: "ryan@weekend.fund", firm: "Weekend Fund", title: "General Partner", focus: ["consumer", "community", "product"], stage: "pre-seed", location: "San Francisco" },
  { name: "Cindy Bi", email: "cindy@capitalfactory.com", firm: "Capital Factory", title: "Partner", focus: ["ai", "consumer", "enterprise"], stage: "pre-seed", location: "Austin" },
  { name: "Michael Seibel", email: "michael@ycombinator.com", firm: "Y Combinator", title: "Managing Director", focus: ["ai", "consumer", "saas"], stage: "pre-seed", location: "San Francisco" },
  { name: "Precursor Ventures", email: "info@precursorvc.com", firm: "Precursor Ventures", title: "Team", focus: ["pre-seed", "diverse founders", "consumer"], stage: "pre-seed", location: "San Francisco" },
  { name: "Charles Hudson", email: "charles@precursorvc.com", firm: "Precursor Ventures", title: "Managing Partner", focus: ["pre-seed", "diverse founders", "consumer", "mobile"], stage: "pre-seed", location: "San Francisco" },
  { name: "Semil Shah", email: "semil@haystack.vc", firm: "Haystack", title: "General Partner", focus: ["consumer", "ai", "mobile"], stage: "seed", location: "San Francisco" },
  { name: "Anu Duggal", email: "anu@femalefoundersfund.com", firm: "Female Founders Fund", title: "Founding Partner", focus: ["consumer", "healthcare", "fintech"], stage: "seed", location: "New York" },
  { name: "Jeff Morris Jr", email: "jeff@chapterone.com", firm: "Chapter One", title: "General Partner", focus: ["consumer", "product", "marketplace"], stage: "seed", location: "Los Angeles" },
  { name: "Todd Goldberg", email: "todd@goldbergventures.com", firm: "Goldberg Ventures", title: "General Partner", focus: ["consumer", "ai", "product"], stage: "pre-seed", location: "Los Angeles" },
  { name: "Hunter Walk", email: "hunter@homebrew.co", firm: "Homebrew", title: "Partner", focus: ["consumer", "enterprise", "community"], stage: "seed", location: "San Francisco" },
  { name: "Phin Barnes", email: "phin@firstround.com", firm: "First Round Capital", title: "Partner", focus: ["consumer", "enterprise", "community"], stage: "seed", location: "San Francisco" },
  { name: "Eurie Kim", email: "eurie@foresite.com", firm: "Foresite Capital", title: "Managing Director", focus: ["healthcare", "ai", "consumer"], stage: "seed", location: "San Francisco" },
  { name: "Mike Maples Jr", email: "mike@floodgate.com", firm: "Floodgate", title: "Co-founder & Partner", focus: ["consumer", "ai", "enterprise"], stage: "seed", location: "San Francisco" },
  { name: "Ann Miura-Ko", email: "ann@floodgate.com", firm: "Floodgate", title: "Co-founder & Partner", focus: ["consumer", "ai", "enterprise"], stage: "seed", location: "San Francisco" },
  { name: "Pejman Nozad", email: "pejman@pear.vc", firm: "Pear VC", title: "Co-founder & Managing Partner", focus: ["ai", "consumer", "enterprise"], stage: "pre-seed", location: "San Francisco" },
  { name: "Mar Hershenson", email: "mar@pear.vc", firm: "Pear VC", title: "Co-founder & Managing Partner", focus: ["ai", "consumer", "enterprise"], stage: "pre-seed", location: "San Francisco" },

  // ─── East Coast / Providence-adjacent ───
  { name: "David Chang", email: "david@nestar.vc", firm: "Nestar Ventures", title: "General Partner", focus: ["consumer", "commerce"], stage: "seed", location: "New York" },
  { name: "Joanne Wilson", email: "joanne@gothamgal.com", firm: "Gotham Gal Ventures", title: "Founder", focus: ["consumer", "marketplace", "community"], stage: "seed", location: "New York" },
  { name: "Brad Feld", email: "brad@foundrygroup.com", firm: "Foundry Group", title: "Co-founder", focus: ["enterprise", "ai", "community"], stage: "seed", location: "Boulder" },
  { name: "Fred Wilson", email: "fred@usv.com", firm: "Union Square Ventures", title: "Co-founder & Partner", focus: ["platform", "network effects", "community"], stage: "seed", location: "New York" },
  { name: "Albert Wenger", email: "albert@usv.com", firm: "Union Square Ventures", title: "Managing Partner", focus: ["platform", "ai", "network effects"], stage: "seed", location: "New York" },
  { name: "Jenny Fielding", email: "jenny@everywhere.vc", firm: "Everywhere Ventures", title: "Managing Partner", focus: ["consumer", "ai", "community"], stage: "pre-seed", location: "New York" },
  { name: "David Tisch", email: "david@boxgroup.com", firm: "Box Group", title: "Co-founder", focus: ["consumer", "enterprise", "ai"], stage: "seed", location: "New York" },
];

// ─── PRIORITY: Thesis-Aligned Investors (from research) ───

const PRIORITY_VCS: VCContact[] = [
  { name: "Anne Lee Skates", email: "anne@parablevc.com", firm: "Parable", title: "Solo GP", focus: ["consumer", "ai", "social", "creator economy"], stage: "seed", location: "San Francisco", notes: "Ex-a16z consumer partner. Thesis: non-ad-supported social, AI-native experiences. Invested in Delphi (AI digital minds), Status (interactive GenAI). Series match: cognitive identity = non-ad social infra." },
  { name: "Katie Rae", email: "katie@engine.xyz", firm: "The Engine (MIT)", title: "CEO & Managing Partner", focus: ["deep tech", "ai", "biotech", "science"], stage: "seed", location: "Cambridge, MA", notes: "MIT tough-tech fund. Theo's Boyden Lab connection is a direct pipeline. They fund research-grounded tech that's hard to replicate." },
  { name: "Maia Bittner", email: "maia@dayoneventures.com", firm: "Day One Ventures", title: "General Partner", focus: ["consumer", "ai", "narrative-driven founders"], stage: "seed", location: "San Francisco", notes: "Focuses on narrative + product. MD student at Brown, MIT neuroscience -> built a cognitive algorithm -> deployed in 4 domains = their kind of founder narrative." },
  { name: "Hemant Taneja", email: "hemant@generalcatalyst.com", firm: "General Catalyst", title: "Managing Partner", focus: ["healthcare", "ai", "enterprise"], stage: "seed", location: "San Francisco", notes: "GC Health Practice. MD + Boyden Lab + algorithm applicable to healthcare behavioral detection. Direct pitch." },
  { name: "Steve Huffman", email: "steve@reddit.com", firm: "Reddit / Angel", title: "CEO of Reddit", focus: ["consumer", "social", "community"], stage: "seed", location: "San Francisco", notes: "Invested in Series (Yale AI social network). Pattern: backs AI social products from student founders." },
];

// ─── Accelerators & Programs ───

const ACCELERATOR_VCS: VCContact[] = [
  { name: "Y Combinator", email: "apply@ycombinator.com", firm: "Y Combinator", title: "Applications", focus: ["ai", "consumer", "enterprise"], stage: "pre-seed", location: "San Francisco" },
  { name: "Techstars", email: "info@techstars.com", firm: "Techstars", title: "Applications", focus: ["ai", "consumer", "enterprise"], stage: "pre-seed", location: "Boulder" },
  { name: "Ravi Belani", email: "ravi@alchemistaccelerator.com", firm: "Alchemist Accelerator", title: "Managing Director", focus: ["enterprise", "ai", "deep tech"], stage: "pre-seed", location: "San Francisco" },
  { name: "Paul Singh", email: "paul@dashventures.co", firm: "Dash Ventures", title: "Managing Partner", focus: ["ai", "data", "enterprise"], stage: "pre-seed", location: "Washington DC" },
  { name: "Betaworks", email: "hi@betaworks.com", firm: "Betaworks", title: "Team", focus: ["ai", "consumer", "media"], stage: "pre-seed", location: "New York" },
];

// ─── Export All ───

export const ALL_VCS: VCContact[] = [
  ...PRIORITY_VCS, // Thesis-aligned investors go first
  ...AI_ML_VCS,
  ...CONSUMER_SOCIAL_VCS,
  ...MUSIC_ENTERTAINMENT_VCS,
  ...HEALTH_VCS,
  ...FINTECH_VCS,
  ...PLATFORM_VCS,
  ...GENERALIST_VCS,
  ...ACCELERATOR_VCS,
];

export const VC_CATEGORIES = {
  "priority": PRIORITY_VCS,
  "ai-ml": AI_ML_VCS,
  "consumer-social": CONSUMER_SOCIAL_VCS,
  "music-entertainment": MUSIC_ENTERTAINMENT_VCS,
  "healthcare": HEALTH_VCS,
  "fintech": FINTECH_VCS,
  "platform-saas": PLATFORM_VCS,
  "generalist": GENERALIST_VCS,
  "accelerators": ACCELERATOR_VCS,
} as const;

export type VCCategory = keyof typeof VC_CATEGORIES;

export function getVCsByCategory(categories: VCCategory[]): VCContact[] {
  return categories.flatMap((cat) => VC_CATEGORIES[cat]);
}

export function getVCStats() {
  return {
    total: ALL_VCS.length,
    byCategory: Object.entries(VC_CATEGORIES).map(([key, vcs]) => ({
      category: key,
      count: vcs.length,
    })),
  };
}
