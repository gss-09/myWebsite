// Builds a "01\n02\n…\nNN" string for the decorative editor line-number gutter.
export const lines = (n) =>
  Array.from({ length: n }, (_, i) => String(i + 1).padStart(2, "0")).join("\n");
