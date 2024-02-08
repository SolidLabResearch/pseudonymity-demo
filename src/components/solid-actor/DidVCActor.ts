import {toDidKeyDocument} from "../../utils/keypair";
import {AbstractBls12381G2VCActor} from "./AbstractBls12381G2VCActor";
import {IDidDocument} from "../interfaces";


export class DidVCActor extends AbstractBls12381G2VCActor {

    get identifier(): string {

        return `did:key:${this.fingerprint!}`
    }

    get controllerDocument(): IDidDocument {
        return this._controllerDocument!
    }

}

