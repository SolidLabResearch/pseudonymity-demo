import {ICssTestConfig} from "./config/actorsOnCssTestConfigs";
import {ClientCredentials, CssControlsApiResponse, CssUserConfig} from "../interfaces";
import {App} from "@solid/community-server";
import {SolidVCActor} from "../components/solid-actor/SolidVCActor";

export interface ITestRecord {
    testConfig: ICssTestConfig;
    userConfig: CssUserConfig;
    app?: App;
    controls?: CssControlsApiResponse;
    clientCredentials?: ClientCredentials,
    actor?: SolidVCActor
}
