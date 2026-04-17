/**
 * Ordered list of 10 ASL signs for the lesson sequence.
 *
 * IDs must match the numeric keys in backend/config/signs_config.json.
 * Sign 10 ("are you hungry?") is intentionally included to demonstrate
 * the facial expression / non-manual marker channel, since it grammatically
 * requires raised eyebrows as a yes/no question marker in ASL.
 */

import type { SignMetadata } from "@/types";

export const SIGNS: SignMetadata[] = [
  {
    id: 1,
    name: "Hello",
    description: "A saluting gesture from the forehead, like a friendly wave.",
  },
  {
    id: 2,
    name: "Thank You",
    description: "Flat hand from chin, moving outward — expressing gratitude.",
  },
  {
    id: 3,
    name: "Yes",
    description: "A fist nodding up and down, like a head nodding yes.",
  },
  {
    id: 4,
    name: "No",
    description: "Index finger shaking side to side, like a head shaking no.",
  },
  {
    id: 5,
    name: "Please",
    description: "Open palm rubbing a circle on the chest.",
  },
  {
    id: 6,
    name: "Sorry",
    description: "A closed fist rubbing a circle on the chest.",
  },
  {
    id: 7,
    name: "Water",
    description: "W-handshape tapping the chin twice.",
  },
  {
    id: 8,
    name: "Help",
    description: "A fist on an open palm, both hands lifting upward together.",
  },
  {
    id: 9,
    name: "Name",
    description: "Two H-hands crossing and tapping — like scissors touching.",
  },
  {
    id: 10,
    name: "Are You Hungry?",
    description:
      "C-hand moving down the chest. IMPORTANT: raised eyebrows are grammatically required for this yes/no question in ASL.",
  },
];

export const TOTAL_SIGNS = SIGNS.length;
