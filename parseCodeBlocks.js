export function parseCodeBlocks(md) {
  const lines = String(md).split("\n");
  let html = "";
  let inCode = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === "```") {
      if (!inCode) {
        html += `<pre class="br-code"><code>`;
        inCode = true;
      } else {
        html += `</code></pre>`;
        inCode = false;
      }
      continue;
    }

    if (inCode) {
      const escaped = String(line)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      html += escaped + "\n";
      continue;
    }

    html += line + "\n";
  }

  if (inCode) {
    html += `</code></pre>`;
  }

  return html;
}
