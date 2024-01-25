import os from "os";

export function getHostReport() {
    return {
        platform: os.platform(),
        machine: os.machine(),

        arch: os.arch(),
        cpus: os.cpus().map(cpu => {
            const {model, speed} = cpu
            return {model, speed}
        }),
        type: os.type(),
        totalmem: os.totalmem(),
        freemem: os.freemem(),

        uptime: os.uptime()
    }
}
