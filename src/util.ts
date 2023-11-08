import path from 'path';
import fs, { PathLike } from 'fs';
import {logger} from './logger';
import fetch from 'cross-fetch';
import { Parser } from 'n3';
import {ClientCredentials, CssUserConfig} from "./interfaces";
import {createDpopHeader, generateDpopKeyPair} from "@inrupt/solid-client-authn-core";
import {register} from "./register";
import jsonld from 'jsonld'

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

export async function obtainClientCredentials(user: CssUserConfig, controls: Record<string, any>): Promise<ClientCredentials> {
  /**
   * Login and get authorization token
   * @param user
   * @param controls
   * @returns authorization token
   */
  async function loginAndGetAuthorizationToken(
      user: Record<string, any>,
      controls: Record<string, any>) {
    const {authorization} = await fetchJson(controls.password.login, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        password: user.password,
      })
    })
    return authorization;
  }
  // Login, get authorization token, and format as CSS-Account-Token header
  const authorization = formatCssTokenHeader(
      await loginAndGetAuthorizationToken(user, controls)
  );

  // Obtain client credentials
  const response = await fetchJson(controls.account.clientCredentials, {
    method: 'POST',
    headers: { authorization, 'content-type': 'application/json' },
    body: JSON.stringify({ name: `${Date.now()}_${user.email}`, webId: user.webId }),
  })

  const { id, secret } = response;
  return { id, secret } as ClientCredentials;
}

export async function obtainAccessToken(cc: ClientCredentials, webId: string) {
  const webIdProfileDocument = await (await fetch(webId, { headers: { accept: 'text/turtle' } })).text();

  // Extract the OIDC issuer from the WebID Profile Document.
  const oidcIssuer = await extractOidcIssuerValue(webIdProfileDocument);

  const { id, secret } = cc;
  // A key pair is needed for encryption.
  // This function from `solid-client-authn` generates such a pair for you.
  const dpopKey = await generateDpopKeyPair();

  // These are the ID and secret generated in the previous step.
  // Both the ID and the secret need to be form-encoded.
  const authString = `${encodeURIComponent(id)}:${encodeURIComponent(secret)}`;
  // This URL can be found by looking at the "token_endpoint" field at
  // http://localhost:3000/.well-known/openid-configuration
  // if your server is hosted at http://localhost:3000/.
  const tokenUrl = joinUrlPaths(oidcIssuer!, '.oidc', 'token').toString();

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      // The header needs to be in base64 encoding.
      authorization: `Basic ${Buffer.from(authString).toString('base64')}`,
      'content-type': 'application/x-www-form-urlencoded',
      dpop: await createDpopHeader(tokenUrl, 'POST', dpopKey),
    },
    body: 'grant_type=client_credentials&scope=webid',
  });

  // This is the Access token that will be used to do an authenticated request to the server.
  // The JSON also contains an "expires_in" field in seconds,
  // which you can use to know when you need request a new Access token.
  const { access_token: accessToken } = await response.json();
  return {accessToken, dpopKey};
}

export async function registerUsersAndPods(users: any): Promise<Record<string, any>>  {
  const userOnControls: Record<string, any> = {}
  for await (const u of users) {
    logger.info(`Registering ${u.email} at ${u.podName}`)
    // ref: https://communitysolidserver.github.io/CommunitySolidServer/7.x/usage/account/json-api/#example
    const controls = await register(u);
    userOnControls[u.email] = controls
  }
  return userOnControls;
}

export function _hack_addEnsureContextFunction(suite: any) {
  suite.ensureSuiteContext = ({ document }: any) => {
    const contextUrls = [
      // 'https://w3id.org/security/suites/bls12381-2020/v1',
      'https://w3id.org/security/bbs/v1'
    ];

    if (typeof document['@context'] === 'string' && contextUrls.includes(document['@context'])) {
      return;
    }

    if (Array.isArray(document['@context']) &&
        contextUrls.filter(url => document['@context'].includes(url)).length) {
      return;
    }

    throw new TypeError(
        `The document to be signed must contain one of this suite's @context, ` +
        `"${contextUrls.join(', ')}", got "${document['@context']?.join(', ')}".`
    );
  };
  return suite;
}

import * as bls12381 from '@transmute/did-key-bls12381';
export async function generateBls12381Keys(seed: string) {
  return await bls12381.generate({secureRandom: () => Buffer.from(seed)}, {accept: 'application/did+ld+json'})
}

function Vocab(ns: string) {
  return (p: string) => ns.concat(p)
}

// https://solid.github.io/vocab/
export const namespaces = {
  sec: 'https://w3id.org/security#',
  rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  cert: 'http://www.w3.org/ns/auth/cert#',
  foaf: 'http://xmlns.com/foaf/0.1/'
}
export const vocabs = Object.fromEntries(
    Object.entries(namespaces).map(
        ([prefix, ns]) => [
          prefix, Vocab(ns as string)
        ]
    )
)

export async function jld2rdf(jld: object): Promise<object> {
  return await jsonld.toRDF(jld, {format: 'application/n-quads'});
}
