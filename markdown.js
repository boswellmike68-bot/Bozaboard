export const Markdown = {
  sanitize(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;");
  },

  handlers: [],

  use(handler) {
    this.handlers.push(handler);
  },

  render(md) {
    let out = this.sanitize(md);
    for (const h of this.handlers) {
      out = h(out);
    }
    return out;
  }
};
