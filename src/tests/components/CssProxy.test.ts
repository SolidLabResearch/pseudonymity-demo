import {afterAll, beforeAll, describe, expect, test, it} from '@jest/globals';
import {App, AppRunner, joinFilePath} from '@solid/community-server';
import fetch from 'cross-fetch';
import {
    cssTestConfigRecords, ICssTestConfig
} from "../config/actorsOnCssTestConfigs";
import {obtainClientCredentials, register} from "../../utils/css";

import {ClientCredentials, CssControlsApiResponse, CssUserConfig} from "../../interfaces";
import {CssProxy} from "../../components/anonymizer/CssProxy";
import {SolidDidActor} from "../../components/solid-actor/SolidDidActor";
import {IDocumentLoader} from "../../contexts/interfaces";
import {createCustomDocumentLoader, ctx} from "../../contexts/contexts";
import {AccessModes} from "@inrupt/solid-client";
import * as path from "path";
import {SolidVCActor} from "../../components/solid-actor/SolidVCActor";
import {AbstractSolidActor} from "../../components/solid-actor/AbstractSolidActor";


describe(`'Test CSSProxy for one test actor'`, (): void => {
    const SELECTED_TEST_ACTOR = 'alice'

    let records: Array<{
        testConfig: ICssTestConfig
        userConfig: CssUserConfig
        app?: App // Placeholder for when we want to spin up the CSS servers as part of the test suite.
        controls?: CssControlsApiResponse
        clientCredentials?: ClientCredentials
    }> = cssTestConfigRecords.filter(r => r.testConfig.name === SELECTED_TEST_ACTOR)

    let documentLoader: IDocumentLoader

    beforeAll(async (): Promise<void> => {

        documentLoader = createCustomDocumentLoader(ctx)

        // Create & start each actor's app (server)
        for await (const r of records) {
            // Register users & pods, and get each actor's controls object
            const controls = await register(r.userConfig)
            expect(controls).toBeTruthy()
            r.controls = controls
            // Obtain client credentials
            r.clientCredentials = await obtainClientCredentials(r.userConfig, r.controls!)
        }
    });

    afterAll(async (): Promise<void> => {

    });


    for (let i = 0; i < records.length; i++) {
        const r = records[i]

        it(`[${r.testConfig.name}] Should fetch the WebID Profile Document`, async () => {
            const response = await fetch(r.userConfig.webId);
            expect(response.status).toBe(200);
        })

        it(`[${r.testConfig.name}] Should initialize a CSSProxy`, async () => {
            const proxy = new CssProxy(r.clientCredentials!, r.userConfig.webId, r.controls!)
            await proxy.intializeFetch()
            expect(proxy.isInitialized())
        })

        it(`[${r.testConfig.name}] CSSProxy can add plain text file to Solid Pod`, async () => {
            const proxy = new CssProxy(r.clientCredentials!, r.userConfig.webId, r.controls!)
            await proxy.intializeFetch();

            const containerUrl = proxy.webId.replace('card#me', '')
            const slug = 'textfile'
            const payload = 'this is text :)'
            const ct = 'plain/text'
            await proxy.addFileToContainer(
                containerUrl,
                Buffer.from(payload),
                ct,
                slug,
                {read: true} as AccessModes
            )

            const response = await fetch(path.join(containerUrl, slug))
            const {status, statusText, headers} = response
            expect(status).toBe(200)
            expect(headers.get('content-type')).toBe(ct)
            expect(await response.text()).toEqual(payload)

        })

        it(`[${r.testConfig.name}] CSSProxy allows WebIDProfile to be updated using its profile builder.`, async () => {
            const proxy = new CssProxy(r.clientCredentials!, r.userConfig.webId, r.controls!)
            await proxy.intializeFetch();

            const pb = await proxy.getProfileBuilder()
            const params = {
                predicate: 'http://example.org#example',
                object: 'This is a string without locale'
            }
            pb.addStringNoLocale(params.predicate, params.object)
            await proxy.updateProfile(pb.build())

            const response = await fetch(r.userConfig.webId.replace('#me', ''))
            const {status, statusText, headers} = response
            expect(status).toBe(200)
            expect(headers.get('content-type')).toBe('text/turtle')

        })

        it(`[${r.testConfig.name}] Should initialize a SolidDidActor`, async () => {
            const proxy = new CssProxy(r.clientCredentials!, r.userConfig.webId, r.controls!)
            const solidDidActor = new SolidDidActor(proxy, r.userConfig.webId, documentLoader)
            await solidDidActor.initialize()
            expect(solidDidActor.isInitialized())
        })

        it(`[${r.testConfig.name}] Should initialize a SolidVCActor`, async () => {
            const proxy = new CssProxy(r.clientCredentials!, r.userConfig.webId, r.controls!)
            const solidVCActor = new SolidVCActor(proxy, r.userConfig.webId, documentLoader)
            await solidVCActor.initialize()
            expect(solidVCActor.isInitialized())
        })

    }

});
