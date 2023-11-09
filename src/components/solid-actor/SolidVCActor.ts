import {AbstractSolidActor} from "./AbstractSolidActor";
import {CssProxy} from "../anonymizer/CssProxy";
import {IDocumentLoader} from "../../contexts/interfaces";
import {VerificationResult} from "./interfaces";
import {VerifiableCredential, VerifiablePresentation} from "@digitalcredentials/vc-data-model";
import {logger} from "../../logger";
import {
    AccessModes,
    buildThing, createContainerAt, createSolidDataset,
    createThing, deleteContainer, deleteFile, deleteSolidDataset, getJsonLdParser, getResourceInfo,
    getSolidDataset,
    getThing, isContainer, isThing, overwriteFile,
    saveFileInContainer,
    saveSolidDatasetAt, saveSolidDatasetInContainer,
    setThing, SolidDataset, universalAccess, UrlString, WithResourceInfo, WithServerResourceInfo
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
import {fetch} from "@inrupt/universal-fetch";
import assert from "node:assert";
import {ctx} from "../../contexts/contexts";

export interface IKeyPairBase {
    '@context' : string|string[]
    id: string
    type: string
    controller: string
}

export interface IKeyPairPublicExport extends IKeyPairBase {
    publicKey?: string
    publicKeyJwk?: {
        x?: string,
        kty?: string,
        crv?: string,
    }
    /**
     * Note: The publicKeyBase58 property is deprecated.
     * New cryptography suite creators and developers are advised to use the publicKeyMultibase property for encoding public key parameters.
     * https://w3c-ccg.github.io/security-vocab/#publicKeyBase58
     */
    publicKeyBase58?: string
}

// https://w3c-ccg.github.io/security-vocab/#Bls12381G2Key2020
// id, type, controller, publicKeyBase58

const exportPublicG2 = (k: Bls12381G2KeyPair) => { // TODO: refactor to utils

    const {id, publicKey, publicKeyJwk, type, controller} = k

    return {
        '@context': [
            "https://w3id.org/security/v1",
            namespaces.sec,
            "https://w3id.org/security/suites/jws-2020/v1",
            'https://w3id.org/security/bbs/v1'
        ],
        id: id!,
        type,
        publicKey,
        publicKeyJwk,
        // Bls12381G2KeyPair.publicKey returns the base58 encoded public key
        publicKeyBase58: publicKey,
        controller: controller!
    }  as IKeyPairPublicExport
}

/**
 * Upload configurations allow to define different parameters
 * for uploading objects to a Solid Pod.
 */
export interface UploadConfiguration { // TODO: REFACTOR
    o: () => object,
    slug: string,
    mimeType: string,
    destContainer: string,
    serialize?: (o: object) => Promise<string>
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
    g2?: Bls12381G2KeyPair & { url?: string}
    private seed: string
    private keysDatasetUrl: string
    private keysDataset?: SolidDataset
    uploadConfigurations: UploadConfiguration[]

    get didDocument(): object {
        return this._didDocument!;
    }

    constructor(proxy: CssProxy, webId: string, documentLoader: IDocumentLoader) {
        super(proxy, webId, documentLoader);

        this.seed = '|'.concat(webId, proxy.clientCredentials.id, proxy.clientCredentials.secret)

        this.keysDatasetUrl = webId.replace('card#me', 'keys')

        this.uploadConfigurations = [
            {
                o: () => this.g2,
                serialize:async (o: object) => {
                    let xp = exportPublicG2(o as Bls12381G2KeyPair)
                    const nquads = await jld2rdf(xp)
                    return nquads.toString()
                },
                destContainer: this.keysDatasetUrl,
                slug: '#key-g2',

                mimeType: 'text/turtle',
                access: { public: { read: true } as AccessModes }
            } as UploadConfiguration
        ]

    }

    async initialize(){
        console.log('super.initialize()')
        await super.initialize();
        await this.initializeBls1238G2KeyPair()
        await this.initializeKeysContainer()
        // await this.initializeKeypairsAndDidDocument();
        this.initializeSuites();

    }

    /**
     * TODO: rename to initializeKeysDataset?
     */
    async initializeKeysContainer() {
        logger.debug('initializeKeyContainer()')
        // Create, or get existing, container dataset
        const {status, statusText} = await this.proxy.fetch!(this.keysDatasetUrl)

        this.keysDataset =
            status === 404 ?
                await saveSolidDatasetAt(this.keysDatasetUrl, createSolidDataset(),{fetch: this.proxy.fetch!})
                : await getSolidDataset(this.keysDatasetUrl,{fetch: this.proxy.fetch!})

        // Set public access
        const meta = await getResourceInfo(this.keysDatasetUrl,{fetch: this.proxy.fetch!})
        await universalAccess.setPublicAccess(
            meta.internal_resourceInfo.sourceIri,
            {read: true} as AccessModes,
            {fetch: this.proxy.fetch!}
        )
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
        // First, make sure that the keys have been initialized
        if(!this.keys!!) throw Error('Keys are not initialized.')
        // Second, make sure that the keys data set has been initialized
        if(!this.keysDataset!!) throw Error('Keys dataset is not initialized.')
        //
        // const urlCard = this.webId.replace('#me', '')
        // const card = await getSolidDataset(urlCard, {fetch: this.proxy.fetch!})
        // const profile = getThing(card, this.webId)
        //
        // // Create
        // const keyObject = this.keys?.G2!
        // // Use key type as name, but lowercase first character
        // const keyName = keyObject.type.toLowerCase()[0] + keyObject.type.slice(1)
        // const keysThing = buildThing(createThing({name: keyName}))
        //     .addUrl(vocabs.rdf('type'), vocabs.sec('Bls12381G2Key2020'))
        //     .addUrl(vocabs.sec('controller'), this.webId)
        //     .addStringNoLocale(vocabs.sec('publicKeyBase58'), keyObject.publicKey)
        //     .build()
        //
        // let cardUpdate = setThing(card, keysThing)
        // const g2Url = `${urlCard}#${keyName}`;
        // this.keys!.G2!.url = `${urlCard}#${keyName}`
        // const g2Thing = getThing(cardUpdate, g2Url)
        // const profileUpdate = setThing(card, buildThing(profile!)
        //     .addUrl(vocabs.cert('key'), g2Thing?.url!)
        //     .build())
        //
        // await saveSolidDatasetAt(
        //     urlCard,
        //     cardUpdate,
        //     {fetch: this.proxy.fetch!}
        // )
        //
        // await saveSolidDatasetAt(
        //     urlCard,
        //     profileUpdate,
        //     {fetch: this.proxy.fetch!}
        // )
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



        const file = new Blob([data])
        const fileUrl =new URL(slug, urlContainer).toString() as UrlString

        // Option 1: using overwriteFile
        const result = await overwriteFile(
            fileUrl,
            file,
            {contentType: mimeType, fetch: this.proxy.fetch!}
        )

        // Option 2: using saveFileInContainer
        // const result = await saveFileInContainer(
        //     urlContainer,
        //     file,
        //     { slug: slug, contentType: mimeType,fetch: this.proxy.fetch! }
        // )

        const serverResourceInformation = await getResourceInfo(fileUrl, {fetch: this.proxy.fetch!})
        if(publicAccess!!) {
            await universalAccess.setPublicAccess(serverResourceInformation.internal_resourceInfo.sourceIri, publicAccess!, {fetch: this.proxy.fetch!})
        }
        return serverResourceInformation.internal_resourceInfo.sourceIri

    }

    async initializeBls1238G2KeyPair() {
        logger.debug('initializeBls1238G2KeyPair()')
        const uc = this.uploadConfigurations.find(uc => uc.o() === this.g2)

        if(!uc!!)
            throw new Error('Cannot find UploadConfiguration')

        this.g2 = await Bls12381G2KeyPair.generate({
            controller: this.webId,
            id: new URL(uc!.slug, uc!.destContainer).toString(),
            seed: Uint8Array.from(Buffer.from(this.webId))
        })

        const g2PublicExport = exportPublicG2(this.g2!)


        { // TEMP WORK AROUND: REGISTER THIS ACTOR'S G2 KEY WITH CTX
            const k = this.g2!.id
            const v = g2PublicExport
            ctx.set(k, v)
            console.log({
                ctxRegistration: {
                    url: k,
                    document: v
                }
            })
        }

        { // TEMP WORK AROUND: REGISTER THIS ACTOR'S CONTROLLER DOC
            const k = this.webId
            const v = {
                '@context': [
                    namespaces.sec,
                    namespaces.did
                ],
                'id': this.webId,
                'assertionMethod': [
                    this.g2!.id
                ]
            }
            ctx.set(k, v)
            console.log({
                ctxRegistration: {
                    url: k,
                    document: JSON.stringify(v, null,2)
                }
            })
        }

        //
        //
        // console.log({ // TODO: delete :)
        //     webId: this.webId,
        //     g2: {
        //         id: this.g2.id,
        //         url: this.g2.url,
        //         controller: this.g2.controller,
        //         fingerprint: this.g2.fingerprint(),
        //         publicKey: this.g2.publicKey,
        //         publicKeyJwk: this.g2.publicKeyJwk,
        //         privateKey: this.g2.privateKey,
        //         privateKeyJwk: this.g2.privateKeyJwk
        //     }
        // })

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

        // TODO: iterate over all upload configurations
        const [uc]  = this.uploadConfigurations;
        assert(this.uploadConfigurations.length === 1) // TODO: remove when all configurations are processed


        // Remove existing resources // TODO: remove block for removing existing resources
        // const probeUrl = (new URL(uc.slug, this.keysDatasetUrl)).toString()
        // const {status, statusText} = await this.proxy.fetch!(probeUrl)
        // console.log({status, statusText, probeUrl})
        // if(status === 200) {
        //     logger.debug(`${probeUrl} already exists! Deleting...`)
        //     await deleteSolidDataset(probeUrl,{fetch: this.proxy!.fetch!})
        // }


        logger.debug(`Adding file ${uc.slug} to ${uc.destContainer}`)
        const ser = await uc.serialize!(uc.o());
        console.log({ser, ct: uc.mimeType})
        this.g2!.url = await this.addFileToContainer(
            uc.destContainer,
            Buffer.from(ser),
            uc.mimeType,
            uc.slug,
            uc.access?.public)
        logger.debug(`Added file ${uc.slug} to ${uc.destContainer}`)
    }
    async linkKeysToWebIdProfileDocument() {
        logger.debug('linkKeysToWebIdProfileDocument()');
        this.checkInitialized()
        if(!this.g2?.url!!)
            throw new Error('G2 keys has not been added to Solid pod yet!');

        const cardUrl = this.webId.replace('#me','');
        const card = await getSolidDataset(cardUrl, {fetch: this.proxy.fetch!})
        const me = getThing(card, this.webId)!
        const ucg2 = this.uploadConfigurations.find(uc => uc.o() == this.g2!)!
        const g2Url = ucg2.destContainer + ucg2.slug
        console.log({
            linkingTo: g2Url
        })
        const meUpdate = setThing(
            card,
            buildThing(me)
                .removeAll(vocabs.cert('key'))
                .addUrl(vocabs.cert('key'),g2Url)
                .removeAll(vocabs.sec('assertionMethod'))
                .addUrl(vocabs.sec('assertionMethod'),g2Url)
                .build()
        )


        await saveSolidDatasetAt(
            cardUrl,
            meUpdate,
            {fetch: this.proxy.fetch!}
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
        this.verifySuite = new BbsBlsSignature2020()
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
            type: ['VerifiableCredential'],
            issuer: this.webId,
            credentialSubject
        } as VerifiableCredential
    }


}
