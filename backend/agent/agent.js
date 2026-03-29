export async function runAgent(error) {
  console.log("🤖 Agent running...");

  const message = typeof error === "string" ? error : error?.message || "";

  // helper
  const baseResponse = {
    fix: "",
    patch: "",
    rca: "",
    confidence: 0,
  };

  // 🧠 Case 1: Null / Undefined access
  if (
    message.includes("Cannot read") ||
    message.includes("undefined") ||
    message.includes("null")
  ) {
    return {
      ...baseResponse,
      fix: "Add null/undefined guard before property access",
      patch: `
if (!user) {
  console.warn("User object missing");
  return null;
}
`,
      rca: "Attempted to access a property on undefined/null object",
      confidence: 0.9,
    };
  }

  // 🧠 Case 2: API failure / fetch error
  if (
    message.includes("fetch") ||
    message.includes("network") ||
    message.includes("ECONNREFUSED")
  ) {
    return {
      ...baseResponse,
      fix: "Wrap API call in try/catch with retry fallback",
      patch: `
try {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Bad response");
} catch (err) {
  console.error("API failed:", err);
}
`,
      rca: "Unhandled network/API failure causing crash",
      confidence: 0.9,
    };
  }

  // 🧠 Case 3: JSON parsing issue
  if (message.includes("JSON")) {
    return {
      ...baseResponse,
      fix: "Add safe JSON parsing with validation",
      patch: `
let data;
try {
  data = JSON.parse(input);
} catch (e) {
  console.error("Invalid JSON");
}
`,
      rca: "Malformed JSON input not handled safely",
      confidence: 0.85,
    };
  }

  // 🧠 Case 4: Timeout / async issue
  if (message.includes("timeout")) {
    return {
      ...baseResponse,
      fix: "Add timeout handling and fallback",
      patch: `
const controller = new AbortController();
setTimeout(() => controller.abort(), 5000);
await fetch(url, { signal: controller.signal });
`,
      rca: "Long-running async operation exceeded expected time",
      confidence: 0.75,
    };
  }

  // 🧠 Case 5: Default fallback
  return {
    ...baseResponse,
    fix: "Add logging and guard clauses to isolate issue",
    patch: `
console.error("Unhandled error:", error);
`,
    rca: "Unknown error pattern — requires manual investigation",
    confidence: 0.9,
  };
}
