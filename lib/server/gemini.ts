import 'server-only';

import type {
  RecapScope,
  ValidatedRecapRequest,
} from '@/lib/server/recap-request';

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string; thought?: boolean }>;
    };
    finishReason?: string;
  }>;
};

export class GeminiUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeminiUnavailableError';
  }
}

function getMaxOutputTokens(scope: RecapScope): number {
  return scope === 'year' ? 8_192 : 4_096;
}

export async function generateGeminiRecap({
  apiKey,
  model,
  request,
}: {
  apiKey: string;
  model: string;
  request: ValidatedRecapRequest;
}): Promise<string> {
  let response: Response;

  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: request.contents,
          generationConfig: {
            temperature: 0.7,
            topP: 0.95,
            maxOutputTokens: getMaxOutputTokens(request.scope),
          },
        }),
        cache: 'no-store',
        signal: AbortSignal.timeout(90_000),
      },
    );
  } catch {
    throw new GeminiUnavailableError('Gemini request failed.');
  }

  if (!response.ok) {
    throw new GeminiUnavailableError(`Gemini returned status ${response.status}.`);
  }

  const payload = (await response.json()) as GeminiResponse;
  const candidate = payload.candidates?.[0];
  const recap = candidate?.content?.parts
    ?.filter((part) => !part.thought)
    .map((part) => part.text)
    .filter((text): text is string => Boolean(text))
    .join('\n')
    .trim();

  const finishReason = candidate?.finishReason?.toUpperCase();
  if (finishReason === 'MAX_TOKENS' || finishReason === 'LENGTH') {
    throw new GeminiUnavailableError('Gemini response was truncated.');
  }

  if (!recap) {
    throw new GeminiUnavailableError('Gemini returned an empty response.');
  }

  return recap;
}
