import {Bls12381G2KeyPair} from "@mattrglobal/jsonld-signatures-bbs";
import {VerifiablePresentation} from "@digitalcredentials/vc-data-model";
import {AccessModes, SolidDataset, ThingBuilder} from "@inrupt/solid-client";
import {DocumentLoaderCacheOptions} from "../contexts/contexts";
import {CredentialSubject, VCDIVerifiableCredential} from "@digitalcredentials/vc-data-model/dist/VerifiableCredential";
import {JsonLdDocument} from "jsonld";
import {ClientCredentials} from "../interfaces";

export interface BlsKeys {
    G2?: Bls12381G2KeyPair & { url?: string }
}

export type VerificationResult = any // Joachim is sad now :(
/**
 * Upload configurations allow to define different parameters
 * for uploading objects to a Solid Pod.
 */
export interface UploadConfiguration {
    o: () => object,
    slug: string,
    mimeType: string,
    destContainer: string,
    serialize?: (o: object) => Promise<string>
    access?: {
        public?: AccessModes
    },
    description?: string
}

export interface IKeyPairBase {
    '@context': string | string[]
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

export interface ISolidPod {

}

export interface IActorMetadata {
    className?: string
    tag?: string
    role?: string
    documentLoaderCacheOptions?: DocumentLoaderCacheOptions
}

export interface IActor extends IActorMetadata {}

export interface Initializable {
    initialize(): Promise<void>
}

export interface ISolidActor extends IActor {
    webId: string
}

export interface ISolidProxy
    extends
        ISolidActor,
        Initializable {
    clientCredentials?: ClientCredentials
    controls?: any
    storage?: ISolidPod
    fetch?: typeof fetch

    // initialize(): Promise<void>/**/

    get cardUrl(): string

    get podUrl(): string

    addFileToContainer(
        urlContainer: string,
        data: Buffer,
        mimeType: string,
        slug: string,
        publicAccess?: AccessModes
    ): Promise<any>

    getThingBuilder(name: string): ThingBuilder<any>

    getProfileBuilder(): Promise<ThingBuilder<any>>

    getCard(): Promise<SolidDataset>

    updateCard(cardUpdate: SolidDataset): Promise<void>
}

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

export interface ICredentialActor extends IActor,
    IActorMetadata,
    ICredentialCreator,
    ISigner,
    IVerifier,
    IDeriver {
}

/**
 * https://www.w3.org/TR/did-core/#verification-method-properties
 */
export interface IVerificationMethod {
    id: string
    controller: string
    type: string
    publicKeyJwk?: object
    publicKeyMultibase?: string
    publicKeyBase58?: string
}

export interface IServiceEndpoint {
    id: string
    type: string | string[]
    serviceEndpoint: string | string[]
}

/**
 * https://www.w3.org/TR/did-core/#did-document-properties
 */
export interface IDidDocument {
    '@context': string | string[]
    id: string
    alsoKnownAs?: string | string[]
    controller?: string | string[]

    // Verification Methods
    verificationMethod?: (IVerificationMethod | string)[]
    authentication?: (IVerificationMethod | string)[]
    assertionMethod?: (IVerificationMethod | string)[]
    keyAgreement?: (IVerificationMethod | string)[]
    capabilityInvocation?: (IVerificationMethod | string)[]
    capabilityDelegation?: (IVerificationMethod | string)[]

    service?: (IServiceEndpoint | string)[]
}
