export function parseHorizontalRules(md) {
  return String(md)
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (trimmed === "---" || trimmed === "***") {
        return `<hr class="br-hr">`;
      }
      return line;
    })
    .join("\n");
}
