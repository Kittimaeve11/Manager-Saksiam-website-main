const hasHtmlTag = (value: string) => /<\/?[a-z][\s\S]*>/i.test(value);

const decodeHtmlEntities = (value: string) =>
  value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

const escapeHtml = (value: string) =>
  value
    .replace(/&(?!(amp|lt|gt|quot|#39|nbsp);)/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const preserveHtmlSpacing = (html: string) =>
  html
    .split(/(<[^>]+>)/g)
    .map((part) => {
      if (part.startsWith("<") && part.endsWith(">")) return part;

      return part
        .replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;")
        .replace(/ {2,}/g, (spaces) => "&nbsp;".repeat(spaces.length));
    })
    .join("");

const textToEditorHtml = (value: string) => {
  const normalized = value
    .replace(/\r\n/g, "\n")
    .replace(/\\n/g, "\n")
    .trim();

  if (!normalized) return "";

  const decoded = decodeHtmlEntities(normalized);

  if (hasHtmlTag(decoded)) {
    return preserveHtmlSpacing(decoded);
  }

  return decoded
    .split(/\n{2,}/)
    .map((paragraph) => {
      const html = paragraph
        .split("\n")
        .map((line) => escapeHtml(line))
        .map((line) => preserveHtmlSpacing(line))
        .join("<br />");

      return `<p>${html}</p>`;
    })
    .join("");
};

export const encodePolicyDetailForApi = (detail: string) =>
  JSON.stringify(preserveHtmlSpacing(detail.trim()));

export const decodePolicyDetailFromApi = (detail: unknown): string => {
  let value = detail ?? "";

  for (let index = 0; index < 2; index += 1) {
    if (typeof value !== "string") break;

    const trimmed = value.trim();
    const looksLikeJson =
      trimmed.startsWith('"') ||
      trimmed.startsWith("[") ||
      trimmed.startsWith("{");

    if (!looksLikeJson) break;

    try {
      const parsed = JSON.parse(trimmed);

      if (typeof parsed === "string") {
        value = parsed;
        continue;
      }

      if (Array.isArray(parsed)) {
        value = parsed.join("\n");
      }

      break;
    } catch {
      break;
    }
  }

  return textToEditorHtml(String(value ?? ""));
};
