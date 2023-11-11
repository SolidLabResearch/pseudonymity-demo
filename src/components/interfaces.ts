import {Bls12381G2KeyPair} from "@mattrglobal/jsonld-signatures-bbs";

export interface BlsKeys {
    G2?: Bls12381G2KeyPair & { url?: string }
}

