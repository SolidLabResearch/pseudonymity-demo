import { config } from './config';
import { joinUrlPaths, readJsonFile } from './util';
import {logger} from './logger';
import {fetchJson, formatCssTokenHeader} from './util';

export interface Credentials {
  email: string;
  password: string;
  podName: string;
  createPod: boolean;
  css?: string;
}

export async function register(credentials: Credentials) {  
  const baseUrl = credentials.css ?? config.baseUrl;
  
  const url = joinUrlPaths(baseUrl, '.account/');
  // Fetch control urls
  const {controls} = await fetchJson(url);
  
  // Create account
  const {authorization} = await fetchJson(controls.account.create, {
    method: 'POST',
  })
  
  // Get account controls
  const {controls: accountControls} = await fetchJson(controls.account.create, {
    headers: {
      Authorization: formatCssTokenHeader(authorization),
    }
  })
  console.log({accountControls})

  // Add login method
  const { email, password } = credentials;
  logger.info(`Adding login method for: ${email}`)
  let res = await fetchJson(accountControls.password.create, {
    method:'POST',
    headers: {
      Authorization: formatCssTokenHeader(authorization),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({email, password })
  })

  // Create pod
  if(credentials.createPod) {
    logger.info(`Creating pod ${credentials.podName}`)
    res = await fetchJson(accountControls.account.pod, {
      method: 'POST',
      headers: {
        Authorization: formatCssTokenHeader(authorization),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: credentials.podName
      }),
    })

  }
  

  return accountControls;
}
