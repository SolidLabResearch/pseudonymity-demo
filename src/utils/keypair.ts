import {Bls12381G2KeyPair} from "@mattrglobal/jsonld-signatures-bbs";
import {namespaces} from "./namespace";
import {IDidDocument, IVerificationMethod} from "../interfaces/did";
import {IKeyPairPublicExport} from "../interfaces/keypair";


export function exportPublicG2(k: Bls12381G2KeyPair) {

    const {id, publicKey, publicKeyJwk, type, controller} = k

    return {
        '@context': [
            namespaces.sec_v2
        ],
        id: id!,
        type,
        publicKeyBase58: publicKey, // Bls12381G2KeyPair.publicKey returns the base58 encoded public key
        controller: controller!
    } as IKeyPairPublicExport
}

export function toDidKeyDocument(
    k: Bls12381G2KeyPair
): IDidDocument {

    const id = `did:key:${k.fingerprint()}`
    const vm = {
        id: `${id}#${k.fingerprint()}`,
        controller: id,
        publicKeyBase58: k.publicKey,
        type: 'Bls12381G2Key2020'
        // TODO: publicKeyMultibase?
    } as IVerificationMethod
    return {
        ['@context']: namespaces.did,
        id,
        verificationMethod: [ vm ],
        authentication: [ vm.id ],
        assertionMethod: [ vm.id ],
        capabilityDelegation: [ vm.id ],
        capabilityInvocation: [ vm.id ],
        keyAgreement: []
    } as IDidDocument
}

export function toDidKeyDocumentDirect(
    fingerprint: string,
    publicKey: string
): IDidDocument {
    const id = `did:key:${fingerprint}`
    const vm = {
        id: `${id}#${fingerprint}`,
        controller: id,
        publicKeyBase58: publicKey,
        type: 'Bls12381G2Key2020'
        // TODO: publicKeyMultibase?
    } as IVerificationMethod
    return {
        ['@context']: namespaces.did,
        id,
        verificationMethod: [ vm ],
        authentication: [ vm.id ],
        assertionMethod: [ vm.id ],
        capabilityDelegation: [ vm.id ],
        capabilityInvocation: [ vm.id ],
        keyAgreement: []
    } as IDidDocument
}
