/**
 * Ordered list of 10 ASL phrases for the Tier 2 lesson sequence.
 * IDs must match the numeric keys in backend/config/tier2_config.json.
 * videoSlug maps to the filename in Vercel Blob under the tier-2/ prefix.
 */

import type { PhraseMetadata } from "@/types";

export const TIER2_PHRASES: PhraseMetadata[] = [
  {
    id: 1,
    phrase: "Now I go",
    aslOrder: "NOW I GO",
    description: "Sign NOW → I → GO. Keep timing markers crisp — NOW grounds the phrase in the present.",
    videoSlug: "now-i-go",
  },
  {
    id: 2,
    phrase: "Free time, I want",
    aslOrder: "FREE-TIME I WANT",
    description: "Sign FREE-TIME → I → WANT. Pull WANT toward yourself to show desire.",
    videoSlug: "free-time-i-want",
  },
  {
    id: 3,
    phrase: "Now we play",
    aslOrder: "NOW WE PLAY",
    description: "Sign NOW → WE → PLAY. Keep PLAY loose and expressive — Y-hands shaking.",
    videoSlug: "now-we-play",
  },
  {
    id: 4,
    phrase: "Later I will visit friend",
    aslOrder: "LATER I VISIT FRIEND WILL",
    description: "Sign LATER → I → VISIT → FRIEND → WILL. LATER sets future tense — body leans slightly forward.",
    videoSlug: "later-i-visit-friend-will",
  },
  {
    id: 5,
    phrase: "Nice to meet you again",
    aslOrder: "NICE MEET YOU AGAIN",
    description: "Sign NICE → MEET → YOU → AGAIN. Warm expression throughout — this is a friendly greeting.",
    videoSlug: "nice-meet-you-again",
  },
  {
    id: 6,
    phrase: "Now I listen",
    aslOrder: "NOW I LISTEN",
    description: "Sign NOW → I → LISTEN. Cup hand clearly behind ear for LISTEN.",
    videoSlug: "now-i-listen",
  },
  {
    id: 7,
    phrase: "Today they finished swimming",
    aslOrder: "TODAY THEY SWIM FINISH",
    description: "Sign TODAY → THEY → SWIM → FINISH. FINISH marks completion — flip both hands outward firmly.",
    videoSlug: "today-they-swim-finish",
  },
  {
    id: 8,
    phrase: "Later they will go to movies",
    aslOrder: "LATER THEY GO MOVIES WILL",
    description: "Sign LATER → THEY → GO → MOVIES → WILL. WILL reinforces future tense alongside LATER.",
    videoSlug: "later-they-go-to-movies-will",
  },
  {
    id: 9,
    phrase: "Now I draw",
    aslOrder: "NOW I DRAW",
    description: "Sign NOW → I → DRAW. Trace the wavy DRAW motion clearly across your non-dominant palm.",
    videoSlug: "now-i-draw",
  },
  {
    id: 10,
    phrase: "Now I go to the café",
    aslOrder: "NOW I GO CAFE",
    description: "Sign NOW → I → GO → CAFE. Direction of GO should point toward an imagined café location.",
    videoSlug: "now-i-go-to-cafe",
  },
];

export const TOTAL_TIER2_PHRASES = TIER2_PHRASES.length;
