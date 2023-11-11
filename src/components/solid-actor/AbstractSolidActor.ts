import {logger} from "../../logger";
import {IDocumentLoader} from "../../contexts/interfaces";
import {ISolidActor} from "../anonymizer/interfaces";
import {CssProxy} from "../anonymizer/CssProxy";
import {UploadConfiguration} from "./interfaces";
import {NotInitializedError} from "./errors";

export class AbstractSolidActor implements ISolidActor {
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
        await this._proxy.intializeFetch()
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
            console.log({ser, ct: uc.mimeType})
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
