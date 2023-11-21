import {describe, expect, it} from '@jest/globals';
import {DidActorFactory} from "../ActorFactory";

describe(`DidActor`, (): void => {


    const actorFactory = new DidActorFactory()

    it('Should initialize correctly', async () => {
        const actor = await actorFactory.createInitializedActor()
        expect(actor.isInitialized()).toBeTruthy()
    })

    it('Has a correct controller document', async () => {
        const actor = await actorFactory.createInitializedActor()
        const {controller, keyName} = actor;
        const expectedKeyId = `${controller}#${keyName}`
        expect(actor.controllerDocument).toHaveProperty('id', controller)
        expect(actor.controllerDocument).toHaveProperty('verificationMethod[0].id', expectedKeyId)
        expect(actor.controllerDocument).toHaveProperty('assertionMethod[0]', expectedKeyId)
    })

});

