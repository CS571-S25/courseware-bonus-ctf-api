import { Express } from 'express';

import { CS571Route } from "@cs571/api-framework/src/interfaces/route";
import { BadgerBackee } from '../model/backee';
import { CS571DbConnector } from '../services/db-connector';
import { BadgerBacking } from '../model/backing';
import { getBid } from '../services/util';

export class CS571GetBackeesRoute implements CS571Route {

    public static readonly ROUTE_NAME: string = (process.env['CS571_BASE_PATH'] ?? "") + '/backees';

    private readonly db: CS571DbConnector;
    private readonly backees: BadgerBackee[];

    public constructor(db: CS571DbConnector, backees: BadgerBackee[]) {
        this.db = db;
        this.backees = [...backees];
    }

    public addRoute(app: Express): void {
        app.get(CS571GetBackeesRoute.ROUTE_NAME, (req, res) => {
            const bid = getBid(req);
            this.db.getPurchaseHistory(bid).then((purchases: BadgerBacking[] | undefined) => {
                res.status(200).send(this.backees.map(b => {
                    return {
                        ...b,
                        amountGiven: purchases?.filter(p => p.company === b.name).reduce((acc: number, pur: BadgerBacking) => acc + pur.amount, 0) ?? 0
                    }
                }));
            })
        })
    }

    public getRouteName(): string {
        return CS571GetBackeesRoute.ROUTE_NAME;
    }
}