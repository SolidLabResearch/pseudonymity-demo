# Link Traversal

## Use case: Pseudonymous job-application 

Alice's pod contains two example verifiable credentials:
- A VC asserting her obtained degree
- A VC asserting  


Steps:

1. Start Docker containers, and wait for the CSSs to start up.
    ```bash
    npm run docker:clean-start && npm run docker:logs
    ```
2. Run setup.
    ```bash
    npm run setup
    ```
3. Navigate to a Comunica webclient with link-traversal enabled:
<https://comunica.github.io/comunica-feature-link-traversal-web-clients/builds/solid-default/>
4. Set the IDP to <http://localhost:3000>
5. Login as Alice (email: `alice@example.com`, password: `alice123`)
6. Set the data sources to: `http://localhost:3000/alice/`

Query: 
```SPARQL
prefix vc: <https://www.w3.org/2018/credentials#>
SELECT *
WHERE {
    ?s ?p ?o
    FILTER(?o = vc:VerifiableCredential)
}
```
