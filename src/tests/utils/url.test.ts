import {describe, expect, it} from '@jest/globals';
import {joinUrlPaths} from "../../utils/url";


describe('URL utils', (): void => {



    it('joinUrlPaths correctly joins paths', async () => {
        {
            const baseUrl = 'http://localhost:3000'
            const paths = ['a']
            const resultUrl = joinUrlPaths(baseUrl, ...paths)
            expect(resultUrl).toEqual('http://localhost:3000/a')
        }
        {
            const baseUrl = 'http://localhost:3000/'
            const paths = ['a']
            const resultUrl = joinUrlPaths(baseUrl, ...paths)
            expect(resultUrl).toEqual('http://localhost:3000/a')
        }
        {
            const baseUrl = 'http://localhost:3000/'
            const paths = ['a','b']
            const resultUrl = joinUrlPaths(baseUrl, ...paths)
            expect(resultUrl).toEqual('http://localhost:3000/a/b')
        }
        {
            const baseUrl = 'http://localhost:3000/alice/dids'
            const paths = ['a']
            const resultUrl = joinUrlPaths(baseUrl, ...paths)
            expect(resultUrl).toEqual('http://localhost:3000/alice/dids/a')
        }
        {
            const baseUrl = 'http://localhost:3000/alice/dids'
            const paths = ['a','b']
            const resultUrl = joinUrlPaths(baseUrl, ...paths)
            expect(resultUrl).toEqual('http://localhost:3000/alice/dids/a/b')
        }
        {
            const baseUrl = 'https://example.org'
            const paths = ['a']
            const resultUrl = joinUrlPaths(baseUrl, ...paths)
            expect(resultUrl).toEqual('https://example.org/a')
        }
        {
            const baseUrl = 'https://example.org'
            const paths = ['a','b']
            const resultUrl = joinUrlPaths(baseUrl, ...paths)
            expect(resultUrl).toEqual('https://example.org/a/b')
        }

    })

});

