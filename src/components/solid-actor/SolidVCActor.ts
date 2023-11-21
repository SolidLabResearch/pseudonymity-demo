import {ISolidActor, UploadConfiguration} from "./interfaces";
import {CssProxy} from "./CssProxy";
import {Bls12381G2KeyPair} from "@mattrglobal/jsonld-signatures-bbs";
import {IDocumentLoader} from "../../contexts/interfaces";
import path from "path";
import {AccessModes} from "@inrupt/solid-client";
import {IDidDocument} from "./did-interfaces";
import {exportPublicG2} from "../../utils/keypair";
import {logger} from "../../logger";
import {AbstractBls12381G2VCActor} from "./DidVCActor";
import {joinUrlPaths} from "../../utils/url";

export class SolidVCActor
    extends AbstractBls12381G2VCActor
    implements ISolidActor {
    webId: string;
    keyName: string
    proxy: CssProxy
    _controllerContainer: string
    _controllerId: string
    uploadConfigurations: UploadConfiguration[]

    constructor(key: Bls12381G2KeyPair, keyName: string, documentLoader: IDocumentLoader, proxy: CssProxy) {
        super(key, documentLoader);
        this.webId = proxy.webId;
        this.proxy = proxy;
        this.keyName = keyName
        this._controllerContainer = this.webId.replace('profile/card#me', 'dids/')
        this._controllerId = joinUrlPaths(this.controllerContainer, 'controller')
        this.uploadConfigurations = [
            {
                description: `Uploads controller document to Solid Pod`,
                o: () => this.controllerDocument,
                serialize: async (o: object) => JSON.stringify(o, null, 2),
                destContainer: this.controllerContainer,
                slug: 'controller',
                mimeType: 'application/ld+json',
                access: {public: {read: true} as AccessModes}
            } as UploadConfiguration
        ]
    }

    get identifier(): string {
        return this.webId;
    }

    get controllerContainer(): string {
        return this._controllerContainer
    }

    get controllerId(): string {
        return this._controllerId
    }

    /**
     * Refs
     * https://www.w3.org/TR/did-core/#did-document-properties
     * https://www.w3.org/TR/vc-data-integrity/#controller-documents
     */
    get controllerDocument(): IDidDocument {
        return {
            '@context': this.controllerDocumentContext,
            'id': this.controllerId,
            alsoKnownAs: this.webId,
            verificationMethod: [exportPublicG2(this.key!)],
            assertionMethod: [this.key.id!]
        }
    }

    async uploadResourcesToPod(uploadConfigurations: UploadConfiguration[]) {
        logger.debug('uploadResourcesToPod()')
        for await (const uc of uploadConfigurations) {
            const ser = await uc.serialize!(uc.o());
            await this.proxy.addFileToContainer(
                uc.destContainer,
                Buffer.from(ser),
                uc.mimeType,
                uc.slug,
                uc.access?.public)
            logger.debug(`Added file ${uc.slug} to ${uc.destContainer}`)
        }
    }


    async initialize(): Promise<void> {
        await super.initialize();
        await this.proxy.initialize()
        await this.uploadResourcesToPod(this.uploadConfigurations)
    }

    isInitialized(): boolean {
        return [
            super.isInitialized(),
            this.proxy.isInitialized()
        ].every(x => x)
    }
}
