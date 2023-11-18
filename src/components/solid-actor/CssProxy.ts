import {buildAuthenticatedFetch} from "@inrupt/solid-client-authn-core";
import {ClientCredentials} from "../../interfaces";

import {
    AccessModes,
    buildThing,
    deleteContainer,
    deleteFile,
    getContainedResourceUrlAll,
    getResourceInfo,
    getSolidDataset,
    getThing,
    overwriteFile,
    saveSolidDatasetAt,
    setThing,
    ThingPersisted,
    universalAccess,
    UrlString
} from "@inrupt/solid-client";
import {logger} from "../../logger";
import {fetch} from "@inrupt/universal-fetch";
import {Util} from "n3";
import {obtainAccessToken} from "../../utils/css";
import {ISolidPod, ISolidProxy} from "./interfaces";

export class CssProxy implements ISolidProxy {
    clientCredentials: ClientCredentials;
    controls?: any
    storage?: ISolidPod;
    fetch?: typeof fetch
    webId: string;

    constructor(clientCredentials: ClientCredentials, webId: string, controls?: any) {
        if (!clientCredentials!!)
            throw new Error('Client Credentials are required!')

        this.clientCredentials = clientCredentials!;
        this.webId = webId!;
        this.controls = controls!;
    }

    get cardUrl() {
        return this.webId.replace('#me', '')
    }

    get podUrl(): string {
        // TODO: dynamically determine pod url
        return this.webId.replace('/profile/card#me', '')
        // return this.controls.pod!
    }

    static async parseResponse(response: Response) {
        if (!response.ok)
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
                throw new Error('Not yet implemented: parsing of ' + response.headers.get('content-type'))
        }
        return payload
    }

    static async probeRequest(url: string, fetch: Function) {
        const {status, statusText, headers} = await fetch(url)
        return {
            status,
            statusText,
            headers
        }
    }

    static async resourceExists(url: string, fetch: Function): Promise<boolean> {
        const {status} = await CssProxy.probeRequest(url, fetch)
        return status !== 404
    }



    async parsedFetch(input: URL | RequestInfo, init?: RequestInit | undefined): Promise<any> {
        return await CssProxy.parseResponse(await this.fetch!(input, init))
    }

    async initialize() {
        logger.debug(`[${this.webId}] initializeFetch`)
        const all = await obtainAccessToken(this.clientCredentials, this.webId);
        const {accessToken, dpopKey} = all
        // The DPoP key needs to be the same key as the one used in the previous step.
        // The Access token is the one generated in the previous step.
        const authFetch = await buildAuthenticatedFetch(fetch, accessToken, {dpopKey});
        this.fetch = authFetch;
    }

    isInitialized(): boolean {
        return this.fetch !== undefined
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
                  where?: string,
                  inserts?: string,
                  deletes?: string,
                  prefixes?: Record<string, string>
    ) {

        const clauses = [
            where ? `solid:where { ${where} }` : where,
            inserts ? `solid:inserts { ${inserts} }` : inserts,
            deletes ? `solid:deletes { ${deletes} }` : deletes,
        ].filter(c => c!!).join(';\n')


        const n3Patch = `
        @prefix solid: <http://www.w3.org/ns/solid/terms#>.
        ${
            prefixes! ? Object.entries(prefixes!).map(([p, ns]) => `@prefix ${p}: <${ns}> .`).join('\n') : ''
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
        if (!ok)
            throw new Error(`
            N3 Patch failed.
            Url: ${url}
            Status: ${status} - ${statusText}
            N3 Patch:\n${n3Patch}
            `)

    }

    /**
     * TODO: refactor to CssProxy
     * @param urlContainer
     * @param data
     * @param mimeType
     * @param slug
     * @param publicAccess
     */
    async addFileToContainer(
        urlContainer: string,
        data: Buffer,
        mimeType = 'application/ld+json',
        slug: string,
        publicAccess?: AccessModes
    ) {
        logger.debug('addFileToSolidPod()')
        const file = new Blob([data])
        const fileUrl = new URL(slug, urlContainer).toString() as UrlString

        await overwriteFile(
            fileUrl,
            file,
            {contentType: mimeType, fetch: this.fetch!}
        )

        const serverResourceInformation = await getResourceInfo(fileUrl, {fetch: this.fetch!})
        if (publicAccess!!) {
            await universalAccess.setPublicAccess(serverResourceInformation.internal_resourceInfo.sourceIri, publicAccess!, {fetch: this.fetch!})
        }
        return serverResourceInformation.internal_resourceInfo.sourceIri

    }

    /**
     * Deletes container (and its constituent resources), if it exists.
     * @param containerUrl
     */
    async deleteContainer(containerUrl: string) {
        const opts = {fetch: this.fetch!}
        // Delete container if it exists
        const containerExists = await CssProxy.resourceExists(containerUrl, opts.fetch);
        if (containerExists) {

            // Delete container resources, if any
            const containerResources = getContainedResourceUrlAll(await getSolidDataset(containerUrl, opts),)
            for await (const cr of containerResources) {
                await deleteFile(cr, opts)
            }
            // Then delete the container
            await deleteContainer(containerUrl, opts)
        }
    }

    async getCard() {
        return await getSolidDataset(this.cardUrl, {fetch: this.fetch!})
    }

    async getProfileBuilder() {

        const card = await getSolidDataset(this.cardUrl, {fetch: this.fetch!})
        return buildThing(
            getThing(card, this.webId)!
        )
    }

    async updateProfile(profileUpdate: ThingPersisted) {
        const meUpdate = setThing(
            await this.getCard(),
            profileUpdate
        )

        await saveSolidDatasetAt(
            this.cardUrl,
            meUpdate,
            {fetch: this.fetch!}
        )
    }




}
