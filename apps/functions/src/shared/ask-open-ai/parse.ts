export function parseRaw(answer: string): string[] | undefined {
  let value = answer.trim().replace(/\r?\n|\r/g, '').trim()  // regex removes new lines

  // Extract content between code fences if present anywhere in the string
  const codeFenceMatch = value.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  if (codeFenceMatch) {
    value = codeFenceMatch[1]
  }

  // Extract the JSON array from the string if it doesn't start with [
  if (!value.startsWith('[')) {
    const arrayStart = value.indexOf('[')
    if (arrayStart !== -1) {
      value = value.substring(arrayStart)
    }
  }

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