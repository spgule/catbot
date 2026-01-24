import crypto from "crypto";

const SECRET = process.env.CRYPTO_SECRET || "";
if (!SECRET) {
  console.warn("⚠️ CRYPTO_SECRET is not set. Set it in your environment.");
  console.warn("⚠️ Using unsafe default key for development only!");
}

// Derive a 32-byte key from the secret
function getKey() {
  if (!SECRET) {
    // Fallback para desenvolvimento (NUNCA usar em produção)
    return crypto.createHash("sha256").update("unsafe_default_key_change_me").digest();
  }
  return crypto.createHash("sha256").update(String(SECRET)).digest();
}

export function encrypt(plainText) {
  if (!plainText) return "";
  
  const iv = crypto.randomBytes(12);
  const key = getKey();
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  const enc = Buffer.concat([cipher.update(String(plainText), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  // iv (12) + tag (16) + ciphertext
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

export function decrypt(cipherTextB64) {
  if (!cipherTextB64) return "";
  
  try {
    const raw = Buffer.from(String(cipherTextB64), "base64");
    if (raw.length < 28) throw new Error("Invalid cipher text");
    
    const iv = raw.subarray(0, 12);
    const tag = raw.subarray(12, 28);
    const enc = raw.subarray(28);

    const key = getKey();
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);

    const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
    return dec.toString("utf8");
  } catch (error) {
    console.error("Decryption error:", error.message);
    throw new Error("Failed to decrypt data");
  }
}
