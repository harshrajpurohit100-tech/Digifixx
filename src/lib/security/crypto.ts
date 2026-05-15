import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "node:crypto";

const ENCRYPTION_VERSION = "v1";
const ALGORITHM = "aes-256-gcm";

function getEncryptionKey() {
  const secret = process.env.ENCRYPTION_SECRET;

  if (!secret) {
    throw new Error("Missing ENCRYPTION_SECRET for server-side encryption.");
  }

  if (!/^[a-fA-F0-9]{64}$/.test(secret)) {
    throw new Error("ENCRYPTION_SECRET must be a 64 character hex string.");
  }

  return Buffer.from(secret, "hex");
}

export function encryptSecret(plainText: string): string {
  if (!plainText) {
    throw new Error("Cannot encrypt an empty secret value.");
  }

  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return [
    ENCRYPTION_VERSION,
    iv.toString("base64url"),
    authTag.toString("base64url"),
    ciphertext.toString("base64url"),
  ].join(":");
}

export function decryptSecret(encryptedValue: string): string {
  const [version, ivValue, authTagValue, ciphertextValue] =
    encryptedValue.split(":");

  if (
    version !== ENCRYPTION_VERSION ||
    !ivValue ||
    !authTagValue ||
    !ciphertextValue
  ) {
    throw new Error("Unsupported encrypted secret format.");
  }

  const decipher = createDecipheriv(
    ALGORITHM,
    getEncryptionKey(),
    Buffer.from(ivValue, "base64url")
  );

  decipher.setAuthTag(Buffer.from(authTagValue, "base64url"));

  return Buffer.concat([
    decipher.update(Buffer.from(ciphertextValue, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

export function getSecretLast4(value: string): string {
  return value.length >= 4 ? value.slice(-4) : "";
}
