import {GenericVCActor} from "./GenericVCActor";
import {BbsBlsSignature2020, BbsBlsSignatureProof2020, Bls12381G2KeyPair} from "@mattrglobal/jsonld-signatures-bbs";
import {_hack_addEnsureContextFunction} from "../utils/cryptosuite";
import {IDocumentLoader} from "../interfaces";
import {IDidDocument} from "../interfaces/did";

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

    /**
     * Depends on the type of identifier used by the concrete VC Actor.
     * For example, the controller document of a DID Key VC Actor will be
     * created differently from a Solid VC Actor (using a WebID as identifier)
     * @param key
     */
    abstract createControllerDocument(key: Bls12381G2KeyPair): IDidDocument

    get controllerDocument(): IDidDocument {
        return this._controllerDocument
    }

    get controllerDocumentContext(): string[] {
        // TODO: replace with namespaces.did
        return ['https://www.w3.org/ns/did/v1']
    }

}
