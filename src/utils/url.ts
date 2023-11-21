import path from "path";

export function joinUrlPaths(...paths: string[]): string {
    const [base, ...rest] = paths;
    const baseUrl = new URL(base)
    const url = new URL(path.join(baseUrl.pathname,...rest),baseUrl.origin);
    return url.toString()
}
export function isValidUrl(s: string) {
    try {
        new URL(s);
        return true;
    } catch (err) {
        return false;
    }
}
