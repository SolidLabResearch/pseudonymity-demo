import {joinFilePath, LogLevel} from "@solid/community-server";
import {CssUserConfig} from "../../interfaces";
import {UserConfig} from "../../utils/css";

export type ActorName = string

export interface ICssTestConfig {
    name: ActorName
    config: string
    port: number
    logLevel?: LogLevel
}

export type ActorTestConfiguration = {
    userConfig: CssUserConfig
    testConfig: ICssTestConfig
}

function combineCssTestConfigAndUserConfig(tc: ICssTestConfig): ActorTestConfiguration {
    const {name, port} = tc
    return {
        userConfig: {
            podName: name,
            email: `${name}@tests.com`,
            password: `${name}123`,
            css: `http://localhost:${port}`,
            webId: `http://localhost:${port}/${name}/profile/card#me`,
            createPod: true,
            createWebId: true,
            register: true
        },
        testConfig: tc
    }
}

// Default CSS Config
const config = joinFilePath(__dirname, '../config/default.json')

export const cssTestConfigRecords = [
    {name: 'alice', port: 3000, config,},
    {name: 'recruiter', port: 3002, config,},
].map(combineCssTestConfigAndUserConfig)
