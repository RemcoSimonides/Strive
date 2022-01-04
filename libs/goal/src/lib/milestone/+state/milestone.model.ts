/**
 * Counts the number of dots in the sequence number
 */
export const getNrOfDotsInSeqno = (sequenceNumber: string) => (sequenceNumber.match(/\./g) || []).length

/**
 * Get a part of the sequence number
 * e.g. return part 0 of sequenceNumber 1.2.3 = 1
 * return part 1 of sequenceNumber 1.2.3 = 1.2
 * return part 2 of sequenceNumber 1 = 1
 */
export const getPartOfSeqno = (sequenceNumber: string, part: number): string => {
  const elements = sequenceNumber.split('.')

  if (elements.length === 1) return sequenceNumber
  if (part === 0) return elements[0]
  if (part === 1 || (part === 2 && elements.length === 2)) {
    return `${elements[0]}.${elements[1]}`
  }
  return sequenceNumber
}