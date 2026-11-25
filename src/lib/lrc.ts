export interface LrcLine {
  timeSec: number;
  text: string;
  endTimeSec?: number;
}

const TIMESTAMP_PATTERN = /\[(\d{1,3}):(\d{2})(?:\.(\d{1,3}))?\]/g;
const OFFSET_PATTERN = /^\[offset:([+-]?\d+)\]$/i;

export function parseLrc(raw: string, configOffsetMs = 0): LrcLine[] {
  const rows = raw.split(/\r?\n/);
  let tagOffsetMs = 0;

  for (const row of rows) {
    const match = row.trim().match(OFFSET_PATTERN);
    if (match) {
      tagOffsetMs = Number.parseInt(match[1], 10) || 0;
    }
  }

  const totalOffsetSec = (tagOffsetMs + configOffsetMs) / 1000;
  const parsed: LrcLine[] = [];
  const endMarkers: number[] = [];

  for (const row of rows) {
    const trimmed = row.trim();
    if (!trimmed) continue;

    TIMESTAMP_PATTERN.lastIndex = 0;
    const timestamps: number[] = [];
    let match: RegExpExecArray | null;

    while ((match = TIMESTAMP_PATTERN.exec(trimmed)) !== null) {
      const minutes = Number.parseInt(match[1], 10);
      const seconds = Number.parseInt(match[2], 10);
      const fracRaw = match[3] ?? '0';
      const millis = Number.parseInt(fracRaw.padEnd(3, '0').slice(0, 3), 10);
      const timeSec = Math.max(0, minutes * 60 + seconds + millis / 1000 + totalOffsetSec);
      timestamps.push(timeSec);
    }

    if (timestamps.length === 0) continue;

    const text = trimmed.replace(TIMESTAMP_PATTERN, '').trim();
    if (!text) {
      endMarkers.push(...timestamps);
      continue;
    }

    for (const timeSec of timestamps) {
      parsed.push({ timeSec, text });
    }
  }

  parsed.sort((a, b) => a.timeSec - b.timeSec);
  endMarkers.sort((a, b) => a - b);

  for (let i = 0; i < parsed.length; i += 1) {
    const lineStart = parsed[i].timeSec;
    const nextLineStart = i + 1 < parsed.length ? parsed[i + 1].timeSec : Infinity;
    const marker = endMarkers.find((t) => t > lineStart && t <= nextLineStart);
    if (marker !== undefined) {
      parsed[i].endTimeSec = marker;
    }
  }

  return parsed;
}

export function findActiveLyricIndex(lines: LrcLine[], currentTimeSec: number): number {
  if (lines.length === 0 || currentTimeSec < lines[0].timeSec) {
    return -1;
  }

  let low = 0;
  let high = lines.length - 1;
  let answer = 0;

  while (low <= high) {
    const mid = (low + high) >> 1;
    if (lines[mid].timeSec <= currentTimeSec) {
      answer = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return answer;
}
