import {CssProxy} from "./CssProxy";
import {Bls12381G2KeyPair} from "@mattrglobal/jsonld-signatures-bbs";
import {IDocumentLoader} from "../../contexts/interfaces";
import path from "path";
import {AccessModes, addNamedNode, setThing} from "@inrupt/solid-client";
import {IDidDocument, IVerificationMethod} from "./did-interfaces";
import {exportPublicG2} from "../../utils/keypair";
import {logger} from "../../logger";
import {joinUrlPaths} from "../../utils/url";
import {AbstractBls12381G2VCActor} from "./AbstractBls12381G2VCActor";
import {Vocab, vocabs} from "../../utils/namespace";
import {NamedNode} from "n3";
import {ISolidActor, ISolidProxy, UploadConfiguration} from "../interfaces";

export class SolidVCActor
    extends AbstractBls12381G2VCActor
    implements ISolidActor {
    webId: string;
    keyName: string
    proxy: ISolidProxy
    _controllerContainer: string
    _controllerId: string
    uploadConfigurations: UploadConfiguration[]

    constructor(key: Bls12381G2KeyPair, keyName: string, documentLoader: IDocumentLoader, proxy: ISolidProxy) {
        super(key, documentLoader);
        this.webId = proxy.webId;
        this.proxy = proxy;
        this.keyName = keyName
        this._controllerContainer = this.webId.replace('#me','')
        this._controllerId = this.webId

        // this._controllerContainer = this.webId.replace('profile/card#me', 'dids/')
        // this._controllerId = joinUrlPaths(this.controllerContainer, 'controller')
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

    async addControllerDocumentToWebIdProfileDocument() {

        let card = await this.proxy.getCard()
        const keyIri = this.webId.replace('#me', '#key')

        const secv0 = Vocab('https://w3id.org/security#')
        const secv2 = vocabs.sec
        const sec = secv0 // TODO: CLEAN UP
        const [vm] = this.controllerDocument.verificationMethod as IVerificationMethod[]
        const vmThing = this.proxy.getThingBuilder('key')
            .addIri(sec('controller'), this.webId)
            // TODO;: REMINDER: vocabs.sec uses security/v2 namespace! Keep this in mind when verification fails
            .addIri(vocabs.rdf('type'), sec('Bls12381G2Key2020'))
            .addStringNoLocale(sec('publicKeyBase58'), vm.publicKeyBase58!)
            .build()

        // Update card with vm thing
        card = setThing(card, vmThing)
        await this.proxy.updateCard(card)

        // Add verificationMethod & assertionMethod
        const pb = await this.proxy.getProfileBuilder()

        const profileUpdateThing = pb
            .addNamedNode(sec('verificationMethod'),{value: keyIri} as NamedNode)
            .addNamedNode(sec('assertionMethod'),{value: keyIri} as NamedNode)
            .build()

        card = await this.proxy.getCard()
        card = setThing(card, profileUpdateThing)

        await this.proxy.updateCard(card)
    }


    async initialize(): Promise<void> {
        await super.initialize();
        await this.proxy.initialize()
        await this.uploadResourcesToPod(this.uploadConfigurations)
        await this.addControllerDocumentToWebIdProfileDocument()
    }

    isInitialized(): boolean {
        return [
            super.isInitialized(),
            this.proxy.isInitialized()
        ].every(x => x)
    }
}
