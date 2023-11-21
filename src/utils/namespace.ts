export function Vocab(ns: string) {
    return (p: string) => {
        return ns.endsWith('#') || ns.endsWith('/') ?
            ns.concat(p) : ns.concat('#', p)
    }
}

// TODO: [CRITICAL] CLEAN UP NAMESPACES.
// https://solid.github.io/vocab/
export const namespaces = {
    sec: 'https://w3id.org/security#',
    sec_v1: "https://w3id.org/security/v1",
    sec_v2: "https://w3id.org/security/v2",
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
