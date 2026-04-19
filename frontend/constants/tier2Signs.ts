/**
 * Ordered list of 10 ASL phrases for the Tier 2 lesson sequence.
 * IDs must match the numeric keys in backend/config/tier2_config.json.
 */

import type { PhraseMetadata } from "@/types";

export const TIER2_PHRASES: PhraseMetadata[] = [
  {
    id: 1,
    phrase: "I want more water please",
    aslOrder: "I WANT MORE WATER PLEASE",
    description: "Sign all 5 signs in order. Keep expression neutral — this is a polite request, not a question.",
  },
  {
    id: 2,
    phrase: "What is your name?",
    aslOrder: "YOUR NAME WHAT",
    description: "Sign YOUR → NAME → WHAT. Hold furrowed eyebrows throughout the entire phrase — WH-question grammar.",
  },
  {
    id: 3,
    phrase: "You are my good friend",
    aslOrder: "YOU MY GOOD FRIEND",
    description: "Sign YOU → MY → GOOD → FRIEND. Warm, affirmative expression throughout.",
  },
  {
    id: 4,
    phrase: "I am hungry, I want food",
    aslOrder: "I HUNGRY I WANT EAT",
    description: "Sign I → HUNGRY → I → WANT → EAT. Let your expression show hunger during HUNGRY.",
  },
  {
    id: 5,
    phrase: "Where is my friend?",
    aslOrder: "MY FRIEND WHERE",
    description: "Sign MY → FRIEND → WHERE. Furrowed eyebrows must appear for WHERE — WH-question grammar.",
  },
  {
    id: 6,
    phrase: "I am sorry, thank you",
    aslOrder: "SORRY THANK-YOU",
    description: "Sign SORRY → THANK-YOU. Apologetic expression for SORRY, warm and grateful for THANK-YOU.",
  },
  {
    id: 7,
    phrase: "I want to eat, please",
    aslOrder: "I WANT EAT PLEASE",
    description: "Sign I → WANT → EAT → PLEASE. Polite, earnest expression throughout.",
  },
  {
    id: 8,
    phrase: "You are good, thank you",
    aslOrder: "YOU GOOD THANK-YOU",
    description: "Sign YOU → GOOD → THANK-YOU. Note: GOOD ends at your palm, THANK-YOU projects outward.",
  },
  {
    id: 9,
    phrase: "I am bad, I am sorry",
    aslOrder: "I BAD SORRY",
    description: "Sign I → BAD → SORRY. Let your face show genuine remorse — slight forward lean conveys humility.",
  },
  {
    id: 10,
    phrase: "Please help me, thank you",
    aslOrder: "PLEASE HELP ME THANK-YOU",
    description: "Sign PLEASE → HELP → ME → THANK-YOU. Both hands must lift upward for HELP.",
  },
];

export const TOTAL_TIER2_PHRASES = TIER2_PHRASES.length;
