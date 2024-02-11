import {GenericVCActor} from "./GenericVCActor";
import {BbsBlsSignature2020, BbsBlsSignatureProof2020, Bls12381G2KeyPair} from "@mattrglobal/jsonld-signatures-bbs";
import {_hack_addEnsureContextFunction} from "../../utils/cryptosuite";
import {IDidDocument} from "../interfaces";
import {IDocumentLoader} from "../../interfaces";

export abstract class AbstractBls12381G2VCActor
    extends GenericVCActor<BbsBlsSignature2020, BbsBlsSignature2020, BbsBlsSignatureProof2020> {
    key: Bls12381G2KeyPair;
    fingerprint?: string
    _controllerDocument: IDidDocument

    constructor(key: Bls12381G2KeyPair, documentLoader: IDocumentLoader) {
        super(documentLoader,
            _hack_addEnsureContextFunction(new BbsBlsSignature2020({key })),
            new BbsBlsSignature2020(),
            new BbsBlsSignatureProof2020()
        );

        this.key = key;
        this.fingerprint = this.key.fingerprint()
        this._controllerDocument = this.createControllerDocument(this.key)
    }

    abstract createControllerDocument(key: Bls12381G2KeyPair): IDidDocument

    get controllerDocument(): IDidDocument {
        return this._controllerDocument
    }

    get controllerDocumentContext(): string[] {
        // TODO: replace with namespaces.did
        return ['https://www.w3.org/ns/did/v1']
    }

    get controllerId(): string { // TODO: delete controllerId (replace usages with identifier)
        return this.identifier
    }

}
