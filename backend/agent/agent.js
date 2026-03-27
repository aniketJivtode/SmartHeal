export async function runAgent(error) {
  console.log("🤖 Agent running...");

  if (error?.message?.includes("Cannot read")) {
    return {
      fix: "Add null check before accessing user.name",
      patch: "if (!user) return null;",
      rca: "User object was null causing property access failure",
      confidence: 0.92,
    };
  }

  return {
    fix: "Unknown issue",
    patch: "",
    rca: "Could not determine root cause",
    confidence: 0.3,
  };
}
