import {AbstractSolidActor} from "./AbstractSolidActor";
import {CssProxy} from "../anonymizer/CssProxy";
import {IDocumentLoader} from "../../contexts/interfaces";
import {VerificationResult} from "./interfaces";
import {VerifiableCredential, VerifiablePresentation} from "@digitalcredentials/vc-data-model";
import {logger} from "../../logger";
import {
    buildThing,
    createThing,
    getSolidDataset,
    getThing, isThing,
    saveFileInContainer,
    saveSolidDatasetAt,
    setThing, universalAccess
} from "@inrupt/solid-client";
import {_hack_addEnsureContextFunction, generateBls12381Keys, vocabs} from "../../util";
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
import jsonld from 'jsonld'

export class SolidVCActor
    extends AbstractSolidActor
{
    private _didDocument: any
    private signSuite: any
    private verifySuite: any
    private keys?: BlsKeys
    private seed: string


    get didDocument(): any {
        return this._didDocument;
    }

    constructor(proxy: CssProxy, webId: string, documentLoader: IDocumentLoader) {
        super(proxy, webId, documentLoader);
        this.seed = '|'.concat(webId, proxy.clientCredentials.id, proxy.clientCredentials.secret)
    }

    async initialize(): Promise<this> {
        await super.initialize();
        await this.initializeKeypairsAndDidDocument();
        await this.uploadKeysToSolidPod()
        // await this.uploadDidDocumentToPod()
        logger.info('DEV: uploadDidDocumentToPod() currently disabled')
        await this.initializeSuites();
        await this.addDidDocumentToSolidWebIdProfileDocument()

        return this;
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

    private async addDidDocumentToSolidWebIdProfileDocument() {
        if(!this.didDocument!!) throw Error('this.didDocument is not initialized.')

        const serializedRDF = (await jsonld.toRDF(this.didDocument!, {format: "application/n-quads",})).toString()

        const urlCard = this.webId.replace('#me', '')

        await this.proxy.n3patch(urlCard,
            undefined,
            serializedRDF,
            undefined,
        )
    }

    private async uploadDidDocumentToPod() {
        logger.debug('uploadDidDocumentToPod()')
        // First, make sure that the DID Document has been initialized
        if(!this.didDocument!!) throw Error('this.didDocument is not initialized.')
        const urlProfileDir = this.webId.replace('card#me', '')

        const data = Buffer.from(JSON.stringify(this.didDocument!,null, 2))
        const mimeType = "application/did+ld+json"
        const filename = 'did.json'


        await saveFileInContainer(
            urlProfileDir,
            data,
            {slug: filename, contentType: mimeType, fetch: this.proxy.fetch!}
        )

        const urlFile = `${urlProfileDir}${filename}`
        const updatedAccess = await universalAccess.setPublicAccess(urlFile,  {read: true, write: false}, {fetch: this.proxy.fetch!})

        assert(updatedAccess!.read)
    }

    private async initializeKeypairsAndDidDocument() {
        logger.debug('initializeKeypairs()')
        const {didDocument, keys: originalKeys} = await generateBls12381Keys(this.seed)

        // this.originalKeys = originalKeys; // TODO delete originalKeys property
        this._didDocument = didDocument;
        const keys = Object.fromEntries(originalKeys.map(o => [o.type, o]))

        this.keys = {
            G1: await Bls12381G1KeyPair.from(keys['Bls12381G1Key2020']),
            G2: await Bls12381G2KeyPair.from(keys['Bls12381G2Key2020'])
        }
    }

    private initializeSuites() {
        logger.debug('initializeSuites()')
        this.signSuite = new BbsBlsSignature2020({key: this.keys!.G2})
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
