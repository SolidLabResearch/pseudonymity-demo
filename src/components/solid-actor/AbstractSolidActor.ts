import {logger} from "../../logger";
import {IDocumentLoader} from "../../contexts/interfaces";
import {ISolidActor} from "../anonymizer/interfaces";
import {CssProxy} from "../anonymizer/CssProxy";
import {type} from "os";
import {string} from "rdflib/lib/utils-js";

export class AbstractSolidActor implements ISolidActor {
    protected documentLoader: IDocumentLoader
    webId: string;
    private _proxy: CssProxy

    constructor(proxy: CssProxy, webId: string, documentLoader: IDocumentLoader) {
        this._proxy = proxy;
        this.webId = webId;
        this.documentLoader = documentLoader;

    }

    async initialize() {
        logger.debug(`initializing actor: ${this.webId}`)
        await this._proxy.intializeFetch()
    }

    isInitialized() {
        return this._proxy.isInitialized()
    }

    get proxy(): CssProxy {
        return this._proxy;
    }
}
