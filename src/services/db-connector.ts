
import { DataTypes, Sequelize, ModelStatic } from "sequelize";
import { CS571Config, CS571DefaultPublicConfig } from "@cs571/api-framework";

import crypto from 'crypto'
import BonusSecretConfig from "../model/configs/bonus-secret-config";
import { BadgerBacking } from "../model/backing";

export class CS571DbConnector {

    private badgerBackingsTable!: ModelStatic<any>;
    private ctfEntriesTable!: ModelStatic<any>;

    private readonly sequelize: Sequelize;
    private readonly config: CS571Config<CS571DefaultPublicConfig, BonusSecretConfig>;

    public constructor(config: CS571Config<CS571DefaultPublicConfig, BonusSecretConfig>) {
        this.config = config;
        this.sequelize = new Sequelize(
            this.config.SECRET_CONFIG.SQL_CONN_DB,
            this.config.SECRET_CONFIG.SQL_CONN_USER,
            this.config.SECRET_CONFIG.SQL_CONN_PASS,
            {
                host: this.config.SECRET_CONFIG.SQL_CONN_ADDR,
                port: this.config.SECRET_CONFIG.SQL_CONN_PORT,
                dialect: 'mysql',
                retry: {
                    max: Infinity,
                    backoffBase: 5000
                }
            }
        );
    }

    public async init() {
        await this.sequelize.authenticate();
        this.badgerBackingsTable = await this.sequelize.define("BadgerBacking", {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                unique: true,
                allowNull: false
            },
            badger_id: {
                type: DataTypes.STRING(128),
                allowNull: false
            },
            company: {
                type: DataTypes.STRING(128),
                allowNull: false
            },
            amount: {
                type: DataTypes.INTEGER,
                allowNull: false
            }
        });
        await this.sequelize.sync()
        this.ctfEntriesTable = await this.sequelize.define("CTF", {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                unique: true,
                allowNull: false
            },
            flag: {
                type: DataTypes.STRING(128),
                allowNull: false
            },
            badger_id: {
                type: DataTypes.STRING(128),
                allowNull: false
            },
            email: {
                type: DataTypes.STRING(256),
                allowNull: false
            }
        });
        await this.sequelize.sync()
    }

    public async addEmailEntry(badger_id: string, email: string): Promise<string> {
        const flag = "flag_" + crypto.createHmac("sha256", this.config.SECRET_CONFIG.CTF_SECRET).update(email).digest('hex');
        const doesExist = await this.ctfEntriesTable.findOne({ where: { email } });
        if (!doesExist) {
            await this.ctfEntriesTable.create({
                badger_id: badger_id,
                flag: flag,
                email: email
            });
        }
        return flag;
    }

    public async resetPurchaseHistory(badger_id: string): Promise<void> {
        await this.badgerBackingsTable.destroy({ where: { badger_id } });
    }

    public async getPurchaseHistory(badger_id: string): Promise<BadgerBacking[] | undefined> {
        const purchases = await this.badgerBackingsTable.findAll({ where: { badger_id } });
        return purchases ? purchases.map(p => new BadgerBacking(p.company, p.amount)) : undefined;
    }

    public async createPurchase(backing: BadgerBacking, bid: string): Promise<void> {
        await this.badgerBackingsTable.create({
            company: backing.company,
            amount: backing.amount,
            badger_id: bid
        });
    }

    public async canAfford(badger_id: string, amn: number): Promise<boolean> {
        const purchases = await this.badgerBackingsTable.findAll({ where: { badger_id } });
        return amn <= 500 - (purchases ? purchases.reduce((acc: number, curr: BadgerBacking) => acc + curr.amount, 0) : 0);
    }
}