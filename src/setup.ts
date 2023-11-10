import fs from 'fs';
import {ClientCredentials, CssUserConfig} from './interfaces';
import assert from "node:assert";
import {CssProxy} from "./components/anonymizer/CssProxy";
import {SolidVCActor} from "./components/solid-actor/SolidVCActor";
import {createCustomDocumentLoader, ctx} from "./contexts/contexts";
import {obtainClientCredentials, registerUsersAndPods} from "./utils/css";
import {readJsonFile, writeJsonFile} from "./utils/io";

const users: Array<CssUserConfig> = readJsonFile('./common/css-users.json')

/**
 * TODO: rename preflight function :)
 */
async function preflight() {
    let userOnControls: Record<string, any>;
    if (!fs.existsSync('./dev.user-on-controls.json')) {
        userOnControls = await registerUsersAndPods(users);
        writeJsonFile('./dev.user-on-controls.json', userOnControls)
    } else {
        userOnControls = readJsonFile('./dev.user-on-controls.json')
    }
    const fpathUsersAndCredentials = 'usersAndClientCredentials.json';
    if (!fs.existsSync(fpathUsersAndCredentials)) {
        writeJsonFile(fpathUsersAndCredentials, await getUserCredentials(userOnControls));
    }
    return readJsonFile(fpathUsersAndCredentials)
}

async function getUserCredentials(userOnControls: Record<string, any>) {
    const entries = Object.entries(userOnControls) as [string, Record<string, any>][];
    const usersAndCredentials = Object.fromEntries(
        await Promise.all(entries.map(async (e) => {
            const [email, controls] = e;
            const user = users.find((u: any) => u.email === email);
            assert(user!!)
            // Client Credentials
            const cc: ClientCredentials = await obtainClientCredentials(user!, controls);
            // // Access Token & DPoP Key
            // const {accessToken, dpopKey} = await obtainAccessToken(cc, user.webId);
            return [user!.email, {
                user,
                controls,
                credentials: {
                    clientCredentials: cc,
                }
            }]
        }))
    )
    return usersAndCredentials
}

preflight()
    .then(() => console.log('Done'))
