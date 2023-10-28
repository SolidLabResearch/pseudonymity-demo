// @ts-ignore
import jsigs, { purposes } from 'jsonld-signatures';
import {BbsBlsSignature2020, BbsBlsSignatureProof2020, Bls12381G2KeyPair} from "@mattrglobal/jsonld-signatures-bbs";

import {readJsonFile} from "../../util";
import {createCustomDocumentLoader, ctx} from "../../contexts/contexts";
export class Recruiter {

    didDocument?: any
    keys?: any
    documentLoader: any
    verifySuite: any
    constructor() {
        const state = readJsonFile('./actors/recruiter/recruiter.json');
        const { didObject: {didDocument, keys}} = state
        this.didDocument = didDocument;
        this.keys = keys;
        this.documentLoader = createCustomDocumentLoader(ctx)
    }
    sign(d: any) : any {
        console.log('Recruiter.sign:' , d)
    }

    /**
     * TODO: continue here!!! (28/10/2023 - 02:48)
     * Problems with integrating codesnippets from solid-dif-poc into this evaluation repo (probably due to the fact that
     * the poc code is written in plain JS, while the current evaluation codebase is in TS.
     * GO!
     * @param vp
     * @param challenge
     */
    async verify(vp: any, challenge: string) : Promise<any> {
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
