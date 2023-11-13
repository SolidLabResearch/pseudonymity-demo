import {logger} from "../../logger";
import {IDocumentLoader} from "../../contexts/interfaces";
import {CssProxy} from "./CssProxy";
import {ISolidActor, UploadConfiguration} from "./interfaces";
import {NotInitializedError} from "./errors";

export class SolidActor implements ISolidActor {
    webId: string;
    protected documentLoader: IDocumentLoader

    constructor(proxy: CssProxy, webId: string, documentLoader: IDocumentLoader) {
        this._proxy = proxy;
        this.webId = webId;
        this.documentLoader = documentLoader;
    }

    private _proxy: CssProxy

    get proxy(): CssProxy {
        return this._proxy;
    }

    async initialize() {
        logger.debug(`initializing actor: ${this.webId}`)
        await this._proxy.initialize()
    }

    isInitialized() {
        return this._proxy.isInitialized()
    }

    checkInitialized() {
        if (!this.isInitialized())
            throw new NotInitializedError()
    }

    protected async uploadResourcesToPod(uploadConfigurations: UploadConfiguration[]) {
        logger.debug('uploadResourcesToPod()')

        for await (const uc of uploadConfigurations) {
            const ser = await uc.serialize!(uc.o());
            await this.proxy.addFileToContainer(
                uc.destContainer,
                Buffer.from(ser),
                uc.mimeType,
                uc.slug,
                uc.access?.public)
            logger.debug(`Added file ${uc.slug} to ${uc.destContainer}`)
        }

    }


}
