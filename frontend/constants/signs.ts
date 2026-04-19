/**
 * Ordered list of 10 ASL signs for the Tier 1 lesson sequence.
 * IDs must match the numeric keys in backend/config/tier1_config.json.
 * videoSlug maps to the filename in Vercel Blob under the tier-1/ prefix.
 */

import type { SignMetadata } from "@/types";

export const TIER1_SIGNS: SignMetadata[] = [
  {
    id: 1,
    name: "Now",
    description: "Both hands in Y-shape or bent hands, palms up — drop them down sharply in front of your body.",
    videoSlug: "now",
  },
  {
    id: 2,
    name: "Later",
    description: "L-handshape with dominant hand, thumb pointing up — rotate the wrist forward and down.",
    videoSlug: "later",
  },
  {
    id: 3,
    name: "Today",
    description: "Sign NOW twice in quick succession — both bent hands drop down in front of you.",
    videoSlug: "today",
  },
  {
    id: 4,
    name: "Go",
    description: "Both index fingers point forward, then arc outward and forward in the direction of movement.",
    videoSlug: "go",
  },
  {
    id: 5,
    name: "Play",
    description: "Both hands in Y-shape — shake them loosely side to side at chest level.",
    videoSlug: "play",
  },
  {
    id: 6,
    name: "Visit",
    description: "Both hands in V-shape, rotate in alternating forward circles in front of the chest.",
    videoSlug: "visit",
  },
  {
    id: 7,
    name: "Listen",
    description: "Curved hand cups behind the ear, leaning slightly in the direction you are listening.",
    videoSlug: "listen",
  },
  {
    id: 8,
    name: "Draw",
    description: "Dominant pinky traces a wavy line across the non-dominant flat palm, like sketching.",
    videoSlug: "draw",
  },
  {
    id: 9,
    name: "Swim",
    description: "Both flat hands start together, then push outward and apart in a breaststroke motion.",
    videoSlug: "swim",
  },
  {
    id: 10,
    name: "Finish",
    description: "Both open hands face you at chest height, then flip outward quickly — palms now facing away.",
    videoSlug: "finish",
  },
];

export const TOTAL_TIER1_SIGNS = TIER1_SIGNS.length;
