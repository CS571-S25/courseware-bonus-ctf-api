import { Express } from 'express';

import { CS571Route } from "@cs571/api-framework/src/interfaces/route";
import { CS571DbConnector } from '../services/db-connector';
import { getBid } from '../services/util';

export class CS571ResetBackingRoute implements CS571Route {

    public static readonly ROUTE_NAME: string = (process.env['CS571_BASE_PATH'] ?? "") + '/backings';

    private readonly db: CS571DbConnector;

    public constructor(db: CS571DbConnector) {
        this.db = db;
    }

    public addRoute(app: Express): void {
        app.delete(CS571ResetBackingRoute.ROUTE_NAME, (req, res) => {
            const bid = getBid(req);
            this.db.resetPurchaseHistory(bid).then(() => {
                res.status(200).send({
                    msg: "Reset purchase history!"
                })
            })
        });
    }

    public getRouteName(): string {
        return CS571ResetBackingRoute.ROUTE_NAME;
    }
}