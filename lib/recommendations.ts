import prisma from "@/lib/db";

/**
 * Standard fallback SVG for product cards when an image is missing or null.
 * Preserves the approved editorial neutral palette (#F0EEE9 / #3A2F28).
 */
export const FALLBACK_PRODUCT_IMAGE =
  "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22600%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23F0EEE9%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22sans-serif%22%20font-size%3D%2224%22%20fill%3D%22%233A2F28%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fsvg%3E";

/**
 * Curated Architectural Pairings Registry
 * Priority 1: Explicit manual relationships reflecting verified atelier design intent.
 * Format: Primary Product SKU -> Ordered list of companion SKUs.
 */
export const CURATED_PAIRING_REGISTRY: Record<string, string[]> = {
  // SB-WD-001 (Curved Wooden Sideboard)
  "SB-WD-001": ["CT-MRB-FLT-001", "ST-BLK-SLD-001", "RT-WLN-001"],
  // CT-MRB-FLT-001 (Round Fluted Base Marble Top Coffee Table)
  "CT-MRB-FLT-001": ["SB-WD-001", "ST-BLK-SLD-001", "ST-OAK-002"],
  // RT-WLN-001 (Fluted Base Walnut Round Table)
  "RT-WLN-001": ["SB-WD-001", "UT-STL-001", "RT-WD-002"],
  // RT-WD-002 (Elegant Dark Wood Pedestal Round Table)
  "RT-WD-002": ["UT-STL-001", "TRK-MIN-DRK-002", "SB-WD-001"],
  // ST-BLK-SLD-001 (Solid Wood Block Side Table)
  "ST-BLK-SLD-001": ["CT-MRB-FLT-001", "SB-WD-001", "TRK-MIN-DRK-002"],
  // ST-OAK-002 (Modern Offset Oak Side Table)
  "ST-OAK-002": ["CT-MRB-FLT-001", "SB-WD-001", "ST-BLK-SLD-001"],
  // TRK-MIN-DRK-002 (Minimalist Dark Wood Storage Trunk)
  "TRK-MIN-DRK-002": ["UT-NEW-94", "UT-STL-001", "ST-BLK-SLD-001"],
  // TRK-WD-001 (Rustic Arched Panel Wooden Trunk)
  "TRK-WD-001": ["UT-NEW-94", "UT-STL-001", "ST-BLK-SLD-001"],
  // UT-STL-001 (Classic Wooden Stool)
  "UT-STL-001": ["RT-WLN-001", "RT-WD-002", "TRK-MIN-DRK-002"],
  // UT-NEW-94 (Carved Wooden Mirror Frame)
  "UT-NEW-94": ["SB-WD-001", "TRK-MIN-DRK-002", "TRK-WD-001"],
};

export interface RecommendationTarget {
  id: string;
  productCode: string;
  name: string;
  categoryId: string;
  category?: {
    id?: string;
    name: string;
    slug?: string;
  } | null;
  material: string | null;
  finish: string | null;
  colour?: string | null;
  description?: string | null;
  shortDescription?: string | null;
}

export interface CandidateProductRecord extends RecommendationTarget {
  length: number | null;
  width: number | null;
  height: number | null;
  dimensionUnit: string | null;
  status: string;
  images: {
    imageUrl: string;
    imageType: string | null;
  }[];
}

export interface FormattedRecommendation {
  id: string;
  name: string;
  productCode: string;
  shortDescription: string | null;
  mainImage: string;
  length: number | null;
  width: number | null;
  height: number | null;
  dimensionUnit: string | null;
  material: string | null;
}

/**
 * Functional category complement matrix:
 * Defines which furniture types architecturally co-exist in the same living,
 * dining, or entryway space.
 */
const CATEGORY_COMPATIBILITY: Record<string, Record<string, number>> = {
  sideboards: {
    "coffee-tables": 3,
    "side-tables": 3,
    "round-tables": 4, // Dining table + Sideboard is a classic suite
    mirrors: 4,        // Sideboard + Wall Mirror is a classic console pair
    stools: 2,
    trunks: 2,
  },
  "round-tables": {
    sideboards: 4,     // Dining table + Sideboard
    stools: 4,         // Dining table + seating
    "side-tables": 1,
    "coffee-tables": 0,// Two large centerpiece tables conflict
    "round-tables": 0, // Never pair two dining tables
  },
  "coffee-tables": {
    "side-tables": 4,  // Living room coffee table + accent side table
    sideboards: 3,     // Living room media/storage credenza
    stools: 3,         // Accent seating
    trunks: 2,         // Accent storage
    "round-tables": 0,
    "coffee-tables": 0,
  },
  "side-tables": {
    "coffee-tables": 4,
    sideboards: 3,
    stools: 2,
    trunks: 2,
    "side-tables": 1,  // Can pair nesting/accent tables if materials match
  },
  trunks: {
    mirrors: 4,        // Trunk + Mirror entryway or bedroom
    stools: 3,         // Accent bench/stool
    "side-tables": 2,
    sideboards: 2,
    "coffee-tables": 1,
  },
  mirrors: {
    sideboards: 4,     // Mirror above sideboard
    trunks: 4,         // Mirror above trunk
    "side-tables": 2,
    stools: 2,
  },
  stools: {
    "round-tables": 4, // Dining seating
    "coffee-tables": 3,// Living lounge seating
    trunks: 3,         // Foyer seating
    sideboards: 2,
    "side-tables": 2,
  },
};

/**
 * Normalizes category names or slugs into standardized keys
 */
function normalizeCategoryKey(nameOrSlug?: string | null): string {
  if (!nameOrSlug) return "";
  const clean = nameOrSlug.toLowerCase().trim();
  if (clean.includes("sideboard")) return "sideboards";
  if (clean.includes("coffee")) return "coffee-tables";
  if (clean.includes("round") || clean.includes("dining")) return "round-tables";
  if (clean.includes("side table") || clean.includes("side-table") || clean.includes("end table")) return "side-tables";
  if (clean.includes("trunk")) return "trunks";
  if (clean.includes("mirror")) return "mirrors";
  if (clean.includes("stool") || clean.includes("seating") || clean.includes("chair")) return "stools";
  return clean.replace(/[^a-z0-9]/g, "-");
}

/**
 * Normalizes text into lowercase tokens
 */
function tokenize(text: string | null | undefined): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

const TIMBER_SPECIES = ["walnut", "mango", "oak", "teak", "sheesham", "rosewood", "acacia", "hardwood"];
const STONE_MATERIALS = ["marble", "stone", "granite", "quartzite"];
const DESIGN_SIGNATURES = ["fluted", "curved", "minimalist", "pedestal", "arched", "patchwork", "tambour"];
const FINISH_TONES = ["espresso", "dark", "matte", "natural", "satin", "lacquer", "wax", "warm"];

/**
 * Minimum compatibility threshold score required for an automatic attribute recommendation.
 * Requires both meaningful functional room compatibility AND clear material/style affinity.
 */
export const MIN_COMPATIBILITY_THRESHOLD = 6;

/**
 * Calculates attribute compatibility score between target and candidate.
 * Returns 0 if incompatible or insufficient attributes exist.
 */
export function calculateCompatibilityScore(
  target: RecommendationTarget,
  candidate: RecommendationTarget
): number {
  // Rule: Never recommend self
  if (target.id === candidate.id || target.productCode === candidate.productCode) {
    return 0;
  }

  const targetCatKey = normalizeCategoryKey(target.category?.slug || target.category?.name);
  const candidateCatKey = normalizeCategoryKey(candidate.category?.slug || candidate.category?.name);

  // 1. Category Complementarity
  let categoryScore = 0;
  if (targetCatKey && candidateCatKey) {
    const matrix = CATEGORY_COMPATIBILITY[targetCatKey];
    if (matrix && typeof matrix[candidateCatKey] === "number") {
      categoryScore = matrix[candidateCatKey];
    } else if (targetCatKey === candidateCatKey) {
      // Incompatible if two identical major categories (e.g. 2 dining tables or 2 large trunks)
      categoryScore = 0;
    } else {
      // Neutral cross-category
      categoryScore = 1;
    }
  }

  // If categories are strictly incompatible (score 0), do not recommend
  if (categoryScore === 0) {
    return 0;
  }

  // 2. Material & Timber Species Affinity
  const targetMatTokens = tokenize(target.material);
  const candidateMatTokens = tokenize(candidate.material);
  const targetNameTokens = tokenize(target.name);
  const candidateNameTokens = tokenize(candidate.name);

  let materialScore = 0;

  // Check specific timber match (Walnut, Mango, Oak, etc.)
  for (const wood of TIMBER_SPECIES) {
    const targetHasWood = targetMatTokens.includes(wood) || targetNameTokens.includes(wood);
    const candidateHasWood = candidateMatTokens.includes(wood) || candidateNameTokens.includes(wood);
    if (targetHasWood && candidateHasWood) {
      materialScore += 4; // High affinity
      break;
    }
  }

  // Check stone & fluted wood pairing (Marble + Wood)
  const targetHasStone = targetMatTokens.some((t) => STONE_MATERIALS.includes(t));
  const candidateHasStone = candidateMatTokens.some((t) => STONE_MATERIALS.includes(t));
  const targetHasFluted = targetNameTokens.includes("fluted") || targetMatTokens.includes("fluted");
  const candidateHasFluted = candidateNameTokens.includes("fluted") || candidateMatTokens.includes("fluted");

  if ((targetHasStone && candidateHasFluted) || (candidateHasStone && targetHasFluted)) {
    materialScore += 4; // Distinctive architectural pairing (e.g. Marble Coffee Table + Fluted Sideboard/Table)
  }

  // 3. Design Signature Match (Fluted, Curved, Minimalist, Pedestal, Arched)
  let signatureScore = 0;
  for (const sig of DESIGN_SIGNATURES) {
    const targetHasSig = targetNameTokens.includes(sig) || tokenize(target.description).includes(sig);
    const candidateHasSig = candidateNameTokens.includes(sig) || tokenize(candidate.description).includes(sig);
    if (targetHasSig && candidateHasSig) {
      signatureScore += 3;
      break;
    }
  }

  // 4. Finish / Tone Match
  const targetFinishTokens = [...tokenize(target.finish), ...tokenize(target.colour)];
  const candidateFinishTokens = [...tokenize(candidate.finish), ...tokenize(candidate.colour)];

  let toneScore = 0;
  for (const tone of FINISH_TONES) {
    if (targetFinishTokens.includes(tone) && candidateFinishTokens.includes(tone)) {
      toneScore += 2;
      break;
    }
  }

  const totalScore = categoryScore + materialScore + signatureScore + toneScore;

  // Attribute requirement: Must meet minimal threshold to be considered compatible
  return totalScore >= MIN_COMPATIBILITY_THRESHOLD ? totalScore : 0;
}

/**
 * Formats a candidate database product record into the standard ProductCard shape
 */
export function formatRecommendationCard(product: CandidateProductRecord): FormattedRecommendation {
  const mainImage =
    product.images.find((i) => i.imageType === "MAIN")?.imageUrl ||
    product.images[0]?.imageUrl ||
    FALLBACK_PRODUCT_IMAGE;

  return {
    id: product.id,
    name: product.name,
    productCode: product.productCode,
    shortDescription: product.shortDescription ?? null,
    mainImage,
    length: product.length ?? null,
    width: product.width ?? null,
    height: product.height ?? null,
    dimensionUnit: product.dimensionUnit ?? null,
    material: product.material ?? null,
  };
}

/**
 * Pure recommendation selection engine (synchronous, testable without database).
 * Prioritizes curated relationships, followed by high-compatibility attribute matches.
 * Enforces maximum items, deduplication, self-exclusion, and published-only filtering.
 */
export function selectRecommendations(
  targetProduct: RecommendationTarget,
  publishedCandidates: CandidateProductRecord[],
  maxItems = 3
): FormattedRecommendation[] {
  const recommendations: FormattedRecommendation[] = [];
  const seenIds = new Set<string>([targetProduct.id]);
  const seenCodes = new Set<string>([targetProduct.productCode.toUpperCase()]);

  // Index candidates by SKU and ID for O(1) lookup
  const candidateByCode = new Map<string, CandidateProductRecord>();
  for (const cand of publishedCandidates) {
    if (cand.status === "PUBLISHED" && cand.id !== targetProduct.id) {
      candidateByCode.set(cand.productCode.toUpperCase(), cand);
    }
  }

  // Priority 1: Curated relationships
  const curatedCodes = CURATED_PAIRING_REGISTRY[targetProduct.productCode] || [];
  for (const code of curatedCodes) {
    if (recommendations.length >= maxItems) break;

    const companion = candidateByCode.get(code.toUpperCase());
    if (companion && !seenIds.has(companion.id) && !seenCodes.has(companion.productCode.toUpperCase())) {
      recommendations.push(formatRecommendationCard(companion));
      seenIds.add(companion.id);
      seenCodes.add(companion.productCode.toUpperCase());
    }
  }

  // Priority 2: Attribute-based recommendations (if slots remain)
  if (recommendations.length < maxItems) {
    const scoredCandidates: { product: CandidateProductRecord; score: number }[] = [];

    for (const cand of publishedCandidates) {
      if (cand.status !== "PUBLISHED") continue;
      if (seenIds.has(cand.id) || seenCodes.has(cand.productCode.toUpperCase())) continue;

      const score = calculateCompatibilityScore(targetProduct, cand);
      if (score >= MIN_COMPATIBILITY_THRESHOLD) {
        scoredCandidates.push({ product: cand, score });
      }
    }

    // Sort by compatibility score descending
    scoredCandidates.sort((a, b) => b.score - a.score);

    for (const { product } of scoredCandidates) {
      if (recommendations.length >= maxItems) break;
      recommendations.push(formatRecommendationCard(product));
      seenIds.add(product.id);
      seenCodes.add(product.productCode.toUpperCase());
    }
  }

  // Priority 3: If no or fewer companions qualify, return only what was legitimately matched
  // (No arbitrary displayOrder or random fill)
  return recommendations;
}

/**
 * Fetch Complete the Look recommendations for a given product directly from the database.
 * Executes a single, optimized database query.
 */
export async function getCompleteTheLookRecommendations(
  targetProduct: RecommendationTarget,
  maxItems = 3
): Promise<FormattedRecommendation[]> {
  try {
    const publishedCandidates = await prisma.product.findMany({
      where: {
        status: "PUBLISHED",
        id: { not: targetProduct.id },
      },
      select: {
        id: true,
        productCode: true,
        name: true,
        shortDescription: true,
        description: true,
        material: true,
        finish: true,
        colour: true,
        length: true,
        width: true,
        height: true,
        dimensionUnit: true,
        categoryId: true,
        status: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: {
          where: { imageType: "MAIN" },
          take: 1,
          select: {
            imageUrl: true,
            imageType: true,
          },
        },
      },
    });

    return selectRecommendations(targetProduct, publishedCandidates as CandidateProductRecord[], maxItems);
  } catch (error) {
    console.error("Error generating Complete the Look recommendations:", error);
    return [];
  }
}
