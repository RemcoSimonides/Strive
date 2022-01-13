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