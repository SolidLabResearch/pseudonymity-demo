import {AbstractSolidActor} from "./AbstractSolidActor";
import {CssProxy} from "../anonymizer/CssProxy";
import {IDocumentLoader} from "../../contexts/interfaces";
import {UploadConfiguration, VerificationResult} from "./interfaces";
import {VerifiableCredential, VerifiablePresentation} from "@digitalcredentials/vc-data-model";
import {logger} from "../../logger";
import {AccessModes, getResourceInfo, overwriteFile, universalAccess, UrlString} from "@inrupt/solid-client";
import {BbsBlsSignature2020, Bls12381G2KeyPair} from "@mattrglobal/jsonld-signatures-bbs";
import {klona} from "klona";
// @ts-ignore
import jsigs, {purposes} from 'jsonld-signatures';
import {CredentialSubject} from "@digitalcredentials/vc-data-model/dist/VerifiableCredential";
// @ts-ignore
import credentialsContext from "credentials-context";
import path from "path";
import {IDidDocument} from "./did-interfaces";
import {NotInitializedError} from "./errors";
import {exportPublicG2} from "../../utils/keypair";
import {_hack_addEnsureContextFunction} from "../../utils/cryptosuite";


export class SolidVCActor
    extends AbstractSolidActor {
    g2?: Bls12381G2KeyPair & { url?: string }
    uploadConfigurations: UploadConfiguration[]
    private signSuite: any
    private verifySuite: any
    private seed: string
    private a: string = "ok"

    constructor(proxy: CssProxy, webId: string, documentLoader: IDocumentLoader) {
        super(proxy, webId, documentLoader);

        this.seed = '|'.concat(webId, proxy.clientCredentials.id, proxy.clientCredentials.secret)

        this.uploadConfigurations = [
            {
                o: () => this.g2,
                serialize: async (o: object) => {
                    let xp = exportPublicG2(o as Bls12381G2KeyPair)
                    return JSON.stringify(xp, null, 2)
                },
                // destContainer: this.keysDatasetUrl,
                destContainer: this.controllerId,
                slug: '#key-g2',

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

    /**
     * Refs
     * https://www.w3.org/TR/did-core/#did-document-properties
     */
    get controllerDocument(): IDidDocument {
        return {
            '@context': [
                // NOTE: context: https://w3id.org/security/v2 -> VC VERIFIED: TRUE
                // NOTE: context: https://www.w3.org/ns/did/v1 -> VC VERIFIED: TRUE
                // 'https://w3id.org/security/v2',
                'https://www.w3.org/ns/did/v1'

            ],
            'id': this.controllerId,
            alsoKnownAs: this.webId,
            verificationMethod: [exportPublicG2(this.g2!)],
            assertionMethod: [this.g2?.id!]
        }
    }

    get credentialContext(): string[] {
        return [
            credentialsContext.CONTEXT_URL_V1,
            'https://w3id.org/security/bbs/v1'
        ]
    }

    async initialize() {
        console.log('super.initialize()')
        await super.initialize();
        await this.initializeBls1238G2KeyPair()
        await this.uploadResourcesToPod()
        this.initializeSuites();
    }

    isInitialized(): any {
        return [
            super.isInitialized(),
            this.g2!!,
        ].every(x => x)
    }

    checkInitialized() {
        if (!this.isInitialized())
            throw new NotInitializedError()
    }

    createCredential(credentialSubject: CredentialSubject): VerifiableCredential {
        return {
            '@context': this.credentialContext,
            type: ['VerifiableCredential'],
            issuer: this.controllerId,
            credentialSubject
        } as VerifiableCredential
    }

    async signCredential(c: VerifiableCredential,
                         purpose = new purposes.AssertionProofPurpose()): Promise<VerifiableCredential> {
        return await jsigs.sign(
            klona(c), {
                suite: this.signSuite,
                documentLoader: this.documentLoader,
                purpose
            }
        )
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

    private async initializeBls1238G2KeyPair() {
        logger.debug('initializeBls1238G2KeyPair()')

        // TODO: improve this weird block
        const uc = this.uploadConfigurations.find(uc => uc.o() === this.g2)

        if (!uc!!)
            throw new Error('Cannot find UploadConfiguration')

        this.g2 = await Bls12381G2KeyPair.generate({
            controller: this.controllerId,
            id: new URL(uc!.slug, uc!.destContainer).toString(),
            seed: Uint8Array.from(Buffer.from(this.seed))
        })

    }

    /**
     * Adds public export of this.g2 key to Solid Pod.
     */
    private async uploadResourcesToPod() {
        logger.debug('uploadResourcesToPod()')
        this.checkInitialized()

        for await (const uc of this.uploadConfigurations) {
            const ser = await uc.serialize!(uc.o());
            console.log({ser, ct: uc.mimeType})
            this.g2!.url = await this.proxy.addFileToContainer(
                uc.destContainer,
                Buffer.from(ser),
                uc.mimeType,
                uc.slug,
                uc.access?.public)
            logger.debug(`Added file ${uc.slug} to ${uc.destContainer}`)
        }

    }

    private initializeSuites() {
        console.log('initializeSuites()')
        if (!this.isInitialized())
            throw new Error('SolidVCActor is not yet initialized')
        logger.debug('initializeSuites()')
        this.signSuite = new BbsBlsSignature2020({key: this.g2!})
        this.signSuite = _hack_addEnsureContextFunction(this.signSuite)
        this.verifySuite = new BbsBlsSignature2020()
    }


}
