export type DocumentLoaderResponse = {
    contextUrl: null | string
    documentUrl: null | string
    document: any
}

export interface IDocumentLoader {
    (url: any): DocumentLoaderResponse
}
