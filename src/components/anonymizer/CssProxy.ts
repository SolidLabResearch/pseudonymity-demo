import { buildAuthenticatedFetch } from "@inrupt/solid-client-authn-core";
import {ClientCredentials} from "../../interfaces";
import {obtainAccessToken} from "../../util";

import {ISolidPod, ISolidProxy} from "./interfaces";
import {createContainerAt} from "@inrupt/solid-client";
import {logger} from "../../logger";
import path from "path";
import {fetch} from "@inrupt/universal-fetch";
import {Util} from "n3";
import prefixes = Util.prefixes;

export class CssProxy implements ISolidProxy {
    clientCredentials: ClientCredentials;
    controls?: any
    storage?: ISolidPod;
    webId: string;
    fetch?: typeof fetch

    constructor(clientCredentials: ClientCredentials, webId: string, controls?:any) {
        this.clientCredentials = clientCredentials!;
        this.webId = webId!;
        this.controls = controls!;
    }

    async intializeFetch(): Promise<typeof fetch> {
        logger.debug(`[${this.webId}] initializeFetch`)
        const {accessToken, dpopKey} = await obtainAccessToken(this.clientCredentials, this.webId);
        // The DPoP key needs to be the same key as the one used in the previous step.
        // The Access token is the one generated in the previous step.
        const authFetch = await buildAuthenticatedFetch(fetch, accessToken, {dpopKey});
        this.fetch = authFetch;
        return authFetch
    }

    async parsedFetch(input: URL | RequestInfo,init?: RequestInit | undefined): Promise<any> {
        return await CssProxy.parseResponse(await this.fetch!(input,init))
    }

    isInitialized(): boolean {
        return this.fetch !== undefined
    }

    static async parseResponse(response: Response) {
        if(!response.ok)
            throw new Error(`Response has status code: ${response.status} (${response.statusText}).\nURL: ${response.url}`)

        let payload = undefined;
        switch (response.headers.get('content-type')) {
            case 'application/json':
            case 'application/ld+json':
                payload = await response.json();
                break;
            case 'text/turtle':
                payload = await response.text();
                // TODO: parse with N3 & return N3 quad store
                break;
            default:
                throw new Error('Not yet implemented: parsing of '+ response.headers.get('content-type'))
        }
        return payload
    }


    /**
     * Spec: https://solid.github.io/specification/protocol#writing-resources
     * @param url
     * @param where
     * @param inserts
     * @param deletes
     * @param prefixes
     */
    async n3patch(url: string,
                  where?:string,
                  inserts?:string,
                  deletes?:string,
                  prefixes?: Record<string,string>
                  ){

        const clauses = [
            where ? `solid:where { ${where} }` : where,
            inserts ? `solid:inserts { ${inserts} }` : inserts,
            deletes ? `solid:deletes { ${deletes} }` : deletes,
        ].filter(c => c!!).join(';\n')


        const n3Patch = `
        @prefix solid: <http://www.w3.org/ns/solid/terms#>.
        ${
            prefixes! ? Object.entries(prefixes!).map(([p,ns])=>`@prefix ${p}: <${ns}> .`).join('\n') : ''
        }
        
        _:rename a solid:InsertDeletePatch;
            ${clauses}
        .
        `

        const response = await this.fetch!(
            url,
            {
                method: 'PATCH',
                headers: {
                    'content-type': "text/n3"
                },
                body: n3Patch
            }
        )

        const {ok, status, statusText} = response
        if(!ok)
            throw new Error(`
            N3 Patch failed.
            Url: ${url}
            Status: ${status} - ${statusText}
            N3 Patch:\n${n3Patch}
            `)

    }
}
