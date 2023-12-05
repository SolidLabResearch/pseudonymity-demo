import {ICssTestConfig} from "./config/actorsOnCssTestConfigs";
import {ClientCredentials, CssControlsApiResponse, CssUserConfig} from "../interfaces";
import {App} from "@solid/community-server";
import {IActor, ICredentialActor} from "../components/solid-actor/interfaces";
import {CompoundActor} from "../components/solid-actor/CompoundActor";

export interface ITestRecord {
    testConfig: ICssTestConfig;
    userConfig: CssUserConfig;
    app?: App;
    controls?: CssControlsApiResponse;
    clientCredentials?: ClientCredentials,
    actor?: IActor | CompoundActor<ICredentialActor, ICredentialActor>
}
