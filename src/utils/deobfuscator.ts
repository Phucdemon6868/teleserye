/**
 * Utilities for unpacking Dean Edwards P.A.C.K.E.R JavaScript
 * and formatting helper functions for video downloading pipelines.
 */

export function deobfuscatePackedJs(p: string, a: number, c: number, k: string[]): string {
  const alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

  if (a < 2 || a > alphabet.length) {
    throw new Error(`Unsupported base: ${a}`);
  }

  function encode(num: number): string {
    if (num === 0) return '0';
    let result = '';
    let current = num;
    while (current > 0) {
      const rem = current % a;
      current = Math.floor(current / a);
      result = alphabet[rem] + result;
    }
    return result;
  }

  let unpacked = p;
  // Decode in reverse order of P.A.C.K.E.R
  for (let i = c - 1; i >= 0; i--) {
    const word = k[i];
    if (word) {
      const token = encode(i);
      const regex = new RegExp(`\\b${escapeRegExp(token)}\\b`, 'g');
      unpacked = unpacked.replace(regex, word);
    }
  }

  return unpacked;
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function extractPackedScript(scriptContent: string): {
  p: string;
  a: number;
  c: number;
  k: string[];
  decoded?: string;
  extractedSources?: Array<{ file: string; label?: string; type?: string }>;
} | null {
  // Regex pattern matching: return p}( '...', 36, 120, '...'.split('|')
  const pattern = /return\s+p\s*}\s*\(\s*'((?:\\.|[^'\\])*)'\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*'((?:\\.|[^'\\])*)'\s*\.split\(\s*'\|'\s*\)/s;
  const match = scriptContent.match(pattern);

  if (!match) {
    return null;
  }

  const p = match[1];
  const a = parseInt(match[2], 10);
  const c = parseInt(match[3], 10);
  const k = match[4].split('|');

  try {
    const decoded = deobfuscatePackedJs(p, a, c, k);
    
    // Look for var directSources = [...] or var proxySources = [...]
    let extractedSources: Array<{ file: string; label?: string; type?: string }> = [];
    const sourceMatch = decoded.match(/var\s+(?:directSources|proxySources)\s*=\s*(\[[^\]]+\]);/);
    if (sourceMatch && sourceMatch[1]) {
      try {
        extractedSources = JSON.parse(sourceMatch[1]);
      } catch {
        // Fallback simple regex parsing
        const fileMatches = [...sourceMatch[1].matchAll(/"file"\s*:\s*"([^"]+)"/g)];
        extractedSources = fileMatches.map(m => ({ file: m[1] }));
      }
    }

    return { p, a, c, k, decoded, extractedSources };
  } catch (err) {
    console.error('Failed to unpack JS:', err);
    return { p, a, c, k };
  }
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatSecondsToETA(seconds: number): string {
  if (isNaN(seconds) || seconds <= 0 || !isFinite(seconds)) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  if (mins > 60) {
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins.toString().padStart(2, '0')}m`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function sanitizeFileName(name: string): string {
  return name.replace(/[\\/*?:"<>|]/g, '').trim();
}
