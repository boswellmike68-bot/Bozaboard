export function parseHeadings(md) {
  return String(md)
    .split("\n")
    .map((line) => {
      if (line.startsWith("#### ")) {
        return `<h4 class="br-h4">${line.slice(5)}</h4>`;
      }
      if (line.startsWith("### ")) {
        return `<h3 class="br-h3">${line.slice(4)}</h3>`;
      }
      if (line.startsWith("## ")) {
        return `<h2 class="br-h2">${line.slice(3)}</h2>`;
      }
      if (line.startsWith("# ")) {
        return `<h1 class="br-h1">${line.slice(2)}</h1>`;
      }
      return line;
    })
    .join("\n");
}
