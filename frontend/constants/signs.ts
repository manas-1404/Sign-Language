/**
 * Ordered list of 11 ASL signs for the Tier 1 lesson sequence.
 * IDs must match the numeric keys in backend/config/tier1_config.json.
 */

import type { SignMetadata } from "@/types";

export const TIER1_SIGNS: SignMetadata[] = [
  {
    id: 1,
    name: "I / Me",
    description: "Point your index finger at your own chest, or place your flat hand on it.",
  },
  {
    id: 2,
    name: "You",
    description: "Extend your index finger and point it directly toward the person you are addressing.",
  },
  {
    id: 3,
    name: "Want",
    description: "Both hands open with curved fingers, palms up — pull them inward toward your body.",
  },
  {
    id: 4,
    name: "Eat",
    description: "Bunch all fingertips to your thumb and tap toward your mouth 2 to 3 times.",
  },
  {
    id: 5,
    name: "Good",
    description: "Flat hand starts at chin, moves forward and down into your non-dominant open palm.",
  },
  {
    id: 6,
    name: "Bad",
    description: "Flat hand starts palm-in at chin, then flips outward and downward to palm-down.",
  },
  {
    id: 7,
    name: "Where",
    description: "Index finger waggles side to side. Eyebrows must be furrowed — this is a WH-question.",
  },
  {
    id: 8,
    name: "What",
    description: "Dominant index finger brushes down across your non-dominant open palm. Eyebrows furrowed.",
  },
  {
    id: 9,
    name: "More",
    description: "Both hands in flat-O shape — tap fingertips together at chest level 2 to 3 times.",
  },
  {
    id: 10,
    name: "Friend",
    description: "Hook both index fingers together, then swap which one is on top.",
  },
  {
    id: 11,
    name: "Hungry",
    description: "C-shaped hand at upper chest, slides smoothly downward toward your stomach.",
  },
];

export const TOTAL_TIER1_SIGNS = TIER1_SIGNS.length;
