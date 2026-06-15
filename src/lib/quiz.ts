// ASCND bundle recommender.
// Pure, deterministic logic — no fabricated data. Product prices/handles are
// resolved from Shopify (Storefront API) at render/checkout time, not here.

export type ProductId = "mask" | "mouth" | "nose" | "insoles" | "framer";

export interface Product {
  id: ProductId;
  name: string;
  /** Shopify product handle — wire to Storefront API later. */
  handle: string;
  /** Authored benefit copy. */
  benefit: string;
}

export const PRODUCTS: Record<ProductId, Product> = {
  mask: {
    id: "mask",
    name: "Silk Sleep Mask",
    handle: "silk-sleep-mask",
    benefit: "Total blackout for deeper, uninterrupted REM cycles.",
  },
  mouth: {
    id: "mouth",
    name: "Mouth Tape",
    handle: "mouth-tape",
    benefit: "Nasal breathing through the night — less snoring, a more defined jawline.",
  },
  nose: {
    id: "nose",
    name: "Nose Tape",
    handle: "nose-tape",
    benefit: "Opens the nasal airway for higher oxygen intake while you sleep.",
  },
  insoles: {
    id: "insoles",
    name: "Height Insoles",
    handle: "height-insoles",
    benefit: "A discreet lift for posture, presence, and daytime confidence.",
  },
  framer: {
    id: "framer",
    name: "Face Framer",
    handle: "ascnd-face-framer",
    benefit: "Targeted facial structure training for a sharper, more defined jawline.",
  },
};

type Weights = Partial<Record<ProductId, number>>;

export interface QuizOption {
  label: string;
  /** Short supporting line shown under the label. */
  detail: string;
  weights: Weights;
  /** Q3 only: pull the entire catalogue into the bundle. */
  fullStack?: boolean;
}

export interface QuizQuestion {
  id: string;
  /** The actual question — a real label, not a placeholder. */
  prompt: string;
  options: QuizOption[];
}

export const QUESTIONS: QuizQuestion[] = [
  {
    id: "focus",
    prompt: "What are you optimizing for first?",
    options: [
      {
        label: "Deeper sleep",
        detail: "Wake up actually recovered.",
        weights: { mask: 3, mouth: 1 },
      },
      {
        label: "Breathing & snoring",
        detail: "Quieter nights, better airflow.",
        weights: { mouth: 3, nose: 2 },
      },
      {
        label: "Looksmaxxing",
        detail: "Jawline, posture, presence.",
        weights: { mouth: 1, framer: 3, insoles: 2 },
      },
      {
        label: "Total optimization",
        detail: "All systems, no compromise.",
        weights: { mask: 1, mouth: 1, nose: 1, insoles: 1, framer: 1 },
      },
    ],
  },
  {
    id: "blocker",
    prompt: "What's holding you back right now?",
    options: [
      {
        label: "I can't switch off",
        detail: "Light and restlessness keep me up.",
        weights: { mask: 3 },
      },
      {
        label: "Mouth breathing or snoring",
        detail: "Dry mouth, broken sleep, noise.",
        weights: { mouth: 3 },
      },
      {
        label: "A blocked nose",
        detail: "Congestion makes breathing hard.",
        weights: { nose: 3 },
      },
      {
        label: "Confidence in the day",
        detail: "Height, posture, and jawline.",
        weights: { insoles: 3, framer: 2 },
      },
    ],
  },
  {
    id: "depth",
    prompt: "How far do you want to take it?",
    options: [
      {
        label: "Start with the essentials",
        detail: "The two things that move the needle most.",
        weights: {},
      },
      {
        label: "Run the full stack",
        detail: "Every system in the protocol.",
        weights: {},
        fullStack: true,
      },
    ],
  },
];

// Real Shopify bundle products (created via the Shopify Bundles app).
// Each is a single SKU; `productIds` lists what's inside for display only.
export type BundleId = "structure" | "presence" | "full";

export interface Bundle {
  id: BundleId;
  name: string;
  /** Shopify bundle product handle — added to cart as one SKU. */
  handle: string;
  description: string;
  productIds: ProductId[];
}

export const BUNDLES: Record<BundleId, Bundle> = {
  structure: {
    id: "structure",
    name: "The Structure Protocol",
    handle: "the-structure-protocol",
    description:
      "Jawline, breathing, definition — three tools working the overnight window when your face remodels.",
    productIds: ["framer", "mouth", "nose"],
  },
  presence: {
    id: "presence",
    name: "The Presence Protocol",
    handle: "the-presence-protocol",
    description:
      "Deeper sleep, calmer breathing, taller presence. Recovery by night, stature by day.",
    productIds: ["mask", "mouth", "insoles"],
  },
  full: {
    id: "full",
    name: "The Full Stack",
    handle: "the-full-stack",
    description:
      "Every system — structure, sleep, breathing, presence. The complete protocol, fully equipped.",
    productIds: ["mask", "mouth", "nose", "insoles", "framer"],
  },
};

export interface BundleResult {
  name: string;
  /** Bundle SKU handle — what gets added to cart. */
  handle: string;
  description: string;
  /** Components inside the bundle, for display. */
  products: Product[];
}

/**
 * Recommend one of the three real bundle SKUs from the selected option index
 * per question. answers[i] is the chosen option index for QUESTIONS[i].
 */
export function recommendBundle(answers: number[]): BundleResult {
  const scores: Record<ProductId, number> = { mask: 0, mouth: 0, nose: 0, insoles: 0, framer: 0 };
  let fullStack = false;

  answers.forEach((optionIndex, qi) => {
    const option = QUESTIONS[qi]?.options[optionIndex];
    if (!option) return;
    if (option.fullStack) fullStack = true;
    for (const [id, weight] of Object.entries(option.weights) as [ProductId, number][]) {
      scores[id] += weight;
    }
  });

  let id: BundleId;
  if (fullStack) {
    id = "full";
  } else {
    const structureScore = scores.framer + scores.nose;
    const presenceScore = scores.mask + scores.insoles;
    id = structureScore >= presenceScore ? "structure" : "presence";
  }

  const bundle = BUNDLES[id];
  return {
    name: bundle.name,
    handle: bundle.handle,
    description: bundle.description,
    products: bundle.productIds.map((pid) => PRODUCTS[pid]),
  };
}
