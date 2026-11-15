import { MediaItem, MoodMatchResult } from "@/types";

interface MoodMatchParams {
  moodDescription: string;
  items: MediaItem[];
  userApiKey?: string;
  aiProvider?: "claude" | "gemini";
}

export async function matchItemByMood(params: MoodMatchParams): Promise<MoodMatchResult | null> {
  const { moodDescription, items, userApiKey, aiProvider = "claude" } = params;

  if (!items || items.length === 0) return null;

  // Filter down to items the user hasn't finished yet, or all items if all are finished
  const candidatePool = items.filter((i) => i.status !== "finished");
  const candidates = candidatePool.length > 0 ? candidatePool : items;

  // 1. If AI key is provided, try Claude or Gemini
  const apiKey = userApiKey || (aiProvider === "claude" ? process.env.ANTHROPIC_API_KEY : process.env.GEMINI_API_KEY);
  if (apiKey) {
    try {
      if (aiProvider === "claude" || (!process.env.GEMINI_API_KEY && userApiKey?.startsWith("sk-ant-"))) {
        return await matchWithClaude(moodDescription, candidates, apiKey);
      } else if (aiProvider === "gemini" || userApiKey?.startsWith("AIza")) {
        return await matchWithGemini(moodDescription, candidates, apiKey);
      }
    } catch (err) {
      console.warn("AI mood match failed, falling back to local heuristic matcher:", err);
    }
  }

  // 2. Intelligent Heuristic Matcher Fallback
  return matchWithLocalHeuristics(moodDescription, candidates);
}

async function matchWithClaude(moodDescription: string, candidates: MediaItem[], apiKey: string): Promise<MoodMatchResult> {
  const simplifiedList = candidates.map((item) => ({
    id: item.id,
    title: item.title,
    type: item.type,
    genres: item.genres,
    creator: item.creator,
    length: item.lengthInfo,
    moodTags: item.moodTags,
    themes: item.themes,
    synopsis: item.description
  }));

  const prompt = `A user has this personal watchlist/library:
${JSON.stringify(simplifiedList, null, 2)}

The user describes their current mood and what they want to experience:
"${moodDescription}"

Pick the SINGLE BEST matching item from their list, plus one alternative if applicable.
Explain warmly and compellingly why this exact title fits their emotional state, energy level, and time availability right now.

Respond strictly in valid JSON format:
{
  "recommendedId": "id-of-best-item",
  "matchScore": 95,
  "pitch": "A 2-3 sentence personalized, thoughtful pitch speaking directly to the user's mood",
  "whyRightNow": "Specific reason why this fits right this moment (e.g. pacing, tone, energy match)",
  "alternativeId": "id-of-alternative-item"
}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }]
    })
  });

  if (!res.ok) throw new Error("Claude mood match error");
  const data = await res.json();
  const textContent = data.content?.[0]?.text || "{}";
  const cleaned = textContent.replace(/```json/g, "").replace(/```/g, "").trim();
  const parsed = JSON.parse(cleaned);

  const recommendedItem = candidates.find((i) => i.id === parsed.recommendedId) || candidates[0];
  const alternativeItem = candidates.find((i) => i.id === parsed.alternativeId);

  return {
    recommendedItem,
    matchScore: parsed.matchScore || 94,
    pitch: parsed.pitch || `Based on your mood, "${recommendedItem.title}" is the perfect companion right now.`,
    whyRightNow: parsed.whyRightNow || "Matches your current emotional rhythm and energy.",
    alternativeItem
  };
}

async function matchWithGemini(moodDescription: string, candidates: MediaItem[], apiKey: string): Promise<MoodMatchResult> {
  const simplifiedList = candidates.map((item) => ({
    id: item.id,
    title: item.title,
    type: item.type,
    genres: item.genres,
    length: item.lengthInfo,
    moodTags: item.moodTags,
    synopsis: item.description
  }));

  const prompt = `From this list: ${JSON.stringify(simplifiedList)}
The user is feeling: "${moodDescription}"
Pick the best item. Return JSON:
{
  "recommendedId": "string",
  "matchScore": number,
  "pitch": "string",
  "whyRightNow": "string"
}`;

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    })
  });

  if (!res.ok) throw new Error("Gemini mood match error");
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  const parsed = JSON.parse(text);

  const recommendedItem = candidates.find((i) => i.id === parsed.recommendedId) || candidates[0];

  return {
    recommendedItem,
    matchScore: parsed.matchScore || 92,
    pitch: parsed.pitch || `"${recommendedItem.title}" is tailored for what you're craving right now.`,
    whyRightNow: parsed.whyRightNow || "Balances your current mood and gives you an immersive escape."
  };
}

// Local smart semantic matching engine
export function matchWithLocalHeuristics(moodText: string, candidates: MediaItem[]): MoodMatchResult {
  const query = moodText.toLowerCase();

  // Mood keyword dictionary
  const moodProfiles: Record<string, { keywords: string[]; genres: string[]; tags: string[]; tone: string }> = {
    tired_cozy: {
      keywords: ["tired", "exhausted", "relax", "chill", "unwind", "cozy", "comfort", "easy", "light", "gentle", "wholesome", "feel good", "happy", "smile"],
      genres: ["Animation", "Comedy", "Fantasy", "Drama"],
      tags: ["Whimsical", "Heartwarming", "Comfort food", "Gentle", "Cozy", "Optimistic"],
      tone: "gentle, restorative comfort that doesn't demand high cognitive bandwidth"
    },
    deep_mindbending: {
      keywords: ["mind-bending", "deep", "think", "complex", "existential", "puzzle", "philosophical", "mystery", "weird", "twist", "dark", "sci-fi", "dystopian"],
      genres: ["Sci-Fi", "Thriller", "Mystery", "Philosophy"],
      tags: ["Mind-bending", "Philosophical", "Eerie", "Thought-Provoking", "Cosmic Awe"],
      tone: "cerebral, reality-bending depth that will keep your gears turning"
    },
    inspiring_growth: {
      keywords: ["inspire", "motivate", "productive", "habits", "learn", "grow", "build", "focus", "work", "creative", "ambitious", "discipline"],
      genres: ["Non-Fiction", "Self-Help", "Psychology", "Literary Fiction"],
      tags: ["Practical", "Inspiring", "Creative Passion", "Clear-headed", "Empowering"],
      tone: "an energizing jolt of perspective and actionable wisdom"
    },
    epic_escapism: {
      keywords: ["epic", "adventure", "space", "grand", "immersive", "journey", "escape", "long", "world-building", "fantasy", "cinematic"],
      genres: ["Adventure", "Sci-Fi", "Fantasy", "Action"],
      tags: ["Epic", "Cosmic Awe", "Immersive", "Scientific Wonder", "Thrilling"],
      tone: "grand, transporting spectacle that completely absorbs your attention"
    },
    emotional_poignant: {
      keywords: ["sad", "cry", "emotional", "touching", "poignant", "melancholy", "love", "romance", "tear", "nostalgic", "tender", "bittersweet"],
      genres: ["Drama", "Romance", "Literary Fiction"],
      tags: ["Poignant", "Melancholy", "Tender", "Bittersweet", "Nostalgic"],
      tone: "rich emotional resonance that gives you space to feel deeply"
    }
  };

  // Score each candidate
  let bestScore = -1;
  let bestItem = candidates[0];
  let matchedCategory = "tired_cozy";

  for (const item of candidates) {
    let score = 50; // base score

    // Search query matches
    const allText = [
      item.title,
      item.creator,
      item.description,
      ...(item.genres || []),
      ...(item.moodTags || []),
      ...(item.themes || [])
    ].join(" ").toLowerCase();

    // Check against each profile
    for (const [profileName, profile] of Object.entries(moodProfiles)) {
      let profileMatch = 0;
      profile.keywords.forEach((kw) => {
        if (query.includes(kw)) {
          profileMatch += 20;
          if (allText.includes(kw)) score += 25;
        }
      });

      profile.genres.forEach((genre) => {
        if (item.genres?.some((g) => g.toLowerCase().includes(genre.toLowerCase()))) {
          score += profileMatch > 0 ? 15 : 0;
        }
      });

      profile.tags.forEach((tag) => {
        if (item.moodTags?.some((t) => t.toLowerCase().includes(tag.toLowerCase()))) {
          score += profileMatch > 0 ? 20 : 0;
        }
      });

      if (profileMatch > 0 && score > bestScore) {
        matchedCategory = profileName;
      }
    }

    // Direct word overlap
    const words = query.split(/\s+/).filter((w) => w.length > 3);
    words.forEach((w) => {
      if (allText.includes(w)) score += 12;
    });

    // Rating boost
    if (item.criticRating) {
      score += Math.round(item.criticRating);
    }

    if (score > bestScore) {
      bestScore = score;
      bestItem = item;
    }
  }

  const normalizedScore = Math.min(98, Math.max(78, bestScore));
  const toneDesc = moodProfiles[matchedCategory]?.tone || "what you are searching for right now";

  // Pick an alternative
  const alternative = candidates.find((i) => i.id !== bestItem.id);

  return {
    recommendedItem: bestItem,
    matchScore: normalizedScore,
    pitch: `Looking at your mood, "${bestItem.title}" by ${bestItem.creator} is your best match. It offers ${toneDesc}, with standout themes of ${bestItem.themes?.slice(0, 2).join(" & ") || bestItem.genres.join(", ")}.`,
    whyRightNow: `Its ${bestItem.moodTags?.slice(0, 2).join(" and ") || "engaging"} tone fits your current mindset without feeling like an obligation.`,
    alternativeItem: alternative
  };
}

