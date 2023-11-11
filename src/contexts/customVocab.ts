export const customVocab = {
    url: 'https://gddmulde.be/customvocab/',
    context: {
        "@context": [{
            "@version": 1.1
        }, {
            "ex": "https://example.org/examples#",
            "schema": "http://schema.org/",
            "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",

            "UniversityDegreeCredential": "ex:UniversityDegreeCredential",

            "alumniOf": {"@id": "schema:alumniOf", "@type": "rdf:HTML"},

            "degree": "ex:degree",
            "degreeType": "ex:degreeType",
            "grade": "ex:grade"

        }]
    }
}
