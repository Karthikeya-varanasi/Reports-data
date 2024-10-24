import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
const uri = "mongodb+srv://karthikvaranasi07:l39eu8xTl4lK9stI@cluster0.vbw2n.mongodb.net/?retryWrites=true&w=majority&appName=Karthik"
export async function GET(req) {
    const client = new MongoClient(uri);
    
    try {
        const cookieData = cookies().getAll();
        const url = new URL(req.url);
        const searchParams = url.searchParams; 
        const user = searchParams.get('user');
        const start = searchParams.get('start');
        const end = searchParams.get('end');
        const time = searchParams.get('time');

        const Timzone = {
            "UTC/Timezone": "UTC_date",
        };

        let Timzones = Timzone[time];

        if (!user || !start || !end) {
            return NextResponse.json({ error: 'Missing required query parameters' }, { status: 400 });
        }
        await client.connect();
        const database = client.db('Application');
        const collection = database.collection('Access');
        const result = await collection
            .find({ Username: user })
            .project({ _id: 0, createdAt: 0, updatedAt: 0 })
            .toArray();

        if (!result.length) {
            await client.close();
            return NextResponse.json({ error: 'No data found for the specified user' }, { status: 404 });
        }

        const userinfo = result[0];
        const adAccounts = userinfo.adAccounts;
        const role = userinfo.Accesstype;
        const buyercode = userinfo.buyercode;

        let fetchedAccounts;
        let misdata;
        if (role === "user") {
            fetchedAccounts = await handleDailyUserData(adAccounts, buyercode, start, end, Timzones, database);
        } else {
            fetchedAccounts = await handleDailyAdminData(adAccounts, buyercode, start, end, Timzones, database);
             misdata = await Mis(adAccounts, buyercode, start, end, Timzones, database);
            //    console.log(misdata,"missiondata")
        }

        const responseData = {
            fetchedAccounts,
            userinfo,
            misdata,
        };

        return NextResponse.json(responseData, { status: 200 });

    } catch (error) {
        console.error("Error occurred:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    } finally {
        await client.close();
    }
}

async function handleDailyUserData(adAccounts, buyercode, start, end, Timzones, database) {
    let buyercodes = [];
    let fetchPromises = [];
    
    for (const label in adAccounts) {
        if (adAccounts.hasOwnProperty(label)) {
            const accounts = adAccounts[label];
            const main = label === 'FB_Mnet' ? 'Fb_Mnet_Daily' : label === 'FB_Tonic' ? 'Fb_Tonic_Daily' : null;

            if (!main) {
                console.error(`Invalid label provided: label`);
                continue;
            }

            const mainCollection = database.collection(main);
            for (const [subUser, accountNumbers] of Object.entries(accounts)) {
                if (subUser === 'fetchedData') continue;
                for (const accNumber of accountNumbers) {
                    const promise = mainCollection
                        .find({
                            account_number: { $in: [accNumber] },
                            date_start: { $gte: start, $lte: end },
                        })
                        .project({ _id: 0, createdAt: 0, updatedAt: 0 })
                        .toArray();
                    fetchPromises.push(promise);
                }
            }

            const check = await Promise.all(fetchPromises);
            buyercodes = check.flat().filter(item => buyercode.includes(item.buyercode));
        }
    }

    return buyercodes;
}

async function handleDailyAdminData(adAccounts, buyercode, start, end, Timzones, database) {
    console.log("Database in Admin:", "database");  
    let fetchPromises = [];

    for (const label in adAccounts) {
        if (adAccounts.hasOwnProperty(label)) {
            const accounts = adAccounts[label];
            const main = label === 'FB_Mnet' ? 'Fb_Mnet_Daily' : 'FB_Tonic_Daily';

            if (!main) {
                console.error(`Invalid label provided: ${label}`);
                continue;
            }

            const mainCollection = database.collection(main);
            for (const [subUser, accountNumbers] of Object.entries(accounts)) {
                // console.log([subUser, accountNumbers], "ad");
                if (subUser === 'fetchedData') continue;
                for (const accNumber of accountNumbers) {
                    const promise = mainCollection
                        .find({
                            account_number: { $in: [accNumber] },
                            date_start: { $gte: start, $lte: end },
                        })
                        .project({ _id: 0, createdAt: 0, updatedAt: 0 })
                        .toArray();
                    fetchPromises.push(promise);
                }
            }
        }
    }

    return await Promise.all(fetchPromises);
}


async function Mis(adAccounts, buyercode, start, end, Timzones, database) {

    let fetchPromises = [];

    for (const label in adAccounts) {
        if (adAccounts.hasOwnProperty(label)) {
            const accounts = adAccounts[label];
            const main = label === 'FB_Mnet' ? 'All_Network' : 'All_Network';

            if (!main) {
                console.error(`Invalid label provided: ${label}`);
                continue;
            }

            const mainCollection = database.collection(main);

            const promise = mainCollection
            .find({
                date: { $gte: start, $lte: end },
            })
            .project({ _id: 0, createdAt: 0, updatedAt: 0 })
            .toArray();
        fetchPromises.push(promise);
        }
    }

    return await Promise.all(fetchPromises);
}