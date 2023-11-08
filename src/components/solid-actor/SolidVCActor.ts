import {AbstractSolidActor} from "./AbstractSolidActor";
import {CssProxy} from "../anonymizer/CssProxy";
import {IDocumentLoader} from "../../contexts/interfaces";
import {VerificationResult} from "./interfaces";
import {VerifiableCredential, VerifiablePresentation} from "@digitalcredentials/vc-data-model";
import {logger} from "../../logger";
import {
    AccessModes,
    buildThing,
    createThing, getJsonLdParser,
    getSolidDataset,
    getThing, isThing,
    saveFileInContainer,
    saveSolidDatasetAt,
    setThing, universalAccess
} from "@inrupt/solid-client";
import {_hack_addEnsureContextFunction, generateBls12381Keys, jld2rdf, namespaces, vocabs} from "../../util";
import {Bls12381G1KeyPair} from "@transmute/did-key-bls12381";
import {BbsBlsSignature2020, BbsBlsSignatureProof2020, Bls12381G2KeyPair} from "@mattrglobal/jsonld-signatures-bbs";
import {BlsKeys} from "../interfaces";
import {klona} from "klona";
// @ts-ignore
import jsigs, {purposes} from 'jsonld-signatures';
import {CredentialSubject} from "@digitalcredentials/vc-data-model/dist/VerifiableCredential";
// @ts-ignore
import credentialsContext from "credentials-context";
import assert from "node:assert";
import {stat} from "fs";


export interface UploadConfiguration { // TODO: REFACTOR
    o: object,
    slug: string,
    mimeType: string,
    destContainer: string,
    serialize?: (o: object) => string
    access?: {
        public?: AccessModes
    }
}
export class NotYetImplementedError extends Error { // TODO: REFACTOR
    constructor(props?: string) {
        super("Not Yet Implemented!\n" + props);
    }
}

export class NotInitializedError extends Error { // TODO: REFACTOR
    constructor(props?: string) {
        super("Instance has not yet been Initialized!\n" + props);
    }
}
export class SolidVCActor
    extends AbstractSolidActor
{
    private _didDocument?: object
    private signSuite: any
    private verifySuite: any
    private keys?: BlsKeys // TODO: delete in favor of g2
    private g2?: Bls12381G2KeyPair & { url?: string}
    private seed: string
    private keysContainer: string

    get didDocument(): object {
        return this._didDocument!;
    }

    constructor(proxy: CssProxy, webId: string, documentLoader: IDocumentLoader) {
        super(proxy, webId, documentLoader);
        this.seed = '|'.concat(webId, proxy.clientCredentials.id, proxy.clientCredentials.secret)
        this.keysContainer = webId.replace('card#me', '')
    }

    async initialize(){
        console.log('super.initialize()')
        await super.initialize();
        await this.initializeBls1238G2KeyPair()
        // await this.initializeKeypairsAndDidDocument();
        this.initializeSuites();
    }

    isInitialized(): any {
        return [
            super.isInitialized(),
            // this.keys!!, // TODO: deprecate & delete
            // this.didDocument!!,// TODO: deprecate & delete
            this.g2!!,
        ].every(x => x)
    }

    /**
     * Uploads public BLS12381 G2 Key to Solid WebID Profile Document.
     * TODO: upload private key to some /private/keys container
     * @private
     */
    private async uploadKeysToSolidPod() {
        logger.debug('uploadKeysToSolidPod()')
        // First, make sure that the keys have been initialized)
        if(!this.keys!!) throw Error('this.keys are not initialized.')


        const urlCard = this.webId.replace('#me', '')
        const card = await getSolidDataset(urlCard, {fetch: this.proxy.fetch!})
        const profile = getThing(card, this.webId)

        // Create
        const keyObject = this.keys?.G2!
        // Use key type as name, but lowercase first character
        const keyName = keyObject.type.toLowerCase()[0] + keyObject.type.slice(1)
        const keysThing = buildThing(createThing({name: keyName}))
            .addUrl(vocabs.rdf('type'), vocabs.sec('Bls12381G2Key2020'))
            .addUrl(vocabs.sec('controller'), this.webId)
            .addStringNoLocale(vocabs.sec('publicKeyBase58'), keyObject.publicKey)
            .build()

        let cardUpdate = setThing(card, keysThing)
        const g2Url = `${urlCard}#${keyName}`;
        this.keys!.G2!.url = `${urlCard}#${keyName}`
        const g2Thing = getThing(cardUpdate, g2Url)
        const profileUpdate = setThing(card, buildThing(profile!)
            .addUrl(vocabs.cert('key'), g2Thing?.url!)
            .build())

        await saveSolidDatasetAt(
            urlCard,
            cardUpdate,
            {fetch: this.proxy.fetch!}
        )

        await saveSolidDatasetAt(
            urlCard,
            profileUpdate,
            {fetch: this.proxy.fetch!}
        )
    }

    async addDidDocumentToWebIdProfileDocument() {
        logger.debug('addDidDocumentToSolidWebIdProfileDocument()')
        if (!this.isInitialized())
            throw new Error('SolidVCActor is not yet initialized!')

        const rdf = await jld2rdf(this.didDocument)
        await this.proxy.n3patch(this.webId, undefined, rdf.toString())
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
        await saveFileInContainer(
            urlContainer,
            data,
            {slug, contentType: mimeType, fetch: this.proxy.fetch!}
        )
        const urlFile = new URL(slug, urlContainer).toString()
        if(publicAccess!!) {
            await universalAccess.setPublicAccess(urlFile,
                publicAccess!, {fetch: this.proxy.fetch!})
        }
        return urlFile;
    }

    async initializeBls1238G2KeyPair() {
        this.g2 = await Bls12381G2KeyPair.generate({
            controller: this.webId,
            id: new URL('g2', this.keysContainer).toString(),
            seed: Buffer.from(this.webId)
        })

    }

    checkInitialized() {
        if(!this.isInitialized())
            throw new NotInitializedError()
    }

    /**
     * Adds public export of this.g2 key to Solid Pod.
     */
    async addKeysToSolidPod() {
        this.checkInitialized()
        const exportPublicG2 = (k: Bls12381G2KeyPair) => { // TODO: refactor to utils
            const {id, publicKey, publicKeyJwk, type} = k
            const publicKeyBase58 = "TODO: base58-encode(z, smth, keyvalue)"
            return {
                '@context': ['https://w3id.org/security#'],
                id, type, publicKey, publicKeyJwk, publicKeyBase58
            }
        }

        const uploadConfigurations = [
            {
                o: this.g2!,
                serialize: (o: object) => JSON.stringify(exportPublicG2(o as Bls12381G2KeyPair),null,2),
                destContainer: this.keysContainer,
                slug: 'g2',
                mimeType: 'application/ld+json',
                access: { public: { read: true } as AccessModes }
            } as UploadConfiguration
        ]

        const [uc]  = uploadConfigurations; // TODO: iterate over all upload configurations

        this.g2!.url = await this.addFileToContainer(
            uc.destContainer,
            Buffer.from(uc.serialize!(uc.o)),
            uc.mimeType,
            uc.slug,
            uc.access?.public)
    }
    async linkKeysToWebIdProfileDocument() {
        logger.debug('linkKeysToWebIdProfileDocument()');
        this.checkInitialized()
        if(!this.g2?.url!!)
            throw new Error('G2 keys has not been added to Solid pod yet!');

        const inserts = `<${this.webId}> cert:key <${this.g2!.url!}> .`
        const {cert, foaf} = namespaces
        const prefixes = { cert, foaf }
        await this.proxy.n3patch(this.webId,
            undefined,
            inserts,
            undefined,
            prefixes
        )
    }

    private async initializeKeypairsAndDidDocument() {
        logger.debug('initializeKeypairs()')
        const {didDocument, keys: originalKeys} = await generateBls12381Keys(this.seed)
        this._didDocument = didDocument;
        const keys = Object.fromEntries(originalKeys.map(o => [o.type, o]))

        const G1 = await Bls12381G1KeyPair.from(keys['Bls12381G1Key2020'])
        const G2 = await Bls12381G2KeyPair.from(keys['Bls12381G2Key2020'])
        this.keys = {G1, G2}
        return {
            didDocument,
            keys: this.keys!
        }
    }

    private initializeSuites() {
        console.log('initializeSuites()')
        if(!this.isInitialized())
            throw new Error('SolidVCActor is not yet initialized')
        logger.debug('initializeSuites()')
        this.signSuite = new BbsBlsSignature2020({key: this.g2!})
        this.signSuite = _hack_addEnsureContextFunction(this.signSuite)
        this.verifySuite = [
            new BbsBlsSignature2020(),
            new BbsBlsSignatureProof2020()
        ]
    }

    async signCredential(c: VerifiableCredential,
                         purpose = new purposes.AssertionProofPurpose()): Promise<VerifiableCredential> {
        let vc = await jsigs.sign(
            klona(c), {
                suite: this.signSuite,
                documentLoader: this.documentLoader,
                purpose
            }
        );
        vc.proof.verificationMethod = this.keys!.G2?.url!
        return vc
    }

    async signPresentation(p: VerifiablePresentation,
                           challenge: string,
                           purpose = new purposes.AssertionProofPurpose()
    ): Promise<VerifiablePresentation> {
        return await jsigs.sign(
            klona(p), {
                suite: this.signSuite,
                documentLoader: this.documentLoader,
                purpose,
                challenge
            }
        )
    }

    async verifyCredential(c: VerifiableCredential,
                           purpose = new purposes.AssertionProofPurpose()
    ): Promise<VerificationResult> {
        return await jsigs.verify(
            c,
            {
                suite: this.verifySuite,
                documentLoader: this.documentLoader,
                purpose
            }
        );
    }

    async verifyPresentation(p: VerifiablePresentation): Promise<VerificationResult> {
        throw new Error('Not Yet Implemented')
        return undefined;
    }


    createCredential(credentialSubject: CredentialSubject) : VerifiableCredential{
        return {
            '@context': [
                credentialsContext.CONTEXT_URL_V1,
                'https://w3id.org/security/bbs/v1'
            ],
            issuer: this.webId,
            credentialSubject
        } as VerifiableCredential
    }


}
