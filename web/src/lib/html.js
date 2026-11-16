// Ubah HTML editor menjadi teks biasa (per paragraf = 1 baris) untuk diff & cuplikan
export function htmlToText(html = "") {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  const blocks = doc.body.querySelectorAll("p, h1, h2, h3, li, blockquote, pre");
  if (blocks.length === 0) return doc.body.textContent.trim();
  return Array.from(blocks)
    // Abaikan blok induk yang isinya sudah tercakup blok anak (mis. <li><p>)
    .filter((el) => !el.querySelector("p, h1, h2, h3, li, blockquote, pre"))
    .map((el) => el.textContent.trim())
    .join("\n");
}

export function excerpt(html, max = 90) {
  const text = htmlToText(html).replace(/\n+/g, " ");
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}
