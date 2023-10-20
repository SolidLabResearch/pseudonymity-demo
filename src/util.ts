import path from 'path';
import fs, { PathLike } from 'fs';
import {logger} from './logger';
import fetch from 'cross-fetch';
export function joinUrlPaths(...paths: string[]) : URL{
  const [base, ...rest] = paths;
  const url = new URL(path.join(...rest), base);
  return url;
}

export function readJsonFile(path: string|PathLike) {
  return JSON.parse(fs.readFileSync(path, 'utf8'))
}

/**
 * Fetch and unwrap json.
 * Throws error if response is not ok.
 * @param url 
 * @param options 
 * @returns 
 */
export async function fetchJson(url: string|URL, options?: RequestInit) {
  logger.debug({url, options})
  const response = await fetch(url, options);
  
  if(!response.ok) throw new Error(`
    Fetch failed with status ${response.status} ${response.statusText}
    Url: ${url}
  `);
  const json = await response.json();
  return json;
}


export function formatCssTokenHeader(token: string) {
  return `CSS-Account-Token ${token}`;
}