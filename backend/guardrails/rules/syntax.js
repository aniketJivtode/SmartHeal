export function syntaxCheck(patch) {
  if (!patch) return { valid: false, reason: "Empty patch" };

  // basic JS syntax sanity
  if (
    patch.includes(";;") ||
    patch.includes("== =") ||
    patch.includes("return return")
  ) {
    return { valid: false, reason: "Invalid syntax pattern" };
  }

  return { valid: true };
}
