import {afterAll, beforeAll, describe, expect, test, it} from '@jest/globals';
import {App, AppRunner, joinFilePath} from '@solid/community-server';
import fetch from 'cross-fetch';
import {
    ActorName, cssTestConfigRecords, ICssTestConfig
} from "../config/actorsOnCssTestConfigs";
import {obtainClientCredentials, register, registerUsersAndPods} from "../../utils/css";

import {ClientCredentials, CssControlsApiResponse, CssUserConfig} from "../../interfaces";

describe('CSS Servers for test actors', (): void => {
    let apps: Record<ActorName, App> = {}


    let records: Array<{

        testConfig: ICssTestConfig
        userConfig: CssUserConfig
        app?: App
        controls?: CssControlsApiResponse
        clientCredentials?: ClientCredentials
    }> = cssTestConfigRecords

    async function createApp(conf: ICssTestConfig) {
        return await new AppRunner().create(
            {
                // For testing we created a custom configuration that runs the server in memory so nothing gets written on disk.
                config: conf.config,

                loaderProperties: {
                    // Tell Components.js where to start looking for component configurations.
                    // We need to make sure it finds the components we made in our project
                    // so this needs to point to the root directory of our project.
                    mainModulePath: joinFilePath(__dirname, '.'),
                    // We don't want Components.js to create an error dump in case something goes wrong with our test.
                    dumpErrorState: false,
                },
                shorthand: {
                    port: conf.port,
                    loggingLevel: conf.logLevel
                },
                // We do not use any custom Components.js variable bindings and set our values through the CLI options below.
                // Note that this parameter is optional, so you can just drop it.
                variableBindings: {}
            }
        );
    }

    beforeAll(async (): Promise<void> => {


        // Create & start each actor's app (server)
        for await (const r of records) {
            r.app = await createApp(r.testConfig)
            await r.app.start()
            // Register users & pods, and get each actor's controls object
            r.controls = await register(r.userConfig)
            // Obtain client credentials
            r.clientCredentials = await obtainClientCredentials(r.userConfig, r.controls!)
        }
    });

    afterAll(async (): Promise<void> => {
        // Make sure to stop the server after all tests are finished so jest can finish.
        for await (let [name, app] of Object.entries(apps)) {
            await app.stop();
        }
    });


    for (let i = 0; i < records.length; i++) {
        const r = records[i]
        it(`Should fetch the WebID Profile Document for ${r.testConfig.name}`, async () => {
            const response = await fetch(r.userConfig.webId);
            expect(response.status).toBe(200);
        })
    }
    

});
