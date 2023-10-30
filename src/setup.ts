import fs from 'fs';
import { readJsonFile, writeJsonFile, obtainClientCredentials, registerUsersAndPods} from "./util"
import { createContainerAt } from "@inrupt/solid-client";
import {ClientCredentials, CssUserConfig} from './interfaces';
import assert from "node:assert";
import path from "path";
import fetch from "cross-fetch";
import {logger} from "./logger";
import {CssProxy} from "./components/anonymizer/CssProxy";
import { fileTypeFromFile } from 'file-type';

const users: Array<CssUserConfig> = readJsonFile('./common/css-users.json')

/**
 * TODO: rename preflight function :)
 */
async function preflight() {
  let userOnControls: Record<string, any>;
  if(!fs.existsSync('./dev.user-on-controls.json')) {
    userOnControls = await registerUsersAndPods(users);
    writeJsonFile('./dev.user-on-controls.json', userOnControls)
  } else {
    userOnControls = readJsonFile('./dev.user-on-controls.json')
  }
  return userOnControls;
}

async function getUserCredentials(userOnControls: Record<string, any>) {
  const entries = Object.entries(userOnControls) as [string, Record<string, any>][];
  const usersAndCredentials = Object.fromEntries(
      await Promise.all(entries.map(async (e) => {
        const [email, controls] = e;
        const user = users.find((u: any) => u.email === email);
        assert(user!!)
        // Client Credentials
        const cc: ClientCredentials = await obtainClientCredentials(user!, controls);
        // // Access Token & DPoP Key
        // const {accessToken, dpopKey} = await obtainAccessToken(cc, user.webId);
        return [user!.email, {
          user,
          controls,
          credentials: {
            clientCredentials: cc,
          }
        }]
      }))
  )
    return usersAndCredentials
}

async function transfer(rootDir: string, parentDir: string, _fetch: typeof fetch, controls:any) {
    const relDir = parentDir.replace(rootDir, '')
    const dirents =  fs.readdirSync(parentDir, {withFileTypes: true})
    // Transfer directories
    const dirs = dirents.filter(x => x.isDirectory())
    for await (const srcDir of dirs) {
        logger.info(`Transfer subdir: ${srcDir.name}`)
        const pathContainer = path.join(relDir, srcDir.name) + '/'
        const dstContainer = path.join(controls.pod, pathContainer)

        const containerExists = (await _fetch(dstContainer, { method: 'GET'})).status === 200
        if(!containerExists) {
            // Create container for subdir
            const container = await createContainerAt(dstContainer, {fetch: _fetch})
            logger.info('Created container:\n', container)
        } else {
            logger.info(`Container ${dstContainer} already exists!`)
        }

        // Transfer files within subdir
        await transfer(rootDir, path.join(parentDir, srcDir.name), _fetch, controls)
    }

    // Transfer files
    const srcFiles = dirents
        .filter(x => x.isFile())

    for await (const src of srcFiles) {
        const dst = path.join(controls.pod, relDir, src.name)
        const srcPath = path.join(parentDir, src.name);

        const extOnMime = new Map(Object.entries({
            'json': 'application/json',
            'jsonld': 'application/ld+json',
            'ttl': 'text/turtle'
        }))

        const [ext] = src.name.split('.').slice(-1)
        const mt = extOnMime.get(ext)

        if(!mt) {
            throw new Error(`Cannot find mime-type for extension: ${ext} (file: ${src.name})`)
        }

        const srcData = fs.readFileSync(srcPath, { encoding: 'utf-8' })
        const response = await _fetch(dst, {
            method: 'PUT',
            headers: { 'content-type': mt! },
            body: srcData
        });
    }
}

preflight()
  .then(getUserCredentials)
    .then(usersAndCredentials => {
        writeJsonFile('usersAndClientCredentials.json', usersAndCredentials);
        return usersAndCredentials
    })
    .then(async (usersAndCredentials)=> {
        logger.info('Loading intial data on pods')
        // load initial data on pods
        for await (const [email, userObject] of Object.entries(usersAndCredentials)) {
            const {credentials: { clientCredentials}, controls, user: { podName, webId}} = (userObject as any)
            const cssProxy = new CssProxy(clientCredentials, webId, controls)
            await cssProxy.intializeFetch();
            const pathActorDir = path.resolve(path.join('./actors', podName))
            // Initiate transfer
            const rootDir = pathActorDir
            const parentDir = pathActorDir
            await transfer(rootDir, parentDir, cssProxy.fetch!, controls)
        }
    })
  .then(() => console.log('Done'))
