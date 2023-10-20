import { readJsonFile } from "./util"
import { register } from "./register"


const [c0,c1] = readJsonFile('./common/css-users.json')

register(c0).then(console.log)
register(c1).then(console.log)