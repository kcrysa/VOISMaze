import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Game } from './entity/Game';
import * as dotenv from 'dotenv';
dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
  synchronize: true, // auto-creates tables in dev; use migrations in prod if needed
  logging: process.env.NODE_ENV !== 'production',
  entities: [Game],
});
