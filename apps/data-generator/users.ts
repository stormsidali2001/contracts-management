import axios from "axios";
import { faker } from "@faker-js/faker";
import mysql from 'mysql2/promise';
import bluebird from 'bluebird';
import * as dotenv from 'dotenv';

dotenv.config();
faker.locale = 'fr';

const randomElemenetFromArray = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
const ROLES = ['JURIDICAL', 'EMPLOYEE', 'ADMIN'];

function createRandomUser(directionId: string, departementId: string) {
    return {
        username: faker.internet.userName(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: faker.internet.email(),
        role: randomElemenetFromArray(ROLES),
        departementId,
        directionId,
        password: '123456',
    };
}

async function generateUsers(directions: Record<string, string[]>) {
    if (Object.keys(directions).length === 0) return;
    const arr = [];

    const count = parseInt(process.argv[2] ?? '1');
    for (let i = 0; i < count; i++) {
        const randomDirection = randomElemenetFromArray(Object.keys(directions));
        if (directions[randomDirection]?.length === 0) continue;
        const randomDepartement = randomElemenetFromArray(directions[randomDirection]);
        const user = createRandomUser(randomDirection, randomDepartement);
        console.log(user);
        arr.push(axios.post("http://localhost:8080/api/auth/register/test", { ...user }, {
            headers: { 'Content-Type': 'application/json' }
        }));
    }
    try {
        await Promise.all(arr);
    } catch (err: any) {
        console.error(err.message);
    }
}

(async function main() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.MYSQL_DATABASE_HOST,
            user: process.env.MYSQL_USERNAME,
            database: process.env.MYSQL_DATABASE_NAME,
            password: process.env.MYSQL_PASSWORD,
            Promise: bluebird as any
        });

        const [directionsRaw]: any = await connection.execute(`
            select 
            dr.id as directionId,
            dp.id as departementId
            from directions dr inner join departements dp 
            where dp.directionId = dr.id;
        `);

        const directions: Record<string, string[]> = {};
        for (const directionRaw of directionsRaw) {
            const { directionId, departementId } = directionRaw;
            if (directions[directionId] === undefined) directions[directionId] = [departementId];
            else directions[directionId].push(departementId);
        }

        await generateUsers(directions);
        await connection.end();
    } catch (err) {
        console.error(err);
    }
})();
