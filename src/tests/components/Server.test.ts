import {afterAll, beforeAll, describe, expect, test, it} from '@jest/globals';
import {App, AppRunner, joinFilePath} from '@solid/community-server';
import fetch from 'cross-fetch';
import {
    cssTestConfigRecords, ICssTestConfig
} from "../config/actorsOnCssTestConfigs";
import {obtainClientCredentials, register} from "../../utils/css";

import {ClientCredentials, CssControlsApiResponse, CssUserConfig} from "../../interfaces";
import {CssProxy} from "../../components/anonymizer/CssProxy";

describe('For every actor, a CSS server is setup and client credentials are obtained. ', (): void => {
    let records: Array<{
        testConfig: ICssTestConfig
        userConfig: CssUserConfig
        app?: App // Placeholder for when we want to spin up the CSS servers as part of the test suite.
        controls?: CssControlsApiResponse
        clientCredentials?: ClientCredentials
    }> = cssTestConfigRecords

    beforeAll(async (): Promise<void> => {
        // Create & start each actor's app (server)
        for await (const r of records) {
            // Register users & pods, and get each actor's controls object
            r.controls = await register(r.userConfig)
            // Obtain client credentials
            r.clientCredentials = await obtainClientCredentials(r.userConfig, r.controls!)
            console.log({
                controls: r.controls!,
                clientCredentials: r.clientCredentials!
            })
        }
    });

    afterAll(async (): Promise<void> => {

    });


    for (let i = 0; i < records.length; i++) {
        const r = records[i]

        it(`Should fetch the WebID Profile Document for ${r.testConfig.name}`, async () => {
            const response = await fetch(r.userConfig.webId);
            expect(response.status).toBe(200);
        })

        it(`CSSProxy TODO TODO  ${r.testConfig.name}`, async () => {
            const proxy = new CssProxy(r.clientCredentials!, r.userConfig.webId, r.controls!)
            await proxy.intializeFetch()
            expect(proxy.isInitialized())
        })

    }

});
