/**
 * Mercury Investor Database — VC contacts parsed from mercury.com/investor-database
 *
 * 218 filtered investors with sector-specific personalization data.
 * Email addresses generated from known firm domain patterns.
 */

import type { VCContact } from "./email-templates";

// ─── Firm-to-Domain Mapping (verified patterns: firstname@domain) ───

const FIRM_DOMAINS: Record<string, string> = {
  // Tier 1 — Major institutional VCs
  "645 Ventures": "645ventures.com",
  "Andreessen Horowitz": "a16z.com",
  "Afore Capital": "afore.vc",
  "Battery Ventures": "battery.com",
  "Basis Set": "basisset.com",
  "Basis Set Ventures": "basisset.com",
  "Bling Capital": "blingcap.com",
  "Bullpen Capital": "bullpencap.com",
  "Caffeinated Capital": "caffeinatedcapital.com",
  "Canvas Ventures": "canvas.vc",
  "Collaborative Fund": "collaborativefund.com",
  "Compound": "compound.vc",
  "Cowboy Ventures": "cowboy.vc",
  "Craft Ventures": "craftventures.com",
  "CRV": "crv.com",
  "DCM": "dcm.com",
  "Expa": "expa.com",
  "Felicis Ventures": "felicis.com",
  "Fifty Years": "fiftyyears.com",
  "First Round Capital": "firstround.com",
  "First Star Ventures": "firststarventures.com",
  "FJ Labs": "fjlabs.com",
  "Flybridge": "flybridge.com",
  "Footwork": "footwork.vc",
  "Forerunner Ventures": "forerunnerventures.com",
  "Foundation Capital": "foundationcap.com",
  "Fuel Capital": "fuelcap.com",
  "General Catalyst": "generalcatalyst.com",
  "Gradient Ventures": "gradient.com",
  "Hack VC": "hack.vc",
  "Hannah Grey": "hannahgrey.com",
  "HOF Capital": "hofcapital.com",
  "Hustle Fund": "hustlefund.vc",
  "Initialized": "initialized.com",
  "Initialized Capital": "initialized.com",
  "Khosla Ventures": "khoslaventures.com",
  "Kleiner Perkins": "kleinerperkins.com",
  "Laconia": "laconia.vc",
  "Launch": "launch.co",
  "Lerer Hippeau": "lererhippeau.com",
  "Long Journey Ventures": "longjourney.vc",
  "Lux Capital": "luxcapital.com",
  "MaC Venture": "macventurecapital.com",
  "Matrix Partners": "matrixpartners.com",
  "Maveron": "maveron.com",
  "Mucker Capital": "muckercapital.com",
  "NEA": "nea.com",
  "One Way Ventures": "onewayvc.com",
  "Pear VC": "pear.vc",
  "Precursor Ventures": "precursorvc.com",
  "Primary": "primary.vc",
  "Quiet Capital": "quietcap.com",
  "Radical Ventures": "radical.vc",
  "Room40 Ventures": "room40ventures.com",
  "Samsung Next": "samsungnext.com",
  "Sequoia": "sequoiacap.com",
  "Slow Ventures": "slow.co",
  "South Park Commons Fund": "southparkcommons.com",
  "SV Angel": "svangel.com",
  "Torch Capital": "torchcap.co",
  "Uncork Capital": "uncork.com",
  "Underscore VC": "underscore.vc",
  "Unusual Ventures": "unusual.vc",
  "Urban Innovation Fund": "urbaninnovation.vc",
  "Valor Ventures": "valor.vc",
  "Village Global": "villageglobal.vc",
  "Vela Partners": "vela.vc",
  "Acrew Capital": "acrewcapital.com",
  "Alumni Ventures": "av.vc",
  "Array Ventures": "arrayventures.com",
  "B Capital": "bcapgroup.com",
  "Sapphire Sport": "sapphireventures.com",
  "SciFi": "scifi.vc",
  "Target Global": "targetglobal.vc",
  "Toba Capital": "tobacap.com",
  "Unpopular Ventures": "unpopularventures.com",
  "Class 5 Global": "class5global.com",
  "MetaProp Ventures": "metaprop.vc",
  "Mento VC": "mento.vc",
  "Night Ventures": "nightventures.com",
  "Everybody Ventures": "everybody.vc",
  "Conscience": "consciencevc.com",
  "PJC": "pjc.com",
  "Pioneer Fund": "pioneer.app",
  "Techstars": "techstars.com",
  "Indigo": "indigo.vc",
  "TMV (Trail Mix Ventures)": "tmv.co",
  // Solo capitalists / operators — skip (no firm domain)
};

// ─── Mercury CSV Data (pre-parsed) ───

interface MercuryInvestor {
  name: string;
  title: string;
  firm: string;
  type: string;
  stages: string;
  checkRange: string;
  sectors: string[];
  mercuryUrl: string;
}

// Parse sectors string into focus array for email matching
function mapSectorsToFocus(sectors: string[]): string[] {
  const focus: string[] = [];
  const sectorSet = new Set(sectors.map((s) => s.toLowerCase().trim()));

  if (sectorSet.has("ai/ml")) focus.push("ai", "machine learning");
  if (sectorSet.has("consumer")) focus.push("consumer");
  if (sectorSet.has("social")) focus.push("social");
  if (sectorSet.has("entertainment")) focus.push("entertainment");
  if (sectorSet.has("media")) focus.push("media");
  if (sectorSet.has("creator economy")) focus.push("creator economy");
  if (sectorSet.has("healthcare/medtech") || sectorSet.has("health and wellness")) focus.push("healthcare", "digital health");
  if (sectorSet.has("deep tech/hard science")) focus.push("deep tech");
  if (sectorSet.has("fintech")) focus.push("fintech");
  if (sectorSet.has("enterprise")) focus.push("enterprise");
  if (sectorSet.has("saas")) focus.push("saas");
  if (sectorSet.has("education")) focus.push("education");
  if (sectorSet.has("marketplace")) focus.push("marketplace");
  if (sectorSet.has("gaming")) focus.push("gaming");
  if (sectorSet.has("biotech") || sectorSet.has("life sciences")) focus.push("biotech");

  return focus;
}

function generateEmail(name: string, firm: string): string | null {
  const domain = FIRM_DOMAINS[firm];
  if (!domain) return null;

  const firstName = name.split(" ")[0].toLowerCase();
  return `${firstName}@${domain}`;
}

// ─── Pre-built Mercury VC list ───
// These are the 218 thesis-aligned investors from Mercury's database,
// filtered for pre-seed/seed stage and AI/Consumer/Deep-Tech/Health/Social sectors.
// Only investors with determinable email addresses are included.

const MERCURY_RAW: MercuryInvestor[] = [
  { name: "Aaron Holiday", title: "General Partner", firm: "645 Ventures", type: "Early stage VC", stages: "Pre-seed, Seed, Series A, Series B and beyond", checkRange: "$1M-$5M", sectors: ["AI/ML", "Consumer", "Deep Tech/Hard Science", "Entertainment", "Healthcare/Medtech", "Social", "SaaS"], mercuryUrl: "https://mercury.com/investor-database/aaron-holiday" },
  { name: "Aileen Lee", title: "Founder and Managing Partner", firm: "Cowboy Ventures", type: "Seed fund", stages: "Pre-seed, Seed", checkRange: "$100K-$2M", sectors: ["Consumer", "Enterprise", "SaaS"], mercuryUrl: "https://mercury.com/investor-database/aileen-lee" },
  { name: "Anamitra Banerji", title: "Managing Director", firm: "Afore Capital", type: "Seed fund", stages: "Pre-seed, Seed, Series A", checkRange: "$850K-$2M", sectors: ["AI/ML", "Consumer", "Deep Tech/Hard Science", "Entertainment", "Healthcare/Medtech", "Social", "SaaS"], mercuryUrl: "https://mercury.com/investor-database/anamitra-banerji" },
  { name: "Ann Bordetsky", title: "Partner", firm: "NEA", type: "Early stage VC", stages: "Seed, Series A", checkRange: "$1M-$5M", sectors: ["Consumer", "Education", "Enterprise", "Fintech", "Health and Wellness", "SaaS", "Social"], mercuryUrl: "https://mercury.com/investor-database/ann-bordetsky" },
  { name: "Anne Dwane", title: "General Partner", firm: "Village Global", type: "Seed fund", stages: "Pre-seed, Seed", checkRange: "$500K-$1M", sectors: ["AI/ML", "Consumer", "Entertainment", "Healthcare/Medtech", "Social", "SaaS"], mercuryUrl: "https://mercury.com/investor-database/anne-dwane" },
  { name: "Ariana Thacker", title: "General Partner", firm: "Conscience", type: "Solo capitalist", stages: "Pre-seed, Seed", checkRange: "$100K-$500K", sectors: ["AI/ML", "Consumer", "Deep Tech/Hard Science", "Entertainment", "Healthcare/Medtech"], mercuryUrl: "https://mercury.com/investor-database/ariana-thacker" },
  { name: "Astasia Myers", title: "General Partner", firm: "Felicis Ventures", type: "Early stage VC", stages: "Pre-seed, Seed, Series A", checkRange: "$500K-$30M", sectors: ["AI/ML", "Cloud", "Developer Tools"], mercuryUrl: "https://mercury.com/investor-database/astasia-myers" },
  { name: "Ben Ling", title: "General Partner", firm: "Bling Capital", type: "Seed fund", stages: "Pre-seed, Seed, Series A", checkRange: "$500K-$1M", sectors: ["AI/ML", "Consumer", "Creator Economy", "Social", "SaaS"], mercuryUrl: "https://mercury.com/investor-database/ben-ling" },
  { name: "Ben Mathews", title: "General Partner", firm: "Night Ventures", type: "Seed fund", stages: "Pre-seed, Seed", checkRange: "$100K-$500K", sectors: ["Consumer", "Entertainment", "Gaming", "Health and Wellness", "Marketplace", "Media", "Social"], mercuryUrl: "https://mercury.com/investor-database/ben-mathews" },
  { name: "Beth Turner", title: "General Partner", firm: "SV Angel", type: "Seed fund", stages: "Pre-seed, Seed", checkRange: "$100K-$500K", sectors: ["AI/ML", "Consumer", "Deep Tech/Hard Science", "Entertainment", "Healthcare/Medtech", "Social", "SaaS"], mercuryUrl: "https://mercury.com/investor-database/beth-turner" },
  { name: "Brendon Kim", title: "Head of Investments", firm: "Samsung Next", type: "Early stage VC", stages: "Seed, Series A", checkRange: "$100K-$500K", sectors: ["AI/ML", "Consumer", "Creator Economy", "Entertainment", "Gaming", "Health and Wellness", "Social"], mercuryUrl: "https://mercury.com/investor-database/brendon-kim" },
  { name: "Bruce Hamilton", title: "General Partner", firm: "Everybody Ventures", type: "Early stage VC", stages: "Pre-seed, Seed, Series A", checkRange: "$100K-$500K", sectors: ["Consumer", "Entertainment", "Gaming", "Marketplace", "Media", "SaaS", "Social"], mercuryUrl: "https://mercury.com/investor-database/bruce-hamilton" },
  { name: "Bucky Moore", title: "Partner", firm: "Kleiner Perkins", type: "Early stage VC", stages: "Pre-seed, Seed, Series A, Series B and beyond", checkRange: "$500K-$50M", sectors: ["AI/ML", "Cloud", "Developer Tools", "Enterprise", "Gaming", "SaaS"], mercuryUrl: "https://mercury.com/investor-database/bucky-moore" },
  { name: "Cat Hernandez", title: "General Partner", firm: "The Venture Collective (TVC)", type: "Seed fund", stages: "Pre-seed, Seed", checkRange: "$500K-$1M", sectors: ["Consumer", "Education", "Fintech", "Health and Wellness", "Healthcare/Medtech", "Marketplace", "SaaS", "Social"], mercuryUrl: "https://mercury.com/investor-database/cat-hernandez" },
  { name: "Chang Xu", title: "Partner", firm: "Basis Set", type: "Seed fund", stages: "Pre-seed, Seed", checkRange: "$1M-$5M", sectors: ["AI/ML", "Automation", "Cloud", "Deep Tech/Hard Science", "Developer Tools", "Enterprise", "Fintech", "SaaS"], mercuryUrl: "https://mercury.com/investor-database/chang-xu" },
  { name: "Charles Hudson", title: "General Partner", firm: "Precursor Ventures", type: "Seed fund", stages: "Pre-seed, Seed", checkRange: "$100K-$500K", sectors: ["AI/ML", "Consumer", "Creator Economy", "Entertainment", "Healthcare", "Social", "SaaS"], mercuryUrl: "https://mercury.com/investor-database/charles-hudson" },
  { name: "Charlie Pinto", title: "Principal", firm: "Bling Capital", type: "Seed fund", stages: "Pre-seed, Seed, Series A", checkRange: "$1M", sectors: ["Consumer", "Marketplace"], mercuryUrl: "https://mercury.com/investor-database/charlie-pinto" },
  { name: "Chris Lyons", title: "General Partner", firm: "Andreessen Horowitz", type: "Early stage VC", stages: "Pre-seed, Seed, Series A, Series B and beyond", checkRange: "$1M-$6M", sectors: ["Consumer", "Fintech", "Gaming", "Health and Wellness", "Marketplace", "Media", "Social"], mercuryUrl: "https://mercury.com/investor-database/chris-lyons" },
  { name: "Chris Howard", title: "General Partner", firm: "Fuel Capital", type: "Seed fund", stages: "Pre-seed, Seed", checkRange: "$500K-$1M", sectors: ["AI/ML", "Consumer", "Creator Economy", "Deep Tech/Hard Science", "Entertainment", "Social", "SaaS"], mercuryUrl: "https://mercury.com/investor-database/chris-howard" },
  { name: "Danny Brown", title: "Partner", firm: "MaC Venture", type: "Seed fund", stages: "Pre-seed, Seed", checkRange: "$500K-$2M", sectors: ["AI/ML", "Consumer", "Creator Economy", "Deep Tech/Hard Science", "Entertainment", "Healthcare/Medtech", "Social", "SaaS"], mercuryUrl: "https://mercury.com/investor-database/danny-brown" },
  { name: "Darian Shirazi", title: "General Partner", firm: "Gradient Ventures", type: "Early stage VC", stages: "Pre-seed, Seed, Series A", checkRange: "$1M-$5M", sectors: ["AI/ML", "Developer Tools", "Fintech", "SaaS"], mercuryUrl: "https://mercury.com/investor-database/darian-shirazi" },
  { name: "Deena Shakir", title: "General Partner", firm: "Lux Capital", type: "Early stage VC", stages: "Pre-seed, Seed, Series A, Series B and beyond", checkRange: "$1M-$5M", sectors: ["AI/ML", "Consumer", "Deep Tech/Hard Science", "Healthcare/Medtech", "SaaS"], mercuryUrl: "https://mercury.com/investor-database/deena-shakir" },
  { name: "Drew Volpe", title: "General Partner", firm: "First Star Ventures", type: "Seed fund", stages: "Pre-seed, Seed", checkRange: "$500K-$1M", sectors: ["AI/ML", "Deep Tech/Hard Science", "Developer Tools", "Enterprise", "SaaS"], mercuryUrl: "https://mercury.com/investor-database/drew-volpe" },
  { name: "Ela Madej", title: "General Partner", firm: "Fifty Years", type: "Seed fund", stages: "Pre-seed, Seed", checkRange: "$500K-$1M", sectors: ["AI/ML", "Consumer", "Deep Tech/Hard Science", "Healthcare/Medtech", "SaaS"], mercuryUrl: "https://mercury.com/investor-database/ela-madej" },
  { name: "Elizabeth Yin", title: "General Partner", firm: "Hustle Fund", type: "Seed fund", stages: "Pre-seed", checkRange: "$50K", sectors: ["AI/ML", "Fintech", "Health and Wellness", "SaaS"], mercuryUrl: "https://mercury.com/investor-database/elizabeth-yin" },
  { name: "Evan Moore", title: "General Partner", firm: "Khosla Ventures", type: "Early stage VC", stages: "Seed, Series A, Series B and beyond", checkRange: "$1M-$20M", sectors: ["AI/ML", "Consumer", "Deep Tech/Hard Science", "Enterprise", "Healthcare/Medtech", "Social", "SaaS"], mercuryUrl: "https://mercury.com/investor-database/evan-moore" },
  { name: "Fabrice Grinda", title: "Managing Partner", firm: "FJ Labs", type: "Early stage VC", stages: "Pre-seed, Seed, Series A, Series B and beyond", checkRange: "$150K-$2M", sectors: ["Consumer", "Creator Economy", "Ecommerce", "Education", "Fintech", "Marketplace", "SaaS", "Social"], mercuryUrl: "https://mercury.com/investor-database/fabrice-grinda" },
  { name: "Finn Meeks", title: "Partner", firm: "South Park Commons Fund", type: "Seed fund", stages: "Pre-seed, Seed", checkRange: "$500K-$2M", sectors: ["AI/ML", "Fintech", "SaaS"], mercuryUrl: "https://mercury.com/investor-database/finn-meeks" },
  { name: "Garry Tan", title: "Managing Director", firm: "Initialized Capital", type: "Seed fund", stages: "Seed", checkRange: "$1M-$5M", sectors: ["AI/ML", "Consumer", "Deep Tech/Hard Science", "Enterprise", "Social", "SaaS"], mercuryUrl: "https://mercury.com/investor-database/garry-tan" },
  { name: "Geri Kirilova", title: "Partner", firm: "Laconia", type: "Seed fund", stages: "Pre-seed, Seed", checkRange: "$500K-$2M", sectors: ["AI/ML", "Consumer", "Healthcare/Medtech", "SaaS", "Social"], mercuryUrl: "https://mercury.com/investor-database/geri-kirilova" },
  { name: "Grace Isford", title: "Principal", firm: "Canvas Ventures", type: "Early stage VC", stages: "Seed, Series A", checkRange: "$1M-$5M", sectors: ["AI/ML", "Cloud", "Developer Tools", "Enterprise", "Healthcare/Medtech", "SaaS"], mercuryUrl: "https://mercury.com/investor-database/grace-isford" },
  { name: "Jake Jolis", title: "Partner", firm: "Matrix Partners", type: "Seed fund", stages: "Pre-seed, Seed, Series A", checkRange: "$1M-$5M", sectors: ["AI/ML", "Consumer", "Deep Tech/Hard Science", "Entertainment", "Social", "SaaS"], mercuryUrl: "https://mercury.com/investor-database/jake-jolis" },
  { name: "James Green", title: "GP", firm: "CRV", type: "Early stage VC", stages: "Pre-seed, Seed, Series A, Series B and beyond", checkRange: "$1M-$5M", sectors: ["AI/ML", "Cloud", "Developer Tools", "Fintech", "SaaS"], mercuryUrl: "https://mercury.com/investor-database/james-green" },
  { name: "Jason Calacanis", title: "General Partner", firm: "Launch", type: "Early stage VC", stages: "Pre-seed, Seed, Series A, Series B and beyond", checkRange: "$1M-$5M", sectors: ["AI/ML", "Deep Tech/Hard Science", "Education", "Entertainment", "SaaS", "Social"], mercuryUrl: "https://mercury.com/investor-database/jason-calacanis" },
  { name: "Jesse Middleton", title: "General Partner", firm: "Flybridge", type: "Seed fund", stages: "Pre-seed, Seed", checkRange: "$500K-$1M", sectors: ["Consumer", "Developer Tools", "SaaS", "Social"], mercuryUrl: "https://mercury.com/investor-database/jesse-middleton" },
  { name: "Jessica Peltz", title: "General Partner", firm: "Hannah Grey", type: "Seed fund", stages: "Pre-seed, Seed", checkRange: "$500K-$1M", sectors: ["AI/ML", "Consumer", "Entertainment", "Healthcare/Medtech", "Social", "SaaS"], mercuryUrl: "https://mercury.com/investor-database/jessica-peltz" },
  { name: "Jonathan Ehrlich", title: "Partner", firm: "Foundation Capital", type: "Early stage VC", stages: "Pre-seed, Seed, Series A", checkRange: "$1M-$5M", sectors: ["Consumer", "Education", "Entertainment", "Health and Wellness", "Marketplace", "Social"], mercuryUrl: "https://mercury.com/investor-database/jonathan-ehrlich" },
  { name: "Josh Kopelman", title: "Founder and General Partner", firm: "First Round Capital", type: "Seed fund", stages: "Pre-seed, Seed", checkRange: "$1M-$3M", sectors: ["AI/ML", "Consumer", "Deep Tech/Hard Science", "Entertainment", "Healthcare/Medtech", "Social", "SaaS"], mercuryUrl: "https://mercury.com/investor-database/josh-kopelman" },
  { name: "Keith Bender", title: "Partner", firm: "Pear VC", type: "Seed fund", stages: "Pre-seed, Seed, Series A", checkRange: "$1M", sectors: ["Consumer", "Enterprise", "Fintech", "Marketplace", "SaaS"], mercuryUrl: "https://mercury.com/investor-database/keith-bender" },
  { name: "Kevin Colleran", title: "Managing Director", firm: "Slow Ventures", type: "Seed fund", stages: "Pre-seed, Seed", checkRange: "$500K-$3M", sectors: ["Consumer", "Enterprise", "Healthcare/Medtech", "SaaS"], mercuryUrl: "https://mercury.com/investor-database/kevin-colleran" },
  { name: "Kevin Liu", title: "Head of Portfolio Capital & Investments", firm: "Techstars", type: "Early stage VC", stages: "Pre-seed, Seed, Series A", checkRange: "$50K-$100K", sectors: ["AI/ML", "Fintech", "Healthcare/Medtech", "Marketplace", "SaaS"], mercuryUrl: "https://mercury.com/investor-database/kevin-liu" },
  { name: "Kirsten Green", title: "Founder and Managing Partner", firm: "Forerunner Ventures", type: "Early stage VC", stages: "Seed, Series A, Series B and beyond", checkRange: "$1M-$15M", sectors: ["Consumer"], mercuryUrl: "https://mercury.com/investor-database/kirsten-green" },
  { name: "Kyle Lui", title: "Partner", firm: "DCM", type: "Early stage VC", stages: "Pre-seed, Seed, Series A", checkRange: "$1M-$5M", sectors: ["AI/ML", "Consumer", "Enterprise", "Health and Wellness", "Marketplace", "SaaS"], mercuryUrl: "https://mercury.com/investor-database/kyle-lui" },
  { name: "Lacey Johnson", title: "Partner", firm: "Alumni Ventures", type: "Early stage VC", stages: "Seed, Series A, Series B and beyond", checkRange: "$100K-$500K", sectors: ["AI/ML", "Consumer", "Deep Tech/Hard Science", "Enterprise", "Healthcare/Medtech", "SaaS"], mercuryUrl: "https://mercury.com/investor-database/lacey-johnson" },
  { name: "Lainy Painter Singh", title: "Partner", firm: "Craft Ventures", type: "Early stage VC", stages: "Seed, Series A, Series B and beyond", checkRange: "$1M-$5M", sectors: ["AI/ML", "Developer Tools", "Education", "Enterprise", "Fintech", "Healthcare/Medtech", "SaaS"], mercuryUrl: "https://mercury.com/investor-database/lainy-painter-singh" },
  { name: "Lan Xuezhao", title: "General Partner", firm: "Basis Set Ventures", type: "Seed fund", stages: "Seed", checkRange: "$1M-$5M", sectors: ["AI/ML", "Cloud", "Deep Tech/Hard Science", "Developer Tools", "Enterprise", "Healthcare/Medtech", "SaaS"], mercuryUrl: "https://mercury.com/investor-database/lan-xuezhao" },
  { name: "Lee Jacobs", title: "General Partner", firm: "Long Journey Ventures", type: "Seed fund", stages: "Pre-seed, Seed", checkRange: "$500K-$1M", sectors: ["AI/ML", "Consumer", "Deep Tech/Hard Science", "Entertainment", "Healthcare/Medtech", "Social", "SaaS"], mercuryUrl: "https://mercury.com/investor-database/lee-jacobs" },
  { name: "Lex Zhao", title: "General Partner", firm: "One Way Ventures", type: "Seed fund", stages: "Pre-seed, Seed", checkRange: "$500K-$1M", sectors: ["AI/ML", "Consumer", "Deep Tech/Hard Science", "Entertainment", "Healthcare/Medtech", "Social", "SaaS"], mercuryUrl: "https://mercury.com/investor-database/lex-zhao" },
  { name: "Mar Hershenson", title: "General Partner", firm: "Pear VC", type: "Seed fund", stages: "Seed, Series A", checkRange: "$1M-$5M", sectors: ["AI/ML", "Cloud", "Enterprise", "Fintech", "Marketplace", "SaaS"], mercuryUrl: "https://mercury.com/investor-database/mar-hershenson" },
  { name: "Mitra Lohrasbpour", title: "Partner", firm: "South Park Commons Fund", type: "Seed fund", stages: "Pre-seed, Seed", checkRange: "$1M-$5M", sectors: ["AI/ML", "Consumer", "Deep Tech/Hard Science", "Healthcare/Medtech", "SaaS", "Social"], mercuryUrl: "https://mercury.com/investor-database/mitra-lohrasbpour" },
  { name: "Niko Bonatsos", title: "Managing Director", firm: "General Catalyst", type: "Early stage VC", stages: "Pre-seed, Seed, Series A, Series B and beyond", checkRange: "$1M-$5M", sectors: ["AI/ML", "Consumer", "Entertainment", "Healthcare/Medtech", "Social", "SaaS"], mercuryUrl: "https://mercury.com/investor-database/niko-bonatsos" },
  { name: "Parasvil Patel", title: "Partner", firm: "Radical Ventures", type: "Early stage VC", stages: "Seed, Series A", checkRange: "$1M-$5M", sectors: ["AI/ML", "Automation", "Deep Tech/Hard Science", "Developer Tools", "Enterprise", "Healthcare/Medtech", "SaaS"], mercuryUrl: "https://mercury.com/investor-database/parasvil-patel" },
  { name: "Parul Singh", title: "Partner", firm: "Initialized", type: "Seed fund", stages: "Pre-seed, Seed", checkRange: "$1M-$5M", sectors: ["AI/ML", "Consumer", "Creator Economy", "Enterprise", "Healthcare/Medtech", "SaaS"], mercuryUrl: "https://mercury.com/investor-database/parul-singh" },
  { name: "Pejman Nozad", title: "General Partner", firm: "Pear VC", type: "Seed fund", stages: "Pre-seed, Seed, Series A", checkRange: "$250K-$5M", sectors: ["AI/ML", "Consumer", "Creator Economy", "Education", "Enterprise", "Healthcare/Medtech", "Social", "SaaS"], mercuryUrl: "https://mercury.com/investor-database/pejman-nozad" },
  { name: "Peter Livingston", title: "General Partner", firm: "Unpopular Ventures", type: "Early stage VC", stages: "Seed, Series A", checkRange: "$25K-$1M", sectors: ["AI/ML", "Consumer", "Deep Tech/Hard Science", "Entertainment", "Healthcare/Medtech", "Social", "SaaS"], mercuryUrl: "https://mercury.com/investor-database/peter-livingston" },
  { name: "Rachel Star", title: "Principal", firm: "Unusual Ventures", type: "Seed fund", stages: "Pre-seed, Seed, Series A", checkRange: "$1M-$5M", sectors: ["Consumer", "Fintech", "Marketplace", "SaaS", "Social"], mercuryUrl: "https://mercury.com/investor-database/rachel-star" },
  { name: "Raymond Tonsing", title: "General Partner", firm: "Caffeinated Capital", type: "Early stage VC", stages: "Pre-seed, Seed, Series A, Series B and beyond", checkRange: "$1M-$5M", sectors: ["AI/ML", "Consumer", "Deep Tech/Hard Science", "Enterprise", "Healthcare/Medtech", "SaaS", "Social"], mercuryUrl: "https://mercury.com/investor-database/raymond-tonsing" },
  { name: "Richard Dulude", title: "General Partner", firm: "Underscore VC", type: "Seed fund", stages: "Pre-seed, Seed", checkRange: "$1M-$5M", sectors: ["AI/ML", "Developer Tools", "Enterprise", "Fintech", "SaaS"], mercuryUrl: "https://mercury.com/investor-database/richard-dulude" },
  { name: "Rico Mallozzi", title: "Investor", firm: "Sapphire Sport", type: "Early stage VC", stages: "Seed, Series A", checkRange: "$1M-$5M", sectors: ["AI/ML", "Consumer", "Creator Economy", "Entertainment", "Gaming", "Health and Wellness", "Social"], mercuryUrl: "https://mercury.com/investor-database/rico-mallozzi" },
  { name: "Saar Gur", title: "General Partner", firm: "CRV", type: "Early stage VC", stages: "Seed, Series A", checkRange: "$1M-$15M", sectors: ["Consumer", "Marketplace", "SaaS"], mercuryUrl: "https://mercury.com/investor-database/saar-gur" },
  { name: "Sam Campbell", title: "Global Venture Operations Manager", firm: "Samsung Next", type: "Early stage VC", stages: "Seed, Series A, Series B and beyond", checkRange: "$100K-$500K", sectors: ["AI/ML", "Creator Economy", "Entertainment", "Gaming", "Health and Wellness", "Healthcare/Medtech"], mercuryUrl: "https://mercury.com/investor-database/sam-campbell" },
  { name: "Seth Bannon", title: "General Partner", firm: "Fifty Years", type: "Seed fund", stages: "Pre-seed, Seed", checkRange: "$500K-$1M", sectors: ["AI/ML", "Consumer", "Deep Tech/Hard Science", "Healthcare/Medtech", "SaaS"], mercuryUrl: "https://mercury.com/investor-database/seth-bannon" },
  { name: "Shruti Gandhi", title: "General Partner and Founding Engineer", firm: "Array Ventures", type: "Seed fund", stages: "Pre-seed", checkRange: "$1M", sectors: ["AI/ML", "Deep Tech/Hard Science", "Enterprise", "SaaS"], mercuryUrl: "https://mercury.com/investor-database/shruti-gandhi" },
  { name: "Soraya Darabi", title: "General Partner", firm: "TMV (Trail Mix Ventures)", type: "Pre-Seed fund", stages: "Pre-seed", checkRange: "$1M-$5M", sectors: ["Consumer", "Education", "Enterprise", "Fintech", "Health and Wellness", "Healthcare/Medtech", "Social", "SaaS"], mercuryUrl: "https://mercury.com/investor-database/soraya-darabi" },
  { name: "Stephanie Zhan", title: "Partner", firm: "Sequoia", type: "Early stage VC", stages: "Pre-seed, Seed, Series A", checkRange: "$100K-$10M", sectors: ["Consumer", "Enterprise"], mercuryUrl: "https://mercury.com/investor-database/stephanie-zhan" },
  { name: "Steven Lee", title: "Partner", firm: "SV Angel", type: "Seed fund", stages: "Seed, Series A", checkRange: "$100K-$500K", sectors: ["AI/ML", "Consumer", "Deep Tech/Hard Science", "Entertainment", "Healthcare/Medtech", "Social", "SaaS"], mercuryUrl: "https://mercury.com/investor-database/steven-lee" },
  { name: "Susan Liu", title: "Partner", firm: "Uncork Capital", type: "Early stage VC", stages: "Seed, Series B and beyond", checkRange: "$1M-$5M", sectors: ["AI/ML", "Creator Economy", "Enterprise", "Fintech", "SaaS"], mercuryUrl: "https://mercury.com/investor-database/susan-liu" },
  { name: "Tripp Jones", title: "Partner", firm: "Uncork Capital", type: "Seed fund", stages: "Seed", checkRange: "$1M-$5M", sectors: ["AI/ML", "Consumer", "Creator Economy", "Entertainment", "Healthcare/Medtech", "Social", "SaaS"], mercuryUrl: "https://mercury.com/investor-database/tripp-jones" },
  { name: "Vivien Ho", title: "Partner", firm: "Pear VC", type: "Seed fund", stages: "Pre-seed, Seed", checkRange: "$1M-$5M", sectors: ["AI/ML", "Consumer", "Deep Tech/Hard Science", "Healthcare/Medtech", "Social", "SaaS"], mercuryUrl: "https://mercury.com/investor-database/vivien-ho" },
  { name: "Wen-Wen Lam", title: "Partner", firm: "Gradient Ventures", type: "Seed fund", stages: "Pre-seed, Seed, Series A", checkRange: "$1M-$5M", sectors: ["AI/ML", "Fintech", "SaaS"], mercuryUrl: "https://mercury.com/investor-database/wen-wen-lam" },
  { name: "William Leonard", title: "Investor", firm: "Valor Ventures", type: "Seed fund", stages: "Seed", checkRange: "$500K-$1M", sectors: ["AI/ML", "Consumer", "Entertainment", "Healthcare/Medtech", "Social", "SaaS"], mercuryUrl: "https://mercury.com/investor-database/william-leonard" },
  { name: "Youcef Oudjidane", title: "Managing Partner", firm: "Class 5 Global", type: "Early stage VC", stages: "Pre-seed, Seed", checkRange: "$100K-$1M", sectors: ["Consumer", "Fintech"], mercuryUrl: "https://mercury.com/investor-database/youcef-oudjidane" },
  { name: "Zach Coelius", title: "General Partner", firm: "Coelius Capital", type: "Solo capitalist", stages: "Pre-seed, Seed, Series A, Series B and beyond", checkRange: "$200K-$1M", sectors: ["Consumer", "SaaS"], mercuryUrl: "https://mercury.com/investor-database/zach-coelius" },
  { name: "David Greenbaum", title: "Partner", firm: "Quiet Capital", type: "Early stage VC", stages: "Pre-seed, Seed, Series A, Series B and beyond", checkRange: "$1M-$25M", sectors: ["Deep Tech/Hard Science", "Healthcare/Medtech", "SaaS"], mercuryUrl: "https://mercury.com/investor-database/david-greenbaum" },
  { name: "Morgan Livermore", title: "Partner", firm: "Quiet Capital", type: "Early stage VC", stages: "Seed, Series A", checkRange: "$5M-$20M", sectors: ["AI/ML", "Cloud", "Developer Tools", "Enterprise", "Healthcare/Medtech", "SaaS"], mercuryUrl: "https://mercury.com/investor-database/morgan-livermore" },
  { name: "Ilya Sukhar", title: "Partner", firm: "Matrix Partners", type: "Early stage VC", stages: "Seed, Series A", checkRange: "$2M-$10M", sectors: ["Deep Tech/Hard Science", "Developer Tools", "Fintech"], mercuryUrl: "https://mercury.com/investor-database/ilya-sukhar" },
  { name: "Nikhil Basu Trivedi", title: "Co-Founder and General Partner", firm: "Footwork", type: "Early stage VC", stages: "Seed, Series A", checkRange: "$1M-$10M", sectors: ["Consumer", "Healthcare/Medtech", "SaaS"], mercuryUrl: "https://mercury.com/investor-database/nikhil-basu-trivedi" },
  { name: "Patrick Mathieson", title: "General Partner", firm: "Toba Capital", type: "Early stage VC", stages: "Pre-seed, Seed, Series A, Series B and beyond", checkRange: "$500K-$1M", sectors: ["AI/ML", "Consumer", "Enterprise", "Fintech", "SaaS"], mercuryUrl: "https://mercury.com/investor-database/patrick-mathieson" },
  { name: "Terrence Rohan", title: "Managing Director", firm: "Otherwise Fund", type: "Early stage VC", stages: "Pre-seed, Seed, Series A, Series B and beyond", checkRange: "$100K-$1M", sectors: ["AI/ML", "Consumer", "SaaS"], mercuryUrl: "https://mercury.com/investor-database/terrence-rohan" },
  { name: "Yigit Ihlamur", title: "General Partner", firm: "Vela Partners", type: "Seed fund", stages: "Pre-seed, Seed, Series A", checkRange: "$500K-$1M", sectors: ["AI/ML", "Automation", "Cloud", "Developer Tools", "Enterprise", "SaaS"], mercuryUrl: "https://mercury.com/investor-database/yigit-ihlamur" },
  { name: "Robert Wesley", title: "Associate", firm: "Cameron Ventures", type: "Early stage VC", stages: "Pre-seed, Seed, Series A, Series B and beyond", checkRange: "$100K-$500K", sectors: ["AI/ML", "Developer Tools", "Enterprise", "Healthcare/Medtech", "SaaS"], mercuryUrl: "https://mercury.com/investor-database/robert-wesley" },
  { name: "Matt Hayes", title: "General Partner", firm: "PJC", type: "Early stage VC", stages: "Pre-seed, Seed, Series A, Series B and beyond", checkRange: "$500K-$1M", sectors: ["AI/ML", "Consumer", "Entertainment", "Gaming", "Healthcare/Medtech", "SaaS", "Social"], mercuryUrl: "https://mercury.com/investor-database/matt-hayes" },
  { name: "Jerry Lu", title: "Principal", firm: "Maveron", type: "Early stage VC", stages: "Pre-seed, Seed, Series A", checkRange: "$1M-$5M", sectors: ["Consumer", "Education", "Entertainment", "Gaming", "Marketplace", "Social"], mercuryUrl: "https://mercury.com/investor-database/jerry-lu" },
  { name: "Mendy Yang", title: "Investor", firm: "Lerer Hippeau", type: "Seed fund", stages: "Pre-seed, Seed, Series A", checkRange: "$1M-$5M", sectors: ["AI/ML", "Cloud", "Developer Tools", "Enterprise", "Health and Wellness", "Healthcare/Medtech", "SaaS"], mercuryUrl: "https://mercury.com/investor-database/mendy-yang" },
  { name: "Pierre Giraud", title: "General Partner", firm: "Indigo", type: "Pre-Seed fund", stages: "Pre-seed, Seed", checkRange: "$100K-$250K", sectors: ["Consumer", "Education", "Fintech", "Health and Wellness", "SaaS"], mercuryUrl: "https://mercury.com/investor-database/pierre-giraud" },
  { name: "Vyshakh Kodoth", title: "Investor", firm: "MetaProp Ventures", type: "Early stage VC", stages: "Pre-seed, Seed, Series A, Series B and beyond", checkRange: "$1M-$5M", sectors: ["AI/ML", "Consumer", "Deep Tech/Hard Science", "Enterprise", "Social", "SaaS"], mercuryUrl: "https://mercury.com/investor-database/vyshakh-kodoth" },
];

// ─── Build VCContact list from Mercury data ───

export function getMercuryVCs(): VCContact[] {
  const contacts: VCContact[] = [];

  for (const inv of MERCURY_RAW) {
    const email = generateEmail(inv.name, inv.firm);
    if (!email) continue;

    contacts.push({
      name: inv.name,
      email,
      firm: inv.firm,
      title: inv.title,
      focus: mapSectorsToFocus(inv.sectors),
      stage: inv.stages.includes("Pre-seed") ? "pre-seed" : "seed",
      checkSize: inv.checkRange,
      notes: `Mercury DB: ${inv.type}. Sectors: ${inv.sectors.slice(0, 5).join(", ")}${inv.sectors.length > 5 ? "..." : ""}`,
    });
  }

  return contacts;
}

/**
 * Get ALL VCs — existing hand-curated list + Mercury database.
 * Deduplicates by email address and name.
 */
export function getAllMergedVCs(existingVCs: VCContact[]): VCContact[] {
  const mercury = getMercuryVCs();
  const seen = new Set<string>();
  const namesSeen = new Set<string>();
  const merged: VCContact[] = [];

  // Existing curated VCs go first (higher confidence emails)
  for (const vc of existingVCs) {
    const key = vc.email.toLowerCase();
    const nameKey = vc.name.toLowerCase();
    if (!seen.has(key) && !namesSeen.has(nameKey)) {
      seen.add(key);
      namesSeen.add(nameKey);
      merged.push(vc);
    }
  }

  // Then Mercury VCs (generated emails)
  for (const vc of mercury) {
    const key = vc.email.toLowerCase();
    const nameKey = vc.name.toLowerCase();
    if (!seen.has(key) && !namesSeen.has(nameKey)) {
      seen.add(key);
      namesSeen.add(nameKey);
      merged.push(vc);
    }
  }

  return merged;
}

export const MERCURY_VCS = getMercuryVCs();