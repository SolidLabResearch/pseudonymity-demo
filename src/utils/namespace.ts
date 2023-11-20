export function Vocab(ns: string) {
    return (p: string) => {
        return ns.endsWith('#') || ns.endsWith('/') ?
            ns.concat(p) : ns.concat('#', p)
    }
}

// TODO: [CRITICAL] CLEAN UP NAMESPACES.
// https://solid.github.io/vocab/
export const namespaces = {
    // WARNING: 'https://w3id.org/security/' causes remote context loading errors
    // WARNING: 'https://w3c.github.io/vc-di-bbs/contexts/v1/' causes remote context loading errors
    // sec: 'https://w3id.org/security/v2',
    // sec: 'https://w3id.org/security/',
    // sec: 'https://w3id.org/security/v2',
    // sec: 'https://w3id.org/security/v2/',
    // sec: 'https://w3c.github.io/vc-di-bbs/contexts/v1/',
    // sec: 'http://example.org/security#',
    sec: "https://w3id.org/security/v2",
    rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    cert: 'http://www.w3.org/ns/auth/cert#',
    foaf: 'http://xmlns.com/foaf/0.1/',
    did: 'https://www.w3.org/ns/did/v1',

}
export const vocabs = Object.fromEntries(
    Object.entries(namespaces).map(
        ([prefix, ns]) => [
            prefix, Vocab(ns as string)
        ]
    )
)
