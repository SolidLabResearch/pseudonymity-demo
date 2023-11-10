import {afterAll, beforeAll, describe, expect, test, it} from '@jest/globals';
import {App, AppRunner, joinFilePath} from '@solid/community-server';
import fetch from 'cross-fetch';
import {ActorName, actorsOnCssTestConfigs} from "../config/actorsOnCssTestConfigs";

describe('CSS Servers for test actors', (): void => {
    let apps: Record<ActorName, App> = {}

    beforeAll(async (): Promise<void> => {

        for await (let [name, conf] of Object.entries(actorsOnCssTestConfigs)) {
            apps[name] = await new AppRunner().create(
                {
                    // For testing we created a custom configuration that runs the server in memory so nothing gets written on disk.
                    config: joinFilePath(__dirname, '../config/default.json'),

                    loaderProperties: {
                        // Tell Components.js where to start looking for component configurations.
                        // We need to make sure it finds the components we made in our project
                        // so this needs to point to the root directory of our project.
                        mainModulePath: joinFilePath(__dirname, '.'),
                        // We don't want Components.js to create an error dump in case something goes wrong with our test.
                        dumpErrorState: false,
                    },
                    // We use the CLI options to set the port of our server to 3456
                    // and disable logging so nothing gets printed during our tests.
                    // Should you have multiple test files, it is important they all host their test server
                    // on a different port to prevent conflicts.
                    shorthand: {
                        port: conf.port,
                        loggingLevel: 'off',
                    },
                    // We do not use any custom Components.js variable bindings and set our values through the CLI options below.
                    // Note that this parameter is optional, so you can just drop it.
                    variableBindings: {}
                }
            );
        }

        for await (let [name, app] of Object.entries(apps)) {
            await app.start();
        }

    });

    afterAll(async (): Promise<void> => {
        // Make sure to stop the server after all tests are finished so jest can finish.
        for await (let [name, app] of Object.entries(apps)) {
            await app.stop();
        }
    });

    Object.entries(actorsOnCssTestConfigs).map(async ([name, conf]) => it(`CSS for ${name} works`, async (): Promise<void> => {
        const response = await fetch(`http://localhost:${conf.port}`);
        expect(response.status).toBe(200);
    }))


});
