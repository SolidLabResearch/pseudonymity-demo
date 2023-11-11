import {logger} from "../logger";
import fetch from "cross-fetch";

/**
 * Fetch and unwrap json.
 * Throws error if response is not ok.
 * @param url
 * @param options
 * @returns
 */
export async function fetchJson(url: string | URL, options?: RequestInit) {
    logger.debug({url, options})
    const response = await fetch(url, options);

    if (!response.ok) throw new Error(`
    Fetch failed with status ${response.status} ${response.statusText}
    Url: ${url}
  `);
    const json = await response.json();
    return json;
}
