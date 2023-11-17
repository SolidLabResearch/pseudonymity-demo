import {IDocumentLoader} from "../../contexts/interfaces";
import {VerificationResult} from "./interfaces";
import {VerifiablePresentation} from "@digitalcredentials/vc-data-model";
import {deriveProof} from "@mattrglobal/jsonld-signatures-bbs";
import {klona} from "klona";
// @ts-ignore
import jsigs, {purposes} from 'jsonld-signatures';
import {CredentialSubject, VCDIVerifiableCredential} from "@digitalcredentials/vc-data-model/dist/VerifiableCredential";
// @ts-ignore
import credentialsContext from "credentials-context";
import {JsonLdDocument} from "jsonld";

export type VerifiableCredential = VCDIVerifiableCredential

export abstract class GenericVCActor<S,V,D> {
    abstract signSuite?: S
    abstract verifySuite?: V
    abstract deriveSuite?: D
    private documentLoader: IDocumentLoader
    abstract get controllerId(): string
    abstract initializeSuites(): void


    constructor(documentLoader: IDocumentLoader) {
        this.documentLoader = documentLoader;
    }

    get credentialContext(): string[] {
        return [
            'https://www.w3.org/2018/credentials/v1',
            "https://w3id.org/security/bbs/v1",
        ]
    }


    async initialize() {
        this.initializeSuites();
    }

    isInitialized(): boolean{
        return this.signSuite !== undefined
        && this.verifySuite !== undefined
        && this.deriveSuite !== undefined
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

    async deriveCredential(vc: VerifiableCredential, frame: JsonLdDocument): Promise<VerifiableCredential> {
     return deriveProof(
            vc,
            frame,
            {
                suite: this.deriveSuite,
                documentLoader: this.documentLoader,
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
                "https://www.w3.org/2018/credentials/v1",
                'https://w3id.org/security/bbs/v1'
            ],
            type: ['VerifiablePresentation'],
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

}


