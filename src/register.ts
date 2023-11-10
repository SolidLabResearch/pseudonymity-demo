import {config} from './config';
import {joinUrlPaths} from './util';
import {logger} from './logger';
import {formatCssTokenHeader} from "./utils/css";
import {fetchJson} from "./utils/fetching";
import {readJsonFile} from "./utils/io";

export interface UserConfig {
    email: string;
    password: string;
    podName: string;
    createPod: boolean;
    css?: string;
}

export async function register(UserConfig: UserConfig) {
    const baseUrl = UserConfig.css ?? config.baseUrl;

    const url = joinUrlPaths(baseUrl, '.account/');
    // Fetch control urls
    const {controls} = await fetchJson(url);

    // Create account
    const {authorization} = await fetchJson(controls.account.create, {
        method: 'POST',
    })

    // Get account controls
    const {controls: accountControls} = await fetchJson(controls.account.create, {
        headers: {
            Authorization: formatCssTokenHeader(authorization),
        }
    })
    console.log({accountControls})

    // Add login method
    const {email, password} = UserConfig;
    logger.info(`Adding login method for: ${email}`)
    let res = await fetchJson(accountControls.password.create, {
        method: 'POST',
        headers: {
            Authorization: formatCssTokenHeader(authorization),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({email, password})
    })

    // Create pod
    let podUrls = {}
    if (UserConfig.createPod) {
        logger.info(`Creating pod ${UserConfig.podName}`)
        const {pod, podResource, webId} = await fetchJson(accountControls.account.pod, {
            method: 'POST',
            headers: {
                Authorization: formatCssTokenHeader(authorization),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: UserConfig.podName
            }),
        })
        console.log('Pod created!')
        podUrls = {pod, podResource}
    }

    return {
        ...accountControls,
        ...podUrls
    };
}
