export const normalizeIndianPhone = (value) => {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  let digits = raw.replace(/\D/g, "");
  if (raw.startsWith("+91") && digits.startsWith("91")) {
    digits = digits.slice(2);
  } else if (digits.startsWith("0091")) {
    digits = digits.slice(4);
  } else if (digits.startsWith("091")) {
    digits = digits.slice(3);
  } else if (digits.length === 12 && digits.startsWith("91")) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1);
  }
  return `+91${digits}`;
};

export const isValidIndianPhone = (value) => {
  const raw = String(value ?? "").trim();
  if (!raw) return false;
  const digits = raw.replace(/\D/g, "");
  // Accept any phone with 10-15 digits (Indian, Pakistani, international)
  return digits.length >= 10 && digits.length <= 15;
};

export const extractIndianPhoneDigits = (value) => {
  const normalized = normalizeIndianPhone(value);
  return normalized.startsWith("+91") ? normalized.slice(3, 13) : "";
};

export const normalizeIndianPhoneInputDigits = (value) => {
  let digits = String(value ?? "").replace(/\D/g, "");
  if (!digits) return "";

  if (String(value ?? "").trim().startsWith("+91") && digits.startsWith("91")) {
    digits = digits.slice(2);
  } else if (digits.startsWith("0091")) {
    digits = digits.slice(4);
  } else if (digits.startsWith("091")) {
    digits = digits.slice(3);
  } else if (digits.length > 10 && digits.startsWith("91")) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  return digits.slice(0, 10);
};

const phoneKeys = new Set([
  "phone",
  "phoneNumber",
  "customerPhone",
  "supportPhone",
  "whatsappNumber",
  "alternatePhone",
  "mobile",
  "mobileNumber"
]);

export const isPhoneLikeKey = (key) => {
  if (!key || typeof key !== "string") return false;
  if (key === "whatsapp" || key === "whatsappLogs") return false;
  return phoneKeys.has(key) || /(^|_)(phone|mobile|whatsapp_?number)$/i.test(key);
};

export const normalizePhoneFields = (value, key = "", path = []) => {
  if (path.includes("permissions") || path.includes("featureFlags") || key === "permissions" || key === "featureFlags") {
    return value;
  }
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") {
    if (!key || !isPhoneLikeKey(key) || value == null || value === "") return value;
    if (typeof value !== "string") return value;
    return normalizeIndianPhone(value);
  }
  return Object.fromEntries(
    Object.entries(value).map(([entryKey, entryValue]) => [
      entryKey,
      normalizePhoneFields(entryValue, entryKey, [...path, entryKey])
    ])
  );
};

export const validatePhoneFields = (value, path = []) => {
  if (path.includes("permissions") || path.includes("featureFlags")) return;
  if (Array.isArray(value)) return;
  if (!value || typeof value !== "object") return;
  Object.entries(value).forEach(([key, entryValue]) => {
    if (key === "permissions" || key === "featureFlags") return;
    const nextPath = [...path, key];
    if (
      isPhoneLikeKey(key) &&
      typeof entryValue === "string" &&
      entryValue.trim() !== "" &&
      !isValidIndianPhone(entryValue)
    ) {
      const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
      throw new Error(`${label} must be a valid phone number`);
    }
    validatePhoneFields(entryValue, nextPath);
  });
};
