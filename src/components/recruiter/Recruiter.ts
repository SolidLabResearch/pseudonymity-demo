// @ts-ignore
import jsigs, {purposes} from 'jsonld-signatures';
import {BbsBlsSignature2020, BbsBlsSignatureProof2020, Bls12381G2KeyPair} from "@mattrglobal/jsonld-signatures-bbs";

import {createCustomDocumentLoader, ctx} from "../../contexts/contexts";
import {readJsonFile} from "../../utils/io";

export class Recruiter {

    didDocument?: any
    keys?: any
    documentLoader: any
    verifySuite: any

    constructor() {
        const state = readJsonFile('./actors/recruiter/recruiter.json');
        const {didObject: {didDocument, keys}} = state
        this.didDocument = didDocument;
        this.keys = keys;
        this.documentLoader = createCustomDocumentLoader(ctx)
    }

    sign(d: any): any {
        console.log('Recruiter.sign:', d)
    }

    async verify(vp: any, challenge: string): Promise<any> {
        return await jsigs.verify(
            vp,
            {
                suite: [
                    new BbsBlsSignature2020(),
                    new BbsBlsSignatureProof2020()
                ],
                documentLoader: this.documentLoader,
                challenge,
                purpose: new purposes.AssertionProofPurpose()
            }
        );
    }
}
