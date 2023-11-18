import {CompoundActor} from "./CompoundActor";
import {SolidActor} from "./SolidActor";
import {DidActor} from "./DidActor";
import {UploadConfiguration} from "./interfaces";
import {CssProxy} from "./CssProxy";
import {IDocumentLoader} from "../../contexts/interfaces";
import path from "path";
import {AccessModes} from "@inrupt/solid-client";
import {joinUrlPaths} from "../../utils/url";

export class SolidDidActorV2 extends CompoundActor<SolidActor, DidActor> {

    private uploadConfigurations: UploadConfiguration[]
    private _didsContainer?: string

    constructor(proxy: CssProxy, webId: string, documentLoader: IDocumentLoader) {
        const solidActor = new SolidActor(proxy, webId, documentLoader)
        const didsContainer = joinUrlPaths(solidActor.proxy.podUrl!, 'dids') + '/';
        const controllerId = joinUrlPaths(didsContainer, 'controller')
        const didActor = new DidActor(webId, controllerId)
        super(solidActor, didActor);
        this._didsContainer = didsContainer

        this.uploadConfigurations = [
            {
                description: `Upload the JSON-LD serialization of the controller's DID Document`,
                o: () => this.didActor.controllerDocument,
                serialize: async (o: object) => JSON.stringify(o, null, 2),
                destContainer: this.didsContainer,
                slug: 'controller',
                mimeType: 'application/ld+json',
                access: {public: {read: true} as AccessModes}
            }
        ]
    }

    get didsContainer(): string {
        return this._didsContainer!;
    }

    get solidActor(): SolidActor {
        return this.a1
    }

    get didActor(): DidActor {
        return this.a2
    }

    async initialize(): Promise<void> {
        await super.initialize();
        await this.solidActor.uploadResourcesToPod(this.uploadConfigurations)
    }
}
