import {IActorStep, IActorStepRecord, IStepRecord} from "./interfaces";


export async function trackStep(f: Function) {
    const {name} = f
    const start = Date.now()
    const output = await f()
    const end = Date.now()
    const delta = end - start
    return {name, start, end, delta, output} as IStepRecord
}

export async function trackActorStep(
    actorStep: IActorStep
): Promise<IActorStepRecord> {
    const { f, actor} = actorStep
    const { tag, role,className } = actor
    const sr = await trackStep(() => f(actor))
    const { name } = f
    return {
        ...sr,
        name,
        tag,
        role,
        className,
        documentLoaderCacheOptions: actor.documentLoaderCacheOptions
    }
}

