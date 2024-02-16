import {AccessModes, SolidDataset, ThingBuilder} from "@inrupt/solid-client";
import {DocumentLoaderCacheOptions} from "../contexts/contexts";
import {ClientCredentials} from "../interfaces";

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

export interface ISolidPod {}

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

