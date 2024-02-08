import {Bls12381G2KeyPair} from "@mattrglobal/jsonld-signatures-bbs";
import {exportPublicG2} from "../../utils/keypair";
import {IBls12381G2KeyPairActor} from "./KeyPairActor";
import {IDidDocument} from "../interfaces";

export class DidActor implements IBls12381G2KeyPairActor {
    key?: Bls12381G2KeyPair;
    seed: string;
    controller: string;
    id: string;
    keyName: string

    constructor(seed: string, controller: string, keyName?: string ) {
        this.seed = seed;
        this.controller = controller;
        this.keyName = keyName??'key-g2';
        this.id = `${this.controller}#${this.keyName}`;
    }
    get controllerDocumentContext(): string[] {
        return ['https://www.w3.org/ns/did/v1']
    }
    get controllerDocument(): IDidDocument {
        return {
            '@context': this.controllerDocumentContext,
            'id': this.controller,
            verificationMethod: [exportPublicG2(this.key!)],
            assertionMethod: [this.key!.id!]
        }
    }

    isInitialized(): boolean {
        return this.key !== undefined
    }

    async initialize(): Promise<void> {
        this.key = await Bls12381G2KeyPair.generate({
            controller: this.controller,
            id: this.id,
            seed: Uint8Array.from(Buffer.from(this.seed))
        })
    }
}
