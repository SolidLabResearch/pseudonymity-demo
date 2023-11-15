import {readJsonFile} from "../../utils/io";
// @ts-ignore
import credentialsContext from 'credentials-context';

/**
 * Build context map
 * @param actors
 * @returns {Map<any, any>}
 */
export function getContextMap() {
    const ctx = new Map();

    // VC
    ctx.set(credentialsContext.CONTEXT_URL_V1, credentialsContext.contexts.get(credentialsContext.CONTEXT_URL_V1))
    // BBS context
    ctx.set('https://w3id.org/security/bbs/v1', readJsonFile('src/contexts/vc-di-bbs-v1.json'))

    ctx.set('https://w3id.org/security/suites/jws-2020/v1', readJsonFile('src/contexts/suiteContext.json'))
    return ctx
}
