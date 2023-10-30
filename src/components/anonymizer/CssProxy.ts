import { buildAuthenticatedFetch } from "@inrupt/solid-client-authn-core";
import {ClientCredentials} from "../../interfaces";
import {obtainAccessToken} from "../../util";

import {ISolidPod, ISolidProxy} from "./interfaces";

export class CssProxy implements ISolidProxy {
    clientCredentials: ClientCredentials;
    storage?: ISolidPod;
    webId: string;
    fetch?: typeof fetch

    constructor(clientCredentials: ClientCredentials, webId: string) {
        this.clientCredentials = clientCredentials;
        this.webId = webId;
    }

    async intializeFetch(): Promise<typeof fetch> {
        const {accessToken, dpopKey} = await obtainAccessToken(this.clientCredentials, this.webId);
        // The DPoP key needs to be the same key as the one used in the previous step.
        // The Access token is the one generated in the previous step.
        const authFetch = await buildAuthenticatedFetch(fetch, accessToken, {dpopKey});
        this.fetch = authFetch;
        return authFetch
    }
}
