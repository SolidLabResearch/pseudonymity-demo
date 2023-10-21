import path from 'path';
import fs, { PathLike } from 'fs';
import {logger} from './logger';
import fetch from 'cross-fetch';
import { Parser } from 'n3';

export function joinUrlPaths(...paths: string[]) : URL{
  const [base, ...rest] = paths;
  const url = new URL(path.join(...rest), base);
  return url;
}

export function readJsonFile(path: string|PathLike) {
  return JSON.parse(fs.readFileSync(path, 'utf8'))
}

export function writeJsonFile(fpath: string|PathLike, data: any) {
  fs.writeFileSync(fpath, JSON.stringify(data, null, 2))
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

export async function extractOidcIssuerValue(webIdProfileDocument: string): Promise<string> {
  return new Promise((resolve, reject) => {
    new Parser().parse(webIdProfileDocument, (error, quad, prefixes) => {
      if(error) reject(error);
      if(quad 
        && quad.predicate.value === 'http://www.w3.org/ns/solid/terms#oidcIssuer') {
        resolve(quad.object.value)
      }
    });
  })
}