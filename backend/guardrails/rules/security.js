export function securityCheck(patch) {
  const blocked = [
    "process.exit",
    "child_process",
    "exec(",
    "spawn(",
    "fs.unlink",
    "fs.rmdir",
    "rm -rf",
    "eval(",
    "Function(",
    "while(true)",
    "for(;;)",
  ];

  for (let b of blocked) {
    if (patch.includes(b)) {
      return {
        valid: false,
        reason: `Security risk detected: ${b}`,
      };
    }
  }

  return { valid: true };
}
