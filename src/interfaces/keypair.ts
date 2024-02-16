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
