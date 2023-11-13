import {AccessModes} from "@inrupt/solid-client";
import {ClientCredentials} from "../../interfaces";

export type VerificationResult = any // Joachim is sad now :(
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

export interface IActor {
    initialize(): Promise<void>

    isInitialized(): boolean
}

export interface ISolidActor extends IActor {
    webId: string
}

export interface ISolidProxy extends ISolidActor {
    clientCredentials?: ClientCredentials
    controls?: any
    storage?: ISolidPod
    fetch?: typeof fetch
}

interface IDidActor extends IActor {
    did: string
}
