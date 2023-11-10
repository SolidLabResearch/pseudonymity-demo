import path from 'path';

export function joinUrlPaths(...paths: string[]): URL {
    const [base, ...rest] = paths;
    const url = new URL(path.join(...rest), base);
    return url;
}
