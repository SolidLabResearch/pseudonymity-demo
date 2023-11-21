import jsonld from "jsonld";
import N3 from "n3";

export async function jsonld2nquads(jld: object): Promise<object> {
    let rdf = await jsonld.toRDF(jld, {format: 'application/n-quads'});
    return rdf
}

export async function ttl2store(ttl: string, baseIRI?: string): Promise<N3.Store> {
    const quads = new N3.Parser({
        format: 'text/turtle',
        baseIRI
    }).parse(ttl);
    return new N3.Store(quads)
}

export async function store2ttl(store: N3.Store): Promise<string> {
    const writer = new N3.Writer({format: "text/turtle"})
    return writer.quadsToString(store.getQuads(null, null, null, null))
}

export async function ttl2jld(ttl: string, baseIri?: string): Promise<object> {
    const store = await ttl2store(ttl, baseIri)
    const jld = await jsonld.fromRDF(store,)
    return jld
}
