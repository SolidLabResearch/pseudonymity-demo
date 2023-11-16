import {Bls12381G2VCActor} from "../components/solid-actor/Bls12381G2VCActor";
import {Bls12381G2KeyPair} from "@mattrglobal/jsonld-signatures-bbs";
import {toDidKeyDocument} from "../utils/keypair";
import {IVerificationMethod} from "../components/solid-actor/did-interfaces";
import {createCustomDocumentLoader} from "../contexts/contexts";

import {getContextMap, runEvaluation} from "./evaluator";
import {writeFileSync} from "fs";
import path from "path";
import {dirProfilingReports} from "./config";

export async function createInitializedActor(): Promise<Bls12381G2VCActor> {
    // Generate BLS12381 G2 Key using a seed
    const seed = Uint8Array.from(Buffer.from('testseed'))
    let key = await Bls12381G2KeyPair.generate({ seed })
    // Create its corresponding did:key DID Document
    const didKeyDocument = toDidKeyDocument(key)
    const {id, verificationMethod} = didKeyDocument
    const vm = (verificationMethod as IVerificationMethod[])[0]
    // Re-instantiate BLS12381 G2, but with set with the did:key identifiers
    key = new Bls12381G2KeyPair({
        id: vm.id,
        controller: id,
        privateKeyBase58: key.privateKey,
        publicKeyBase58: key.publicKey
    })
    const documentLoader = createCustomDocumentLoader(getContextMap())
    const actor = new Bls12381G2VCActor(key,documentLoader);
    await actor.initialize()
    return actor
}

createInitializedActor()
    .then(runEvaluation)
    .then()
    .catch(console.error)
