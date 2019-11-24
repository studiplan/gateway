import RxSession from "neo4j-driver/types/session-rx";
import { Observable } from "rxjs";


export type Ctx = {
    rxSession: RxSession;
    queryNode: <T>(query: string) => Observable<T>;
};
