import 'server-only';

export type RecapScope = 'month' | 'year';

export type RecapPart =
  | { text: string }
  | {
      inlineData: {
        mimeType: 'image/jpeg';
        data: string;
      };
    };

export type ValidatedRecapRequest = {
  version: 1;
  scope: RecapScope;
  contents: [{ role: 'user'; parts: RecapPart[] }];
};

const MAX_REQUEST_BYTES = 20 * 1024 * 1024;
const MAX_PARTS = 700;
const MAX_TEXT_PART_CHARS = 20_000;
const MAX_TOTAL_TEXT_CHARS = 600_000;
const MAX_IMAGE_BASE64_CHARS = 2_000_000;
const MAX_YEAR_IMAGES = 24;
const MAX_MONTH_IMAGES = 16;

export class InvalidRecapRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidRecapRequestError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isValidBase64(value: string): boolean {
  return (
    value.length > 0 &&
    value.length % 4 === 0 &&
    /^[A-Za-z0-9+/]+={0,2}$/.test(value)
  );
}

async function readRequestBody(request: Request): Promise<string> {
  const contentLength = Number(request.headers.get('content-length'));

  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
    throw new InvalidRecapRequestError('Request body is too large.');
  }

  if (!request.body) {
    throw new InvalidRecapRequestError('Request body is required.');
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    totalBytes += value.byteLength;
    if (totalBytes > MAX_REQUEST_BYTES) {
      await reader.cancel();
      throw new InvalidRecapRequestError('Request body is too large.');
    }

    chunks.push(value);
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;

  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return new TextDecoder('utf-8', { fatal: true }).decode(body);
}

export async function parseRecapRequest(
  request: Request,
): Promise<ValidatedRecapRequest> {
  let value: unknown;

  try {
    value = JSON.parse(await readRequestBody(request));
  } catch (error) {
    if (error instanceof InvalidRecapRequestError) {
      throw error;
    }

    throw new InvalidRecapRequestError('Request body must be valid JSON.');
  }

  if (!isRecord(value) || value.version !== 1) {
    throw new InvalidRecapRequestError('Unsupported request version.');
  }

  const scope = value.scope;
  if (scope !== 'month' && scope !== 'year') {
    throw new InvalidRecapRequestError('Invalid recap scope.');
  }

  if (!Array.isArray(value.contents) || value.contents.length !== 1) {
    throw new InvalidRecapRequestError('Exactly one content entry is required.');
  }

  const content = value.contents[0];
  if (!isRecord(content) || content.role !== 'user') {
    throw new InvalidRecapRequestError('Invalid content role.');
  }

  if (
    !Array.isArray(content.parts) ||
    content.parts.length === 0 ||
    content.parts.length > MAX_PARTS
  ) {
    throw new InvalidRecapRequestError('Invalid number of recap parts.');
  }

  const parts: RecapPart[] = [];
  let totalTextChars = 0;
  let imageCount = 0;

  for (const part of content.parts) {
    if (!isRecord(part)) {
      throw new InvalidRecapRequestError('Invalid recap part.');
    }

    if (typeof part.text === 'string' && !('inlineData' in part)) {
      if (part.text.length === 0 || part.text.length > MAX_TEXT_PART_CHARS) {
        throw new InvalidRecapRequestError('Invalid recap text length.');
      }

      totalTextChars += part.text.length;
      if (totalTextChars > MAX_TOTAL_TEXT_CHARS) {
        throw new InvalidRecapRequestError('Recap text is too large.');
      }

      parts.push({ text: part.text });
      continue;
    }

    if (!isRecord(part.inlineData) || 'text' in part) {
      throw new InvalidRecapRequestError('Invalid image part.');
    }

    const { mimeType, data } = part.inlineData;
    if (
      mimeType !== 'image/jpeg' ||
      typeof data !== 'string' ||
      data.length > MAX_IMAGE_BASE64_CHARS ||
      !isValidBase64(data)
    ) {
      throw new InvalidRecapRequestError('Invalid recap image.');
    }

    imageCount += 1;
    const maxImages = scope === 'year' ? MAX_YEAR_IMAGES : MAX_MONTH_IMAGES;
    if (imageCount > maxImages) {
      throw new InvalidRecapRequestError('Too many recap images.');
    }

    parts.push({ inlineData: { mimeType, data } });
  }

  return {
    version: 1,
    scope,
    contents: [{ role: 'user', parts }],
  };
}
