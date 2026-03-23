export function parseLists(md) {
  const lines = String(md).split("\n");
  let html = "";
  let inUL = false;
  let inOL = false;

  const closeLists = () => {
    if (inUL) {
      html += "</ul>";
      inUL = false;
    }
    if (inOL) {
      html += "</ol>";
      inOL = false;
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (/^[-*] /.test(trimmed)) {
      if (!inUL) {
        closeLists();
        html += "<ul>";
        inUL = true;
      }
      html += `<li>${trimmed.slice(2)}</li>`;
      continue;
    }

    if (/^\d+\. /.test(trimmed)) {
      if (!inOL) {
        closeLists();
        html += "<ol>";
        inOL = true;
      }
      const content = trimmed.replace(/^\d+\. /, "");
      html += `<li>${content}</li>`;
      continue;
    }

    closeLists();
    html += line + "\n";
  }

  closeLists();
  return html;
}
