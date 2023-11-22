import {IStepRecord} from "./interfaces";

export async function trackStep(f: () => Promise<void>) {
    const {name} = f
    const start = Date.now()
    await f()
    const end = Date.now()
    const delta = end - start
    return {name, start, end, delta} as IStepRecord
}
