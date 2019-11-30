import RxSession from "neo4j-driver/types/session-rx";
import { Observable } from "rxjs";

export type DBSession = RxSession & { uuid: string };

export type Ctx = {
    rxSession: DBSession;
    queryNode: <T>(query: string) => Observable<T>;
};
