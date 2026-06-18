import dns from "node:dns/promises";
import { isIP } from "node:net";

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "localhost.localdomain",
  "metadata.google.internal",
]);

function isPrivateIpv4(a: number, b: number): boolean {
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  return false;
}

export function isPrivateIpAddress(ip: string): boolean {
  const normalized = ip.toLowerCase();

  if (normalized === "::1" || normalized === "0:0:0:0:0:0:0:1") {
    return true;
  }

  const version = isIP(ip);
  if (version === 4) {
    const [a, b] = ip.split(".").map(Number);
    return isPrivateIpv4(a, b);
  }

  if (version === 6) {
    if (normalized.startsWith("fc") || normalized.startsWith("fd") || normalized.startsWith("fe80")) {
      return true;
    }
  }

  return false;
}

export function normalizeHttpUrl(input: string): URL {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error("A website URL is required.");
  }

  if (/^(file:|data:|blob:)/i.test(trimmed)) {
    throw new Error("Only HTTP and HTTPS URLs are supported.");
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const url = new URL(withProtocol);

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Only HTTP and HTTPS URLs are supported.");
  }

  if (url.username || url.password) {
    throw new Error("URLs with credentials are not supported.");
  }

  return url;
}

export async function assertSafePublicUrl(input: string): Promise<URL> {
  const url = normalizeHttpUrl(input);
  const hostname = url.hostname.toLowerCase().replace(/\.$/, "");

  if (BLOCKED_HOSTNAMES.has(hostname) || hostname.endsWith(".localhost") || hostname.endsWith(".local")) {
    throw new Error("This URL is not allowed.");
  }

  const literalIpVersion = isIP(hostname);
  if (literalIpVersion) {
    if (isPrivateIpAddress(hostname)) {
      throw new Error("This URL points to a private network address.");
    }
    return url;
  }

  const records = await dns.lookup(hostname, { all: true, verbatim: true });
  if (records.length === 0) {
    throw new Error("Could not resolve the website address.");
  }

  for (const record of records) {
    if (isPrivateIpAddress(record.address)) {
      throw new Error("This URL resolves to a private network address.");
    }
  }

  return url;
}

export function suggestedPdfFilename(url: URL): string {
  const host = url.hostname.replace(/^www\./i, "");
  const slug = host.replace(/[^a-z0-9.-]+/gi, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return `${slug || "website"}.pdf`;
}
