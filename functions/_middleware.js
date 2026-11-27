const COOKIE_NAME = "__Host-bday_access";
const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;
const SECRET_PATTERN = /^[a-f0-9]{64}$/;
const encoder = new TextEncoder();

function withPrivacyHeaders(response) {
    const headers = new Headers(response.headers);
    headers.set("Cache-Control", "private, no-store");
    headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    headers.set("Referrer-Policy", "no-referrer");
    headers.set("X-Content-Type-Options", "nosniff");

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
    });
}

function notFound() {
    return withPrivacyHeaders(new Response("Not Found", {
        status: 404,
        headers: { "Content-Type": "text/plain; charset=utf-8" }
    }));
}

function getCookieValue(request) {
    const cookieHeader = request.headers.get("Cookie");
    if (!cookieHeader) return null;

    const matches = cookieHeader
        .split(";")
        .map((part) => part.trim())
        .filter((part) => part.startsWith(`${COOKIE_NAME}=`));

    if (matches.length !== 1) return null;
    return matches[0].slice(COOKIE_NAME.length + 1);
}

function hexToBytes(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let index = 0; index < bytes.length; index += 1) {
        bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16);
    }
    return bytes;
}

async function tokenMatches(candidate, secret) {
    const [candidateHash, secretHash] = await Promise.all([
        crypto.subtle.digest("SHA-256", encoder.encode(candidate)),
        crypto.subtle.digest("SHA-256", encoder.encode(secret))
    ]);
    const candidateBytes = new Uint8Array(candidateHash);
    const secretBytes = new Uint8Array(secretHash);
    let difference = 0;

    for (let index = 0; index < candidateBytes.length; index += 1) {
        difference |= candidateBytes[index] ^ secretBytes[index];
    }

    return difference === 0;
}

async function importSigningKey(secret) {
    return crypto.subtle.importKey(
        "raw",
        hexToBytes(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign", "verify"]
    );
}

function sessionPayload(expiresAt, hostname) {
    return `v1\n${expiresAt}\n${hostname}`;
}

async function createSessionCookie(env, hostname) {
    const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
    const key = await importSigningKey(env.SESSION_SIGNING_KEY);
    const signature = await crypto.subtle.sign(
        "HMAC",
        key,
        encoder.encode(sessionPayload(expiresAt, hostname))
    );
    const signatureHex = Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join("");
    const value = `v1.${expiresAt}.${signatureHex}`;
    const expires = new Date(expiresAt * 1000).toUTCString();

    return `${COOKIE_NAME}=${value}; Max-Age=${SESSION_TTL_SECONDS}; Expires=${expires}; Path=/; Secure; HttpOnly; SameSite=Lax`;
}

async function hasValidSession(request, env, hostname) {
    const value = getCookieValue(request);
    if (!value) return false;

    const match = /^v1\.([0-9]{1,12})\.([a-f0-9]{64})$/.exec(value);
    if (!match) return false;

    const expiresAt = Number(match[1]);
    const now = Math.floor(Date.now() / 1000);
    if (!Number.isSafeInteger(expiresAt) || String(expiresAt) !== match[1]) return false;
    if (expiresAt <= now || expiresAt > now + SESSION_TTL_SECONDS) return false;

    const key = await importSigningKey(env.SESSION_SIGNING_KEY);
    return crypto.subtle.verify(
        "HMAC",
        key,
        hexToBytes(match[2]),
        encoder.encode(sessionPayload(expiresAt, hostname))
    );
}

export async function onRequest(context) {
    try {
        const { request, env } = context;
        const url = new URL(request.url);
        const hostname = url.hostname.toLowerCase();
        const configuredHostname = env.PRODUCTION_HOSTNAME;

        if (!configuredHostname || !/^[a-z0-9]{32,62}\.pages\.dev$/.test(configuredHostname)) {
            return notFound();
        }
        if (hostname !== configuredHostname) return notFound();
        if (!SECRET_PATTERN.test(env.PRIVATE_ACCESS_TOKEN || "")) return notFound();
        if (!SECRET_PATTERN.test(env.SESSION_SIGNING_KEY || "")) return notFound();

        if (url.pathname.startsWith("/access/")) {
            const match = /^\/access\/([a-f0-9]{64})$/.exec(url.pathname);
            if (!match || (request.method !== "GET" && request.method !== "HEAD")) return notFound();
            if (!await tokenMatches(match[1], env.PRIVATE_ACCESS_TOKEN)) return notFound();

            const headers = new Headers({
                Location: "/",
                "Set-Cookie": await createSessionCookie(env, hostname)
            });
            return withPrivacyHeaders(new Response(null, { status: 303, headers }));
        }

        if (!await hasValidSession(request, env, hostname)) return notFound();
        return withPrivacyHeaders(await context.next());
    } catch {
        return notFound();
    }
}
