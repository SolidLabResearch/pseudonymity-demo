import {AbstractBls12381G2VCActor} from "./AbstractBls12381G2VCActor";
import {Bls12381G2KeyPair} from "@mattrglobal/jsonld-signatures-bbs";
import {toDidKeyDocumentDirect} from "../utils/keypair";
import {IDidDocument} from "../interfaces/did";

export class DidKeyVCActor extends AbstractBls12381G2VCActor {

    get identifier(): string {
        return `did:key:${this.fingerprint!}`
    }

    createControllerDocument(key: Bls12381G2KeyPair): IDidDocument {
        return toDidKeyDocumentDirect(this.fingerprint!, this.key.publicKey)
    }

}
