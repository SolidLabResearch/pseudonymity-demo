import {logger} from "../../logger";
import {IDocumentLoader} from "../../contexts/interfaces";
import {ISolidActor} from "../anonymizer/interfaces";
import {CssProxy} from "../anonymizer/CssProxy";

export class AbstractSolidActor implements ISolidActor {
    protected documentLoader: IDocumentLoader
    webId: string;
    protected proxy: CssProxy

    constructor(proxy: CssProxy, webId: string, documentLoader: IDocumentLoader) {
        this.proxy = proxy;
        this.webId = webId;
        this.documentLoader = documentLoader;

    }

    async initialize() {
        logger.debug(`initializing actor: ${this.webId}`)
        await this.proxy.intializeFetch()
        return this
    }
}
