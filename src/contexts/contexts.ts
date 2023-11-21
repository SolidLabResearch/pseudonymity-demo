// @ts-ignore
import * as didContext from "did-context";
// @ts-ignore
import credentialsContext from "credentials-context";
import {customVocab} from "./customVocab";
import {DocumentLoaderResponse, IDocumentLoader} from "./interfaces";
import {fetch} from "@inrupt/universal-fetch";
import {ttl2jld} from "../utils/parsing";
import {readJsonFile} from "../utils/io";
import {namespaces} from "../utils/namespace";
import {NotYetImplementedError} from "../components/solid-actor/errors";
import {toDidKeyDocument} from "../utils/keypair";
import {Bls12381G2KeyPair} from "@mattrglobal/jsonld-signatures-bbs";

const ctx = new Map();
// DID context
ctx.set(didContext.CONTEXT_URL_V1, didContext.contexts.get(didContext.CONTEXT_URL_V1))
// VC context
ctx.set(credentialsContext.CONTEXT_URL_V1, credentialsContext.contexts.get(credentialsContext.CONTEXT_URL_V1))
// BBS context
ctx.set('https://w3id.org/security/bbs/v1', readJsonFile('./src/contexts/vc-di-bbs-v1.json'))
ctx.set('https://w3id.org/security/suites/jws-2020/v1', readJsonFile('./src/contexts/suiteContext.json'))

// Security contexts
ctx.set(namespaces.sec_v2, readJsonFile('./src/contexts/security.jsonld'))
ctx.set('https://w3id.org/security/v1', readJsonFile('./src/contexts/security-v1.jsonld'))
ctx.set('https://w3id.org/security/v2', readJsonFile('./src/contexts/security-v2.jsonld'))
// Add VC01 specific context
ctx.set("https://w3id.org/citizenship/v1", readJsonFile('./src/contexts/citizenVocab.json'))
// Add VC02 specific context
ctx.set(customVocab.url, customVocab.context)
// Add credential examples context
ctx.set('https://www.w3.org/2018/credentials/examples/v1', readJsonFile('./src/contexts/credentials-examples-v1.jsonld'))
// ODRL context
ctx.set('https://www.w3.org/ns/odrl.jsonld', readJsonFile('./src/contexts/odrl.jsonld'))


// Actor contexts // TODO: DELETE ACTOR CONTEXTS
const alice = readJsonFile('./actors/alice/user.json');
const government = readJsonFile('./actors/government/government.json');
const university = readJsonFile('./actors/university/university.json');
const recruiter = readJsonFile('./actors/recruiter/recruiter.json');
const actors = {
    alice, government, university, recruiter
}
Object.entries(actors) // TODO: DELETE THIS WHEN ABOVE ACTORS DELETED!!!
    .forEach(([a, o]) => {
        const {didObject: {didDocument, keys}} = o;
        ctx.set(didDocument.id, didDocument)
        keys.forEach((k: any) => ctx.set(k.id, k))
    })

export {
    ctx
}

export function createCustomDocumentLoader(ctx: Map<any, any>): IDocumentLoader {
    const cache = new Map<string, any>()
    return async (url: any) => {
        const context = ctx.get(url);
        if (context !== undefined) {
            return {
                contextUrl: null,
                documentUrl: url,
                document: context
            }

        } else if (cache.has(url)){

            return {
                contextUrl: null,
                documentUrl: url,
                document: cache.get(url)
            }
        }
        else if(url.startsWith('did:')){ // DID Resolving
            const [scheme, method, identifier] = url.split(':')
            let didResolver: IDocumentLoader
            switch (method) {
                case 'key':
                    if(identifier.startsWith('zUC7')) {
                        // https://w3c-ccg.github.io/did-method-key/#bls-12381
                        didResolver = (url) => {
                            const [controller] = identifier.split('#')
                            const key = Bls12381G2KeyPair.fromFingerprint({fingerprint: controller})
                            const didDocument = toDidKeyDocument(key)
                            const response = {
                                contextUrl: null,
                                documentUrl: url,
                                document: didDocument
                            } as DocumentLoaderResponse
                            return Promise.resolve(response)
                        }
                    }
                    break
                default:
                    throw new NotYetImplementedError(`DID Method: ${method} is not yet implemented!`)
            }
            const resolverResponse = await didResolver!(url)
            cache.set(resolverResponse.documentUrl!, resolverResponse.document)
            return resolverResponse
        }
        else { // Resolve using fetch
            const response = await fetch(url, {headers: { Accept: 'application/ld+json' }})
            let document = undefined
            switch (response.headers.get('content-type')) {
                case 'application/json':
                case 'application/ld+json':
                case 'application/ld+did+json':
                    document = await response.json()
                    break;
                case 'text/turtle':
                    const payload = await response.text();
                    document = await ttl2jld(payload)

                    break;
                default:
                    throw new Error(
                        `Error: ${response.headers.get('content-type')} not yet supported.
                        Status: ${response.status} - ${response.statusText}
                        URL: ${response.url}
                        `
                    )
            }
            if (!document)
                throw new Error(
                    `Error: could not resolve & parse URL: ${response.url}`
                )

            cache.set(url, document)
            return {
                contextUrl: null,
                documentUrl: url,
                document
            }
        }
    }
}
