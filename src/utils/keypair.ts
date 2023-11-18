import {Bls12381G2KeyPair} from "@mattrglobal/jsonld-signatures-bbs";
import {IKeyPairPublicExport} from "../components/solid-actor/interfaces";
import {namespaces} from "./namespace";
import {IDidDocument, IVerificationMethod} from "../components/solid-actor/did-interfaces";



export function exportPublicG2(k: Bls12381G2KeyPair) {

    const {id, publicKey, publicKeyJwk, type, controller} = k

    return {
        '@context': [
            "https://w3id.org/security/v1",
            namespaces.sec,
            "https://w3id.org/security/suites/jws-2020/v1",
            'https://w3id.org/security/bbs/v1'
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
