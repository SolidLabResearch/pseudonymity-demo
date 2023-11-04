import {DocumentLoaderResponse} from "./contexts";

export interface IDocumentLoader {
    (url: any): DocumentLoaderResponse
}
