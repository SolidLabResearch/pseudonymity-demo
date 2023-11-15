import {ICredentialActor} from "../components/solid-actor/interfaces";
import fs from 'fs'
function readJsonFile(path:string) {
    return JSON.parse(fs.readFileSync(path, 'utf8'));
}
// @ts-ignore
import credentialsContext from 'credentials-context';

export function getContextMap() {
    const ctx = new Map();
    // VC
    ctx.set(credentialsContext.CONTEXT_URL_V1, credentialsContext.contexts.get(credentialsContext.CONTEXT_URL_V1))
    // BBS context
    ctx.set('https://w3id.org/security/bbs/v1', readJsonFile('src/contexts/vc-di-bbs-v1.json'))

    ctx.set('https://w3id.org/security/suites/jws-2020/v1', readJsonFile('src/contexts/suiteContext.json'))
    return ctx
}

export async function evaluate(actor: ICredentialActor) {
    // Create VC
    const c = actor.createCredential(
        {id: 'urn:test:id000',
            'ex:identifier': '123456789ab',
            'ex:familyName': "Doe",
            'ex:webid': "https://gov.be/john.doe"
        })
    const vc = await actor.signCredential(c)

    // JSON-LD Frame to articulate which attributes to select for disclosure
    const frame = {
        "@context": actor.credentialContext,
        "type": ["VerifiableCredential"],
        "credentialSubject": {
            "@explicit": true,
            'ex:webid': {}
        }
    }

    // Derive VC
    const dvc = await actor.deriveCredential(vc, frame)

    // Create VP with derived credential
    const constituentCredentials = [dvc]
    const p = actor.createPresentation(constituentCredentials, actor.identifier)
    const challenge = 'ch4ll3ng3'
    const vp = await actor.signPresentation(p, challenge)

    // Verify
    const verificationResult = await actor.verifyPresentation(vp, challenge)

    if(!verificationResult.verified) {
        throw new Error(`VC or VP is NOT valid!
        ${JSON.stringify(verificationResult)}`)
    }

}
