import {AbstractSolidActor} from "./AbstractSolidActor";
import {Bls12381G2KeyPair} from "@mattrglobal/jsonld-signatures-bbs";
import {UploadConfiguration} from "./interfaces";
import {CssProxy} from "../anonymizer/CssProxy";
import {IDocumentLoader} from "../../contexts/interfaces";
import {exportPublicG2} from "../../utils/keypair";
import {AccessModes} from "@inrupt/solid-client";
import path from "path";
import {IDidDocument} from "./did-interfaces";
import {NotInitializedError} from "./errors";
import {logger} from "../../logger";
import {string} from "rdflib/lib/utils-js";

export class SolidDidActor extends AbstractSolidActor {
    g2?: Bls12381G2KeyPair
    g2Slug: string
    g2DestinationContainer: string
    protected seed: string
    private uploadConfigurations: UploadConfiguration[]

    constructor(proxy: CssProxy, webId: string, documentLoader: IDocumentLoader) {
        super(proxy, webId, documentLoader);
        this.seed = '|'.concat(webId, proxy.clientCredentials.id, proxy.clientCredentials.secret)
        this.g2Slug = '#key-g2'
        this.g2DestinationContainer = this.controllerId
        this.uploadConfigurations = [
            {
                o: () => this.g2,
                serialize: async (o: object) => {
                    let xp = exportPublicG2(o as Bls12381G2KeyPair)
                    return JSON.stringify(xp, null, 2)
                },
                destContainer: this.g2DestinationContainer,
                slug: this.g2Slug,
                mimeType: 'application/ld+json',
                access: {public: {read: true} as AccessModes}
            } as UploadConfiguration
        ]
    }

    get didsContainerUrl(): string {
        return path.join(this.proxy.podUrl, '/dids/')
    }

    get controllerId(): string {
        return path.join(this.didsContainerUrl, 'controller')
    }

    get controllerDocumentContext(): string[] {
        return ['https://www.w3.org/ns/did/v1']
    }

    /**
     * Refs
     * https://www.w3.org/TR/did-core/#did-document-properties
     */
    get controllerDocument(): IDidDocument {
        return {
            '@context': this.controllerDocumentContext,
            'id': this.controllerId,
            alsoKnownAs: this.webId,
            verificationMethod: [exportPublicG2(this.g2!)],
            assertionMethod: [this.g2?.id!]
        }
    }


    async initialize(): Promise<void> {
        await super.initialize();
        await this.initializeBls1238G2KeyPair()
        await this.uploadResourcesToPod(this.uploadConfigurations);
    }

    isInitialized(): boolean {
        return [
            super.isInitialized(),
            this.g2!!,
        ].every(x => x)
    }


    private async initializeBls1238G2KeyPair() {
        logger.debug('initializeBls1238G2KeyPair()')

        this.g2 = await Bls12381G2KeyPair.generate({
            controller: this.controllerId,
            id: new URL(this.g2Slug, this.g2DestinationContainer).toString(),
            seed: Uint8Array.from(Buffer.from(this.seed))
        })

    }
}
