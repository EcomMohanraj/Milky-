const encoder = new TextEncoder();

function base64urlEncode(str: string | Uint8Array): string {
  const buf = typeof str === 'string' ? encoder.encode(str) : str;
  let binString = "";
  for (let i = 0; i < buf.length; i++) {
    binString += String.fromCharCode(buf[i]);
  }
  return btoa(binString)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64urlDecode(str: string): Uint8Array {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const binString = atob(base64);
  const size = binString.length;
  const bytes = new Uint8Array(size);
  for (let i = 0; i < size; i++) {
    bytes[i] = binString.charCodeAt(i);
  }
  return bytes;
}

// Convert secret string to CryptoKey for HMAC-SHA256
async function getCryptoKey(secret: string): Promise<CryptoKey> {
  const keyBuf = encoder.encode(secret);
  return crypto.subtle.importKey(
    "raw",
    keyBuf,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function signJwt(payload: Record<string, unknown>, secret: string): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64urlEncode(JSON.stringify(header));
  const encodedPayload = base64urlEncode(JSON.stringify({
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 // 24 hours
  }));
  
  const data = `${encodedHeader}.${encodedPayload}`;
  const key = await getCryptoKey(secret);
  const signatureBuf = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(data)
  );
  const encodedSignature = base64urlEncode(new Uint8Array(signatureBuf));
  return `${data}.${encodedSignature}`;
}

export async function verifyJwt(token: string, secret: string): Promise<Record<string, unknown> | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    
    const [header, payload, signature] = parts;
    const data = `${header}.${payload}`;
    const key = await getCryptoKey(secret);
    
    const signatureBuf = base64urlDecode(signature);
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBuf.buffer as ArrayBuffer,
      encoder.encode(data)
    );
    
    if (!isValid) return null;
    
    const decodedPayload = JSON.parse(new TextDecoder().decode(base64urlDecode(payload)));
    
    // Check expiration
    if (decodedPayload.exp && decodedPayload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return decodedPayload as Record<string, unknown>;
  } catch {
    return null;
  }
}
