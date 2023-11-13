import {afterAll, beforeAll, describe, expect, it} from '@jest/globals';
import {App} from '@solid/community-server';
import {cssTestConfigRecords, ICssTestConfig} from "../config/actorsOnCssTestConfigs";
import {obtainClientCredentials, register} from "../../utils/css";

import {ClientCredentials, CssControlsApiResponse, CssUserConfig} from "../../interfaces";
import {CssProxy} from "../../components/solid-actor/CssProxy";
import {SolidDidActor} from "../../components/solid-actor/SolidDidActor";
import {IDocumentLoader} from "../../contexts/interfaces";
import {createCustomDocumentLoader, ctx} from "../../contexts/contexts";

describe(`'Test SolidDidActor for one test actor'`, (): void => {
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


        it(`[${r.testConfig.name}] Should initialize a SolidDidActor`, async () => {
            const proxy = new CssProxy(r.clientCredentials!, r.userConfig.webId, r.controls!)
            const solidDidActor = new SolidDidActor(proxy, r.userConfig.webId, documentLoader)
            await solidDidActor.initialize()
            expect(solidDidActor.isInitialized())
        })

    }

});

