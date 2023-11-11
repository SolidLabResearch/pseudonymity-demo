import {CssProxy} from "../anonymizer/CssProxy";
import {IDocumentLoader} from "../../contexts/interfaces";
import {VerificationResult} from "./interfaces";
import {VerifiablePresentation} from "@digitalcredentials/vc-data-model";
import {logger} from "../../logger";
import {BbsBlsSignature2020} from "@mattrglobal/jsonld-signatures-bbs";
import {klona} from "klona";
// @ts-ignore
import jsigs, {purposes} from 'jsonld-signatures';
import {CredentialSubject, VCDIVerifiableCredential} from "@digitalcredentials/vc-data-model/dist/VerifiableCredential";
// @ts-ignore
import credentialsContext from "credentials-context";
import {_hack_addEnsureContextFunction} from "../../utils/cryptosuite";
import {SolidDidActor} from "./SolidDidActor";

export type VerifiableCredential = VCDIVerifiableCredential

export class SolidVCActor extends SolidDidActor {
    private signSuite: any
    private verifySuite: any

    constructor(proxy: CssProxy, webId: string, documentLoader: IDocumentLoader) {
        super(proxy, webId, documentLoader);
    }

    get credentialContext(): string[] {
        return [
            credentialsContext.CONTEXT_URL_V1,
            'https://w3id.org/security/bbs/v1'
        ]
    }

    /**
     * SolidVCActor is considered initialized when its sign & verify suites are.
     */
    async initialize() {
        console.log('super.initialize()')
        await super.initialize();
        this.initializeSuites();
    }

    isInitialized(): any {
        return super.isInitialized()
            && this.signSuite!!
            && this.verifySuite!!
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

    /**
     * TODO: ability to extend VP types (e.g. CredentialManagerPresentation)
     * @param credentials
     * @param holder
     */
    createPresentation(
        credentials: VerifiableCredential[],
        holder: undefined|string = undefined
    ): VerifiablePresentation {
        return {
            '@context': [
                'https://w3id.org/security/bbs/v1'
            ],
            type: ['VerifiablePresentation'],
            issuer: this.controllerId,
            holder,
            verifiableCredential: credentials
        } as VerifiablePresentation
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

    async verifyPresentation(vp: VerifiablePresentation,
                             challenge: string,
                             purpose = new purposes.AssertionProofPurpose()
    ): Promise<VerificationResult> {
        return await jsigs.verify(
            vp,
            {
                suite: this.verifySuite,
                documentLoader: this.documentLoader,
                challenge,
                purpose
            }
        );
    }

    private initializeSuites() {
        logger.debug('initializeSuites()')
        this.signSuite = new BbsBlsSignature2020({key: this.g2!})
        this.signSuite = _hack_addEnsureContextFunction(this.signSuite)
        this.verifySuite = new BbsBlsSignature2020()
    }
}
