// @ts-ignore
import * as didContext from "did-context";
// @ts-ignore
import credentialsContext from "credentials-context";
import {customVocab} from "./customVocab";
import {readJsonFile} from "../util";

const ctx = new Map();
// DID context
ctx.set(didContext.CONTEXT_URL_V1, didContext.contexts.get(didContext.CONTEXT_URL_V1))
// VC context
ctx.set(credentialsContext.CONTEXT_URL_V1, credentialsContext.contexts.get(credentialsContext.CONTEXT_URL_V1))
// BBS context
ctx.set('https://w3id.org/security/bbs/v1', readJsonFile('./src/contexts/vc-di-bbs-v1.json'))
ctx.set('https://w3id.org/security/suites/jws-2020/v1', readJsonFile('./src/contexts/suiteContext.json'))

// Security contexts
ctx.set('https://w3id.org/security/v1', readJsonFile('./src/contexts/security-v1.jsonld'))
ctx.set('https://w3id.org/security/v2', readJsonFile('./src/contexts/security-v2.jsonld'))
// Add VC01 specific context
ctx.set("https://w3id.org/citizenship/v1",readJsonFile('./src/contexts/citizenVocab.json'))
// Add VC02 specific context
ctx.set(customVocab.url, customVocab.context)

// Actor contexts // TODO: dynamically add actors to context
const alice = readJsonFile('./actors/alice/user.json');
const government = readJsonFile('./actors/government/government.json');
const university = readJsonFile('./actors/university/university.json');
const recruiter = readJsonFile('./actors/recruiter/recruiter.json');
const actors = {
    alice, government, university, recruiter
}
Object.entries(actors)
    .forEach(([a, o])=>{
        const { didObject: { didDocument, keys }} = o;
        ctx.set(didDocument.id, didDocument)
        keys.forEach((k:any) => ctx.set(k.id, k))
    })

export {
    ctx
}
export function createCustomDocumentLoader(ctx: Map<any, any>) {
    return (url: any) => {
        const context = ctx.get(url);
        if (context !== undefined) {
            return {
                contextUrl: null,
                documentUrl: url,
                document: context
            };
        }
        throw new Error(`Document loader unable to load URL "${url}".`);
    }
}
