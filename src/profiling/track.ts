import {IActorStep, IActorStepRecord, IStepRecord} from "./interfaces";
import {IActorMetadata} from "../components/solid-actor/interfaces";

export async function trackStep(f: Function) {
    const {name} = f
    const start = Date.now()
    await f()
    const end = Date.now()
    const delta = end - start
    return {name, start, end, delta} as IStepRecord
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

