export function scopeCheck(patch) {
  // Prevent large changes
  if (patch.length > 200) {
    return { valid: false, reason: "Patch too large" };
  }

  // Only allow local fixes (basic heuristic)
  if (
    patch.includes("import") ||
    patch.includes("require") ||
    patch.includes("class ") ||
    patch.includes("function ")
  ) {
    return {
      valid: false,
      reason: "Patch modifies global structure",
    };
  }

  return { valid: true };
}
