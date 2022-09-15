
export function sum(array: number[]): number
export function sum<T>(array: T[], getAmount: (item: T) => number): number
export function sum<T>(array: T[], getAmount?: (item: T) => number): number {
  const cb = getAmount || ((item: number) => item);
  return array.reduce((total, item) => total + cb(item as any), 0);
}


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

export function unique<T>(array: T[]) {
  return Array.from(new Set(array));
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

/** This is black magic from stack-overflow to detect if the browser is Safari or not.
 * Here we can not rely on `navigator.userAgent` because other Browser like Chromium put "Safari"
 * in there userAgent.
 * More details about the code below here : https://stackoverflow.com/questions/7944460/detect-safari-browser
*/
export function isSafari() {
  return navigator.vendor && navigator.vendor.indexOf('Apple') > -1 &&
  navigator.userAgent &&
  navigator.userAgent.indexOf('CriOS') == -1 &&
  navigator.userAgent.indexOf('FxiOS') == -1
}

export function createRandomString(size: number) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < size; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}