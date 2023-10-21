import fs from 'fs';
import { joinUrlPaths, readJsonFile, writeJsonFile } from "./util"
import { register } from "./register"
import {fetchJson, formatCssTokenHeader, extractOidcIssuerValue} from './util';
import { createDpopHeader, generateDpopKeyPair, buildAuthenticatedFetch } from '@inrupt/solid-client-authn-core';
import { ClientCredentials } from './interfaces';

async function registerUsersAndPods(users: any): Promise<Record<string, any>>  {
  const userOnControls: Record<string, any> = {}
  for await (const u of users) {
    console.log(`Registering ${u.email} at ${u.podName}`)
    // ref: https://communitysolidserver.github.io/CommunitySolidServer/7.x/usage/account/json-api/#example
    const controls = await register(u);
    userOnControls[u.email] = controls
  }
  return userOnControls;
}

async function obtainClientCredentials(user: Record<string, any>, controls: Record<string, any>): Promise<ClientCredentials> {
  console.log({user, controls})
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

async function obtainAccessToken(cc: ClientCredentials, webId: string) {
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
/**
 * DRIVER
 */
const users = readJsonFile('./common/css-users.json')

/**
 * TEMPORARY DEV MEASURE
 * If dev.user-on-controls.json exists, use that.
 * (It means we've already registered the users and pods)
 */

// 


async function preflight() {
  let userOnControls: Record<string, any>;
  if(!fs.existsSync('./dev.user-on-controls.json')) {
    userOnControls = await registerUsersAndPods(users);
    writeJsonFile('./dev.user-on-controls.json', userOnControls)  
  } else {
    userOnControls = readJsonFile('./dev.user-on-controls.json')
  }
  return userOnControls;
}




async function wip(userOnControls: Record<string, any>) {
  
  const entries = Object.entries(userOnControls) as [string, Record<string, any>][];
  const e = entries[0];
  const [email, controls] = e;
  const user = users.find((u: any) => u.email === email);
  
  // Client Credentials
  const cc: ClientCredentials = await obtainClientCredentials(user, controls);
  // Access Token & DPoP Key
  const {accessToken, dpopKey} = await obtainAccessToken(cc, user.webId);
  
  // The DPoP key needs to be the same key as the one used in the previous step.
  // The Access token is the one generated in the previous step.
  const authFetch = await buildAuthenticatedFetch(fetch, accessToken, { dpopKey });
  
  // authFetch can now be used as a standard fetch function that will authenticate as your WebID.
  // This request will do a simple GET for example.
  let response = await authFetch(controls.pod);
  console.log(await response.text());
}

preflight()
  .then(wip)
  .then(() => console.log('Done'))