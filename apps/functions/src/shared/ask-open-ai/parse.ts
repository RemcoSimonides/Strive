export function parseRaw(answer: string): string[] | undefined {
  let value = answer.trim().replace(/\r?\n|\r/g, '').trim()  // regex removes new lines
  value = value.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '')  // strip markdown code fences
  if (value.split('"').length % 2 === 0) value = value + '"'
  if (value.startsWith('[') && !value.endsWith(']')) value = value + ']'

  try {
    const parsed = JSON.parse(value)
    if (typeof parsed !== 'object') return
    const string: any = Array.isArray(parsed) ? parsed : Object.values(parsed)[0]
    if (string.some(item => typeof item !== 'string')) return

    return string
  } catch (e) {
    return
  }
}