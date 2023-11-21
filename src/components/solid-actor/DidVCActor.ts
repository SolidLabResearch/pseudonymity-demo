import {IDidDocument} from "./did-interfaces";
import {toDidKeyDocument} from "../../utils/keypair";
import {AbstractBls12381G2VCActor} from "./AbstractBls12381G2VCActor";


export class DidVCActor extends AbstractBls12381G2VCActor {
    get identifier(): string {
        return `did:key:${this.key!.fingerprint()}`
    }

    get controllerDocument(): IDidDocument {
        return toDidKeyDocument(this.key!)
    }

}

