import {Bls12381G1KeyPair} from "@transmute/did-key-bls12381";
import {Bls12381G2KeyPair} from "@mattrglobal/jsonld-signatures-bbs";


export interface BlsKeys {
    G1?: Bls12381G1KeyPair & {url?: string}
    G2?: Bls12381G2KeyPair & {url?: string}
}

