import {SolidVCActor} from "./SolidVCActor";
import {DidKeyVCActor} from "./DidKeyVCActor";
import {CompoundCredentialActor} from "./CompoundCredentialActor";

export class WebIdOnDidKeyActor extends CompoundCredentialActor<SolidVCActor, DidKeyVCActor> {}
