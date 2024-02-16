import {CredentialSubject, VCDIVerifiableCredential} from "@digitalcredentials/vc-data-model/dist/VerifiableCredential";
import {VerifiablePresentation} from "@digitalcredentials/vc-data-model";
import {JsonLdDocument} from "jsonld";

export type VerificationResult = any // Joachim is sad now :(
export type VerifiableCredential = VCDIVerifiableCredential

export interface ICredentialCreator {
    identifier: string
    credentialContext: string | string[]

    createCredential(credentialSubject: CredentialSubject): VerifiableCredential

    createPresentation(credentials: VerifiableCredential[], holder: undefined | string): VerifiablePresentation
}

export interface IVerifier {
    verifySuite?: any

    verifyCredential(c: VerifiableCredential, purpose?: any): Promise<VerificationResult>

    verifyPresentation(vp: VerifiablePresentation,
                       challenge: string,
                       purpose?: any
    ): Promise<VerificationResult>
}

export interface ISigner {
    signSuite?: any

    signCredential(c: VerifiableCredential, purpose?: any): Promise<VerifiableCredential>

    signPresentation(p: VerifiablePresentation,
                     challenge: string,
                     purpose?: any): Promise<VerifiablePresentation>
}

export interface IDeriver {
    deriveCredential(vc: VerifiableCredential, frame: JsonLdDocument): Promise<VerifiableCredential>
}
