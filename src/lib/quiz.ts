// ASCND bundle recommender.
// Pure, deterministic logic — no fabricated data. Product prices/handles are
// resolved from Shopify (Storefront API) at render/checkout time, not here.

export type ProductId = "mask" | "mouth" | "nose" | "insoles";

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
        weights: { mouth: 2, insoles: 3 },
      },
      {
        label: "Total optimization",
        detail: "All systems, no compromise.",
        weights: { mask: 1, mouth: 1, nose: 1, insoles: 1 },
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
        detail: "Height and posture, not sleep.",
        weights: { insoles: 3 },
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

export interface BundleResult {
  name: string;
  description: string;
  products: Product[];
}

const ALL_IDS: ProductId[] = ["mask", "mouth", "nose", "insoles"];

function nameBundle(ids: ProductId[]): { name: string; description: string } {
  const set = new Set(ids);
  if (ids.length === ALL_IDS.length) {
    return {
      name: "The Full Ascension",
      description:
        "The complete protocol. Every system working together — sleep, airflow, and presence.",
    };
  }
  if (set.has("mask") && set.has("mouth")) {
    return {
      name: "The Sleep Protocol",
      description: "Engineered for deeper, quieter, fully recovered nights.",
    };
  }
  if (set.has("mouth") && set.has("nose")) {
    return {
      name: "The Airflow Protocol",
      description: "Maximum oxygen, nasal breathing locked in all night.",
    };
  }
  if (set.has("insoles")) {
    return {
      name: "The Presence Protocol",
      description: "Built for how you carry yourself — posture, height, and recovery.",
    };
  }
  return {
    name: "Your Protocol",
    description: "A bundle matched to how you answered.",
  };
}

/**
 * Recommend a bundle from the selected option index per question.
 * answers[i] is the chosen option index for QUESTIONS[i].
 */
export function recommendBundle(answers: number[]): BundleResult {
  const scores: Record<ProductId, number> = { mask: 0, mouth: 0, nose: 0, insoles: 0 };
  let fullStack = false;

  answers.forEach((optionIndex, qi) => {
    const option = QUESTIONS[qi]?.options[optionIndex];
    if (!option) return;
    if (option.fullStack) fullStack = true;
    for (const [id, weight] of Object.entries(option.weights) as [ProductId, number][]) {
      scores[id] += weight;
    }
  });

  let ids: ProductId[];
  if (fullStack) {
    ids = ALL_IDS;
  } else {
    // Top scorers, minimum two, drop anything that scored nothing.
    const ranked = ALL_IDS.filter((id) => scores[id] > 0).sort(
      (a, b) => scores[b] - scores[a]
    );
    ids = ranked.slice(0, Math.max(2, Math.min(3, ranked.length)));
    if (ids.length < 2) {
      // Defensive fallback so a bundle always has at least two items.
      ids = [...new Set([...ids, ...ALL_IDS])].slice(0, 2);
    }
  }

  const { name, description } = nameBundle(ids);
  return { name, description, products: ids.map((id) => PRODUCTS[id]) };
}
