import axios from "axios";
import { faker } from "@faker-js/faker";
import mysql from 'mysql2/promise';
import bluebird from 'bluebird';
import * as dotenv from 'dotenv';

dotenv.config();
faker.locale = 'fr';

function randomChar() {
    const randomCharCodeLowerCase = () => Math.floor(Math.random() * ('Z'.charCodeAt(0) - 'A'.charCodeAt(0)) + 'A'.charCodeAt(0));
    return Math.random() > 0.5 ? String.fromCharCode(randomCharCodeLowerCase()) : String.fromCharCode(randomCharCodeLowerCase()).toUpperCase();
}

function addMonth(d: Date | string, months: number) {
    const date = new Date(d);
    const day = date.getDate();
    date.setMonth(date.getMonth() + +months);
    if (day !== date.getDate()) {
        date.setDate(0);
    }
    return date;
}

const format = (d: Date | string) => {
    const newD = new Date(d);
    return newD.toISOString().replace(/T[0-9:.Z]*/g, "");
}

function createRandomAgreement(directionId: string, departementId: string, vendorId: string) {
    const now = new Date();
    return {
        number: new Array(10).fill(0).map(() => randomChar()).join(''),
        type: Math.random() > 0.5 ? 'contract' : 'convension',
        amount: Math.floor(Math.random() * 1000 + 200),
        signature_date: format(now),
        expiration_date: format(addMonth(now, 2)),
        status: 'not_executed',
        url: '2ad66aba-d2b1-4c63-9b46-fd4b6be94388.pdf',
        object: "un champ reservee pour l'object",
        directionId,
        departementId,
        vendorId
    };
}

async function generateAgreements(directions: any[], vendorIds: string[]) {
    if (directions.length === 0 || vendorIds.length === 0) return;
    const arr = [];

    const count = parseInt(process.argv[2] ?? '1');
    for (let i = 0; i < count; i++) {
        const randomDirection = directions[Math.floor(Math.random() * directions.length)];
        const randomDepartement = randomDirection.departements[Math.floor(Math.random() * randomDirection.departements.length)];
        const randomVendorId = vendorIds[Math.floor(Math.random() * vendorIds.length)];

        const agreement = createRandomAgreement(randomDirection.id, randomDepartement.id, randomVendorId);
        console.log(agreement);
        arr.push(axios.post("http://localhost:8080/api/Agreements/test", agreement, {
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

        const [directionsRaw]: any = await connection.execute(`select * from directions`, []);
        const directions = [];
        for (const direction of directionsRaw) {
            const [departements]: any = await connection.execute("select * from departements where directionId = ?", [direction.id]);
            direction.departements = departements;
            directions.push(direction);
        }

        const [vendors]: any = await connection.execute(`select id from vendors`, []);
        const vendorIds = vendors.map((v: any) => v.id);

        await generateAgreements(directions, vendorIds);
        await connection.end();
    } catch (err) {
        console.error(err);
    }
})();
