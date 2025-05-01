import { Express } from 'express';

import { CS571Route } from "@cs571/api-framework/src/interfaces/route";
import { CS571Auth } from '@cs571/api-framework/dist/services/auth';

export class CS571WhoAmIRoute implements CS571Route {

    public static readonly ROUTE_NAME: string = (process.env['CS571_BASE_PATH'] ?? "") + '/whoami';

    private readonly auth: CS571Auth;

    public constructor(auth: CS571Auth) {
        this.auth = auth;
    }

    public addRoute(app: Express): void {
        app.get(CS571WhoAmIRoute.ROUTE_NAME, (req, res) => {
            res.send({
                email: this.auth.getUserFromRequest(req).email
            });
        })
    }

    public getRouteName(): string {
        return CS571WhoAmIRoute.ROUTE_NAME;
    }
}