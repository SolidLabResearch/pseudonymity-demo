export function _hack_addEnsureContextFunction(suite: any) {
    suite.ensureSuiteContext = ({document}: any) => {
        const contextUrls = [
            // 'https://w3id.org/security/suites/bls12381-2020/v1',
            'https://w3id.org/security/bbs/v1'
        ];

        if (typeof document['@context'] === 'string' && contextUrls.includes(document['@context'])) {
            return;
        }

        if (Array.isArray(document['@context']) &&
            contextUrls.filter(url => document['@context'].includes(url)).length) {
            return;
        }

        throw new TypeError(
            `The document to be signed must contain one of this suite's @context, ` +
            `"${contextUrls.join(', ')}", got "${document['@context']?.join(', ')}".`
        );
    };
    return suite;
}
