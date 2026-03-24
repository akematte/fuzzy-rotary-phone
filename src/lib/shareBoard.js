export function encodeBoardPayload(pages, activePageId) {
  const payload = { v: 1, pages, activePageId };
  const json = JSON.stringify(payload);
  return btoa(unescape(encodeURIComponent(json)));
}

export function decodeBoardPayload(encoded) {
  const json = decodeURIComponent(escape(atob(encoded)));
  return JSON.parse(json);
}

export function isPayloadTooLongForUrl(encoded, maxLen = 6000) {
  const urlLen = `${typeof window !== "undefined" ? window.location.origin : ""}${typeof window !== "undefined" ? window.location.pathname : "/"}?share=`.length + encoded.length;
  return urlLen > maxLen;
}
