import {GenericVCActor} from "./GenericVCActor";
import {BbsBlsSignature2020, BbsBlsSignatureProof2020, Bls12381G2KeyPair} from "@mattrglobal/jsonld-signatures-bbs";
import {KeyPairActor} from "./KeyPairActor";
import {_hack_addEnsureContextFunction} from "../../utils/cryptosuite";
import {toDidKeyDocumentDirect} from "../../utils/keypair";
import {ICredentialActor, IDidDocument} from "../interfaces";
import {IDocumentLoader} from "../../interfaces";

export abstract class AbstractBls12381G2VCActor
    extends GenericVCActor<BbsBlsSignature2020, BbsBlsSignature2020, BbsBlsSignatureProof2020>
    implements ICredentialActor, KeyPairActor<Bls12381G2KeyPair> {
    key: Bls12381G2KeyPair;
    fingerprint?: string
    _controllerDocument?: IDidDocument

    constructor(key: Bls12381G2KeyPair, documentLoader: IDocumentLoader) {
        super(documentLoader,
            _hack_addEnsureContextFunction(new BbsBlsSignature2020({key })),
            new BbsBlsSignature2020(),
            new BbsBlsSignatureProof2020()
        );

        this.key = key;
        this.fingerprint = this.key.fingerprint()
        this._controllerDocument = toDidKeyDocumentDirect(this.fingerprint, this.key.publicKey)
    }

    abstract get identifier(): string

    abstract get controllerDocument(): IDidDocument



    get controllerDocumentContext(): string[] {
        // TODO: replace with namespaces.did
        return ['https://www.w3.org/ns/did/v1']
    }

    get controllerId(): string {
        return this.identifier
    }


}
