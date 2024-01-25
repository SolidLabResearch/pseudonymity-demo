import {ClientCredentials, CssControlsApiResponse, CssUserConfig} from "../interfaces";
import fetch from "cross-fetch";
import {createDpopHeader, generateDpopKeyPair} from "@inrupt/solid-client-authn-core";
import {logger} from "../logger";
import {Parser} from "n3";
import {fetchJson} from "./fetching";
import {joinUrlPaths} from "./url";

export function formatCssTokenHeader(token: string) {
    return `CSS-Account-Token ${token}`;
}

export async function extractOidcIssuerValue(webIdProfileDocument: string): Promise<string> {
    return new Promise((resolve, reject) => {
        new Parser().parse(webIdProfileDocument, (error, quad, prefixes) => {
            if (error) reject(error);
            if (quad
                && quad.predicate.value === 'http://www.w3.org/ns/solid/terms#oidcIssuer') {
                resolve(quad.object.value)
            }
        });
    })
}

/**
 *
 * @param urlAccount: <url css instance>/.account/
 * @param email
 * @param password
 */
export async function obtainClientCredentialsV2(
    urlAccount: string,
    webId: string,
    email: string,
    password: string): Promise<ClientCredentials> {

    // Fetch account controls (unauthenticated)
    let accountResponse = await (await fetch(urlAccount)).json()

    // Log in using email/password
    const {authorization} = await (
        await fetch(accountResponse.controls.password.login, {
            method: 'POST',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify({ email,password })
        })
    ).json()

    accountResponse = await fetch(urlAccount, { headers: {authorization: formatCssTokenHeader(authorization)}})

    // Extract authenticated controls
    const { controls: authenticatedControls } = await accountResponse.json()

    // Request client credentials
    const ccResponse = await fetch(
        authenticatedControls.account.clientCredentials,
        {
            method: 'POST',
            headers: {
                authorization: formatCssTokenHeader(authorization),
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                name: `${email}-${Date.now()}-token`,
                webId: webId
            })
        }
    )

    return await ccResponse.json();
}


/**
 * TODO: replace with obtainClientCredentialsV2
 * @param user
 * @param controls
 */
export async function obtainClientCredentials(user: CssUserConfig, controls: CssControlsApiResponse): Promise<ClientCredentials> {
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
        headers: {authorization, 'content-type': 'application/json'},
        body: JSON.stringify({name: `${Date.now()}_${user.email}`, webId: user.webId}),
    })

    const {id, secret} = response;
    return {id, secret} as ClientCredentials;
}

export async function obtainAccessToken(cc: ClientCredentials, webId: string) {
    const webIdProfileDocument = await (await fetch(webId, {headers: {accept: 'text/turtle'}})).text();

    // Extract the OIDC issuer from the WebID Profile Document.
    const oidcIssuer = await extractOidcIssuerValue(webIdProfileDocument);

    const {id, secret} = cc;
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
    const {access_token: accessToken} = await response.json();
    return {accessToken, dpopKey};
}

export interface UserConfig {
    email: string;
    password: string;
    podName: string;
    createPod: boolean;
    css?: string;
}

export const config = {
    baseUrl: 'http://localhost:3000'
}

export async function register(uc: UserConfig) {
    const baseUrl = uc.css ?? config.baseUrl;

    const url = joinUrlPaths(baseUrl, '.account/');
    // Fetch control urls
    let {controls} = await fetchJson(url);
    controls = controls as CssControlsApiResponse

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
    // console.log({accountControls})

    // Add login method
    const {email, password} = uc;
    logger.info(`Adding login method for: ${email}`)
    let res = await fetchJson(accountControls.password.create, {
        method: 'POST',
        headers: {
            Authorization: formatCssTokenHeader(authorization),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({email, password})
    })

    // Create pod
    let podUrls: { pod: string, podResource: string } // TODO: delete
    if (uc.createPod) {
        logger.info(`Creating pod ${uc.podName}`)
        const {pod, podResource, webId} = await fetchJson(accountControls.account.pod, {
            method: 'POST',
            headers: {
                Authorization: formatCssTokenHeader(authorization),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: uc.podName
            }),
        })
        podUrls = {pod, podResource} // TODO: delete
    }

    return {
        ...accountControls,
        // ...podUrls // TODO: delete
    } as CssControlsApiResponse //& { pod: string, podResource: string }
}

export async function registerUsersAndPods(users: CssUserConfig[]): Promise<Record<string, CssControlsApiResponse>> {
    const userOnControls: Record<string, CssControlsApiResponse> = {}
    for await (const u of users) {
        logger.info(`Registering ${u.email} at ${u.css}`)
        // ref: https://communitysolidserver.github.io/CommunitySolidServer/7.x/usage/account/json-api/#example
        const controls = await register(u);
        userOnControls[u.email] = controls
    }
    return userOnControls;
}
