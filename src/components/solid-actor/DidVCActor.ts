import {BbsBlsSignature2020, BbsBlsSignatureProof2020, Bls12381G2KeyPair} from "@mattrglobal/jsonld-signatures-bbs";
import {KeyPairActor} from "./KeyPairActor";
import {IDocumentLoader} from "../../contexts/interfaces";
import {_hack_addEnsureContextFunction} from "../../utils/cryptosuite";
import {GenericVCActor} from "./GenericVCActor";
import {ICredentialActor, ISolidActor, UploadConfiguration} from "./interfaces";
import {CssProxy} from "./CssProxy";
import {AccessModes} from "@inrupt/solid-client";
import {IDidDocument} from "./did-interfaces";
import {exportPublicG2, toDidKeyDocument} from "../../utils/keypair";
import {logger} from "../../logger";
import path from "path";


export abstract class AbstractBls12381G2VCActor
    extends GenericVCActor<BbsBlsSignature2020, BbsBlsSignature2020, BbsBlsSignatureProof2020>
    implements ICredentialActor, KeyPairActor<Bls12381G2KeyPair> {
    signSuite?: BbsBlsSignature2020 | undefined;
    verifySuite?: BbsBlsSignature2020 | undefined;
    deriveSuite?: BbsBlsSignatureProof2020 | undefined;
    key: Bls12381G2KeyPair;


    constructor(key: Bls12381G2KeyPair, documentLoader: IDocumentLoader) {
        super(documentLoader);
        this.key = key;

    }

    abstract get identifier(): string

    abstract get controllerDocument(): IDidDocument

    get controllerDocumentContext(): string[] {
        return ['https://www.w3.org/ns/did/v1']
    }
    get controllerId(): string {
        return this.identifier
    }

    initializeSuites(): void {
        this.signSuite = new BbsBlsSignature2020({key: this.key})
        this.signSuite = _hack_addEnsureContextFunction(this.signSuite)
        this.verifySuite = new BbsBlsSignature2020()
        this.deriveSuite = new BbsBlsSignatureProof2020()
    }
}

export class DidVCActor extends AbstractBls12381G2VCActor {
    get identifier(): string {
        return `did:key:${this.key!.fingerprint()}`
    }

    get controllerDocument(): IDidDocument {
        return toDidKeyDocument(this.key!)
    }

}

export class SolidVCActorV2
    extends AbstractBls12381G2VCActor
    implements ISolidActor
{
    webId: string;
    keyName: string
    proxy: CssProxy
    _controllerContainer: string
    _controllerId: string
    uploadConfigurations: UploadConfiguration[]

    constructor(key: Bls12381G2KeyPair, keyName:string, documentLoader: IDocumentLoader, proxy: CssProxy) {
        super(key, documentLoader);
        this.webId = proxy.webId;
        this.proxy = proxy;
        this.keyName = keyName
        this._controllerContainer = this.webId.replace('profile/card#me', 'dids/')
        this._controllerId = path.join(this.controllerContainer,'controller')
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
