import {ICssTestConfig} from "./config/actorsOnCssTestConfigs";
import {ClientCredentials, CssControlsApiResponse, CssUserConfig} from "../interfaces";
import {App} from "@solid/community-server";
import {CompoundActor} from "../components/CompoundActor";
import {ICredentialActor} from "../interfaces/did";
import {IActor} from "../interfaces/actor";

export interface ITestRecord {
    testConfig: ICssTestConfig;
    userConfig: CssUserConfig;
    app?: App;
    controls?: CssControlsApiResponse;
    clientCredentials?: ClientCredentials,
    actor?: IActor | ICredentialActor | CompoundActor<ICredentialActor, ICredentialActor>
}
