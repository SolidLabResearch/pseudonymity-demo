import {Bls12381G2KeyPair} from "@mattrglobal/jsonld-signatures-bbs";
import {IKeyPairPublicExport} from "../components/solid-actor/interfaces";
import * as bls12381 from "@transmute/did-key-bls12381";
import {namespaces} from "./namespace";

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
        // publicKey,
        publicKeyJwk,
        // Bls12381G2KeyPair.publicKey returns the base58 encoded public key
        publicKeyBase58: publicKey,
        controller: controller!
    } as IKeyPairPublicExport
}

export async function generateBls12381Keys(seed: string) {
    return await bls12381.generate({secureRandom: () => Buffer.from(seed)}, {accept: 'application/did+ld+json'})
}
