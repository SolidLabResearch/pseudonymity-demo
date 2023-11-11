import {CssProxy} from "./CssProxy";
import {readJsonFile} from "../../utils/io";


async function run() {
    console.log('>>> anonymizer/service.ts')
    // const anonymizer = new Anonymizer(proxy, targetService)
    const usersAndCredentials = readJsonFile('./usersAndClientCredentials.json')
    const aliceCredentials = usersAndCredentials['alice@example.com'];
    const anonCredentials = usersAndCredentials['anon@example.com'];
    const cssProxy = new CssProxy(aliceCredentials.credentials.clientCredentials, aliceCredentials.user.webId)
    await cssProxy.intializeFetch();

    // const response = await (await cssProxy.fetch!(aliceCredentials.user.webId)).text()
    // console.log(response)
}

run().then().catch(console.error)


//
// const app: Express = express();
// app.use(bodyParser.json())
// app.use((req, res, next) => {
//     const { method, url } = req
//     console.log(`${method}\t${url}`)
//     next()
// })
//
// function relPath(x: string): string {
//     return x.replace(origin,'')
// }
//
// app.get(relPath(endpoints.anonymizer.exchange.diploma.init), (req:Request, res:Response) => {
//
// })
