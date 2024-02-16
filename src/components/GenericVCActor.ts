import {VerifiablePresentation} from "@digitalcredentials/vc-data-model";
import {deriveProof} from "@mattrglobal/jsonld-signatures-bbs";
import {klona} from "klona";
// @ts-ignore
import jsigs, {purposes} from 'jsonld-signatures';
import {CredentialSubject, VCDIVerifiableCredential} from "@digitalcredentials/vc-data-model/dist/VerifiableCredential";
// @ts-ignore
import credentialsContext from "credentials-context";
import {JsonLdDocument} from "jsonld";
import {IDocumentLoader} from "../interfaces";
import {ICredentialActor} from "../interfaces/did";
import {VerificationResult} from "../interfaces/credentials";

export type VerifiableCredential = VCDIVerifiableCredential

export abstract class GenericVCActor<S,V,D> implements ICredentialActor {
    signSuite: S
    verifySuite: V
    deriveSuite: D
    private documentLoader: IDocumentLoader

    abstract get identifier(): string

    constructor(documentLoader: IDocumentLoader,
                signSuite: S,
                verifySuite: V,
                deriveSuite: D
    ) {
        this.documentLoader = documentLoader;
        this.signSuite = signSuite;
        this.verifySuite = verifySuite;
        this.deriveSuite = deriveSuite;
    }

    get credentialContext(): string[] {

        // TODO: clean up
        const option01 = [
            'https://www.w3.org/2018/credentials/v1',
            "https://w3id.org/security/bbs/v1",
        ]

        const option02 = [

            'https://www.w3.org/ns/credentials/v2' // 21/11/2023 - jsigs unable to match proofs
        ]
        return [
            ...option01
        ]
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
            issuer: this.identifier,
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
                ...this.credentialContext,
                // 'https://w3id.org/security/bbs/v1'
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


