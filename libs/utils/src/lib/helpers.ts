export function setDateToEndOfDay(date: string): string {
  return new Date(date).setHours(23, 59, 59, 999).toString()
}

/** Basic function to create a delay in a function when called
 * @param ms milleseconds to wait for
 */
 export async function delay(ms: number) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

/**
 * Example with (['A', 'B', 'C'], ', ', ' & ')
 * output : "A, B & C";
 * @param str
 * @param joinWith
 * @param endWith
 * @returns
 */
 export function smartJoin(str: string[], joinWith = ', ', endWith = ', ') {
  const last = str.pop();
  return `${str.join(joinWith)}${str.length ? endWith : ''}${last || ''}`;
}

export function isValidHttpUrl(url: string) {
  try {
    const value = new URL(url);
    return value.protocol === "http:" || value.protocol === "https:";
  } catch (_) {
    return false;  
  } 
}