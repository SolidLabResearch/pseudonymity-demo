import fs from 'fs';
import {ClientCredentials, CssControlsApiResponse, CssUserConfig} from './interfaces';
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

export async function getUserCredentials(userOnControls: Record<string, CssControlsApiResponse>) {
    const entries = Object.entries(userOnControls) as [string, CssControlsApiResponse][];
    const usersAndCredentials = Object.fromEntries(
        await Promise.all(entries.map(async (e) => {
            const [email, controls] = e;
            const user = users.find((u: any) => u.email === email)!

            // Client Credentials
            const cc: ClientCredentials = await obtainClientCredentials(user!, controls);
            // Access Token & DPoP Key
            return [user!.email, {
                user,
                controls,
                clientCredentials: cc
            }]
        }))
    )
    return usersAndCredentials as {
        [email: string]: {
            user: CssUserConfig,
            controls: CssControlsApiResponse,
            clientCredentials: ClientCredentials
        }
    }
}

preflight()
    .then(() => console.log('Done'))
