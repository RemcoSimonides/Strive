import { DocumentData } from "firebase/firestore";


// DO NOT USE FUNCTIONS IN BACKEND

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

export function toDate<D>(target: DocumentData): D {
  if (!target) return;
  if (typeof target !== 'object') return target;
  for (const key in target) {
    const value = target[key];
    if (!value || typeof value !== 'object') continue;
    if (!!value['seconds'] && value['nanoseconds'] >= 0) {
      try {
        target[key] = value.toDate();
      } catch (_) {
        console.log(`${key} is not a Firebase Timestamp`);
      }
      continue;
    }
    toDate(value);
  }
  return target as D;
}