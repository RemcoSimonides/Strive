/**
 * Reads the string array under `key` from a JSON object that may still be streaming in, like
 * `{"milestones":["Buy shoes","Run 5`. Complete items are returned as they are; an item that is still
 * being written is returned as far as it got, so the list grows word by word on screen.
 */
export function parsePartialArray(raw: string, key: string): string[] {
  const keyAt = raw.indexOf(`"${key}"`)
  if (keyAt === -1) return []
  const open = raw.indexOf('[', keyAt)
  if (open === -1) return []

  const items: string[] = []
  let i = open + 1
  while (i < raw.length) {
    const char = raw[i]
    if (char === ']') break
    if (char !== '"') { i++; continue }

    // a string literal: find its closing quote, skipping escaped characters
    let end = i + 1
    while (end < raw.length && raw[end] !== '"') end += raw[end] === '\\' ? 2 : 1

    const complete = end < raw.length
    const text = raw.slice(i + 1, Math.min(end, raw.length))
    const body = complete ? text : text.replace(/\\$/, '') // a dangling escape is not text yet
    try {
      items.push(JSON.parse(`"${body}"`))
    } catch {
      // half an escape sequence such as \u00; the next chunk completes it
    }
    if (!complete) break
    i = end + 1
  }
  return items
}
