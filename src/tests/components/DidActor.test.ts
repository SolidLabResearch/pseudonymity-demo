import {describe, it, expect} from '@jest/globals';
import {DidActor} from "../../components/solid-actor/DidActor";


describe(`DidActor`, (): void => {

    it('Should initialize correctly', async () => {
        const controller = 'urn:test:controller'
        const keyName = "key-g2"
        const actor = new DidActor('test-seed', controller,keyName);
        await actor.initialize()
        expect(actor.isInitialized()).toBeTruthy()
    })

    it('Has a correct controller document', async () => {
        const controller = 'urn:test:controller'
        const keyName = "key-g2"
        const actor = new DidActor('test-seed', controller,keyName);
        await actor.initialize()
        const expectedKeyId = `${controller}#${keyName}`
        expect(actor.controllerDocument).toHaveProperty('id', controller)
        expect(actor.controllerDocument).toHaveProperty('verificationMethod[0].id', expectedKeyId)
        expect(actor.controllerDocument).toHaveProperty('assertionMethod[0]', expectedKeyId)
    })

});

