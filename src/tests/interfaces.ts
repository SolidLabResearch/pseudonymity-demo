import {ICssTestConfig} from "./config/actorsOnCssTestConfigs";
import {ClientCredentials, CssControlsApiResponse, CssUserConfig} from "../interfaces";
import {App} from "@solid/community-server";
import {CompoundActor} from "../components/CompoundActor";
import {IActor} from "../components/interfaces";
import {ICredentialActor} from "../interfaces/did";

export interface ITestRecord {
    testConfig: ICssTestConfig;
    userConfig: CssUserConfig;
    app?: App;
    controls?: CssControlsApiResponse;
    clientCredentials?: ClientCredentials,
    actor?: IActor | ICredentialActor | CompoundActor<ICredentialActor, ICredentialActor>
}
