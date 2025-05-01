import fs from 'fs'

import express, { Express } from 'express';

import { CS571DefaultPublicConfig, CS571Initializer } from '@cs571/api-framework'
import { CS571GetBackeesRoute } from './routes/get-backees';
import { BadgerBackee } from './model/backee';
import { CS571AddBackingRoute } from './routes/add-backing';
import { CS571DbConnector } from './services/db-connector';
import BonusSecretConfig from './model/configs/bonus-secret-config';
import { CS571WhoAmIRoute } from './routes/whoami';
import { CS571ResetBackingRoute } from './routes/reset-backing';

import cookies from "cookie-parser";


console.log("Welcome to Bonus API!");

const app: Express = express();
app.use(cookies());

const appBundle = CS571Initializer.init<CS571DefaultPublicConfig, BonusSecretConfig>(app, {
  allowNoAuth: [],
  skipAuth: false
});

const db = new CS571DbConnector(appBundle.config);
db.init();

const backees = JSON.parse(fs.readFileSync("includes/backees.json").toString()).map((b: BadgerBackee) => b)

appBundle.router.addRoutes([
  new CS571GetBackeesRoute(db, backees),
  new CS571AddBackingRoute(db, appBundle.auth, backees),
  new CS571WhoAmIRoute(appBundle.auth),
  new CS571ResetBackingRoute(db)
])

app.listen(appBundle.config.PORT, () => {
  console.log(`Running at :${appBundle.config.PORT}`);
});
