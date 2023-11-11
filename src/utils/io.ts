import fs, {PathLike} from 'fs';

export function readJsonFile(path: string | PathLike) {
    return JSON.parse(fs.readFileSync(path, 'utf8'))
}

export function writeJsonFile(fpath: string | PathLike, data: any) {
    fs.writeFileSync(fpath, JSON.stringify(data, null, 2))
}
