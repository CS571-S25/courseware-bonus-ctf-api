import { Express } from 'express';

import { CS571Route } from "@cs571/api-framework/src/interfaces/route";
import { BadgerBackee } from '../model/backee';
import { BadgerBacking } from '../model/backing';
import { CS571DbConnector } from '../services/db-connector';
import { CS571Auth } from '@cs571/api-framework/dist/services/auth';
import { getBid } from '../services/util';

export class CS571AddBackingRoute implements CS571Route {

    public static readonly ROUTE_NAME: string = (process.env['CS571_BASE_PATH'] ?? "") + '/backings';

    private readonly companies: string[];

    private readonly db: CS571DbConnector;
    private readonly auth: CS571Auth;

    public constructor(db: CS571DbConnector, auth: CS571Auth, backees: BadgerBackee[]) {
        this.db = db;
        this.auth = auth;
        this.companies = backees.map(b => b.name);
    }

    public addRoute(app: Express): void {
        app.post(CS571AddBackingRoute.ROUTE_NAME, (req, res) => {
            const bid = getBid(req);
            const amountStr = req.query.amn;
            const company = req.query.company as string;

            if (company && amountStr) {
                if (this.companies.includes(company)) {
                    let amn = Number(amountStr);
                    if (amn <= 25) {
                        if (Number.isInteger(amn)) {
                            this.db.canAfford(bid, amn).then(afford => {
                                if (afford) {
                                    ((n, cb) => cb(!!(n !== 0 && (((n | 0) === n) ? (n & 0x80000000) : ((1 / n) === -Infinity)))))(
                                        amn,
                                        (n: any) => {
                                            this.db.createPurchase(new BadgerBacking(company, amn), bid).then(() => {
                                                if (n) {
                                                    this.db.addEmailEntry(bid, this.auth.getUserFromRequest(req).email).then((fl) => {
                                                        res.status(200).send({
                                                            msg: "Purchased!",
                                                            additional_msg: "Congrats! You have broken your first API! 🎉",
                                                            flag: fl
                                                        })
                                                    })
                                                } else {
                                                    res.status(200).send({
                                                        msg: "Purchased!"
                                                    })
                                                }
                                            })
                                        }
                                    );
                                } else {
                                    res.status(400).send({
                                        msg: "You cannot afford this!"
                                    })
                                }
                            })
                        } else {
                            res.status(400).send({
                                msg: "Amounts must be integers"
                            })
                        }
                    } else {
                        res.status(400).send({
                            msg: "That is an invalid amount."
                        })
                    }
                } else {
                    res.status(404).send({
                        msg: "That company does not exist!"
                    })
                }
            } else {
                res.status(400).send({
                    msg: "Please specify both a company and an amount."
                })
            }
        })
    }

    public getRouteName(): string {
        return CS571AddBackingRoute.ROUTE_NAME;
    }
}