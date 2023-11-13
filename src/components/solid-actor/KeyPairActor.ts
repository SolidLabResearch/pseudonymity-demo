import {IActor} from "./interfaces";
import {Bls12381G2KeyPair} from "@mattrglobal/jsonld-signatures-bbs";

export abstract class KeyPairActor<K> implements IActor {
    key?: K

    abstract initialize(): Promise<void>

    isInitialized(): boolean {
        return this.key !== undefined
    }

}

export interface IBls12381G2KeyPairActor extends KeyPairActor<Bls12381G2KeyPair> {
    seed: string
    controller: string
    id: string
    keyName: string
}
