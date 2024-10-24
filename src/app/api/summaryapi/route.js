
import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const uri = "mongodb+srv://karthikvaranasi07:l39eu8xTl4lK9stI@cluster0.vbw2n.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);
export async function GET(req) {
    try {
        const cookieData = cookies().getAll();
        const url = new URL(req.url);
        const searchParams = url.searchParams; 
        const employName = searchParams.get('employName');
        const start = searchParams.get('start');
        const end = searchParams.get('end');
        const time = searchParams.get('time');
        const button = searchParams.get('button');
        const names = searchParams.get('names');
        const accountKey = searchParams.get('accountKey');
        const option = searchParams.get('option');
        const activeGrid = searchParams.get('activeGrid');
        const Networks = {
            "Media.Net": "FB_Mnet",
            "Tonic.Net": "FB_Tonic",
        };
    
        const Timzone = {
            "UTC/Timezone": "UTC_date",
            "PDT/Timezone": "PDT_date",
            "EDT/Timezone": "EDT_date",
            "EEST/Timezone": "EEST_date",
            "HST/Timezone": "HST_date",
            "IST/Timezone": "IST_date",
            "BST/Timezone": "BST_date",
            "AST/Timezone": "AST_date",
            "CST/Timezone": "CST_date",
            "MST/Timezone": "MST_date",
            "GMT/Timezone": "GMT_date",
        }
        const Network =Networks[accountKey]
        let tzone = Timzone[time]
        if (!employName || !start|| !end) {
            return NextResponse.json({ error: 'Missing required query parameters' }, { status: 400 });
        }
        await client.connect();
        const database = client.db('Application');
        const collection = database.collection('Access');
        const result = await collection
            .find({ Username: employName })
            .project({ _id: 0, createdAt: 0, updatedAt: 0 })
            .toArray();
        if (!result.length) {
            await client.close();
            return NextResponse.json({ error: 'No data found for the specified user' }, { status: 404 });
        }
        const userData = result[0];
        const adAccounts = userData.adAccounts;
        const role = userData.Accesstype;
        console.log(role,"role")
        const buyercode = userData.buyercode;

        let totalCount = 0;
        let buyercodes = 0;
        let fetchPromises = [];
        let adAccount = {};
        if (!start || !end) {
            throw new Error('Start date or end date is missing.');
        }
        if (!tzone) {
            throw new Error(`Timezone is missing for ${timezone}`);
        }
        if (button === 'daily') {
            if (role === "user") {
                buyercodes = await handleDailyUserData(adAccounts, buyercode, start, end, tzone, database);
            } else {
                fetchPromises = await handleDailyAdminData(adAccounts, start, end, tzone, database);
            }
        } else {
            if (role === "user") {
                buyercodes = await handleLiveUserData(adAccounts, buyercode, start, end, tzone, database);
            } else {
                fetchPromises = await handleLiveAdminData(adAccounts, start, end, tzone, database);
            }
        }
        let fetchedAccounts;
        if (role === "user") {
            fetchedAccounts = buyercodes;
        } else {
            fetchedAccounts = await Promise.all(fetchPromises);
        }
        if (activeGrid === "hourly") {
            fetchedAccounts = await handleHourlyGrid(Network, option, names, start, end, tzone, database);
        } else if (activeGrid === "daily") {
            fetchedAccounts = await handleDailyGrid(Network, option, names, start, end, database);
        }

        const responseData = {
            fetchedAccounts,
            totalCount,
            userData,
            adAccount,
        };

        return NextResponse.json(responseData, { status: 200 });
    } catch (error) {
        console.error("Error occurred:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    } finally {
        await client.close();
    }
}
async function handleDailyUserData(adAccounts, buyercode, start, end, tzone, database) {
    let buyercodes = [];
    let fetchPromises = [];
    
    for (const label in adAccounts) {
        if (adAccounts.hasOwnProperty(label)) {
            const accounts = adAccounts[label];
            const main = label === 'FB_Mnet' ? 'Fb_Mnet_Daily' : label === 'FB_Tonic' ? 'Fb_Tonic_Daily' : null;

            if (!main) {
                console.error(`Invalid label provided: ${label}`);
                continue;
            }

            const mainCollection = database.collection(main);
            const adAccountData = accounts;

            for (const [subUser, accountNumbers] of Object.entries(adAccountData)) {
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
async function handleDailyAdminData(adAccounts, start, end, tzone, database) {
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

    return fetchPromises;
}
async function handleLiveUserData(adAccounts, buyercode, start, end, tzone, database) {
    let buyercodes = [];
    let fetchPromises = [];

    for (const label in adAccounts) {
        if (adAccounts.hasOwnProperty(label)) {
            const accounts = adAccounts[label];
            const main = label === 'FB_Mnet' ? 'Fb_Mnet_Live' : 'FB_Tonic_Live';
            if (!main) {
                console.error(`Invalid label provided: ${label}`);
                continue;
            }

            const mainCollection = database.collection(main);

            for (const [subUser, accountNumbers] of Object.entries(accounts)) {
                if (subUser === 'fetchedData') continue;
                for (const accNumber of accountNumbers) {
                    const promise = mainCollection
                        .find({
                            account_number: { $in: [accNumber] },
                            [tzone]: { $gte: start, $lte: end }
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
async function handleLiveAdminData(adAccounts, start, end, tzone, database) {
    let fetchPromises = [];

    for (const label in adAccounts) {
        if (adAccounts.hasOwnProperty(label)) {
            const accounts = adAccounts[label];
            const main = label === 'FB_Mnet' ? 'Fb_Mnet_Live' : 'Fb_Tonic_Live';
            if (!main) {
                console.error(`Invalid label provided: ${label}`);
                continue;
            }
            const mainCollection = database.collection(main);
            for (const [subUser, accountNumbers] of Object.entries(accounts)) {
                if (subUser === 'fetchedData') continue;
                for (const accNumber of accountNumbers) {
                    const promise = mainCollection
                        .find({
                            account_number: { $in: [accNumber] },
                            [tzone]: { $gte: start, $lte: end }
                        })
                        .project({ _id: 0, createdAt: 0, updatedAt: 0 })
                        .toArray();
                    fetchPromises.push(promise);
                }
            }
        }
    }

    return fetchPromises;
}
async function handleHourlyGrid(Network, option, names, start, end, tzone, database) {
    const main = Network === 'FB_Mnet' ? 'Fb_Mnet_Live' : 'Fb_Mnet_Live';
    const mainCollection = database.collection(main);
    const resultData = await mainCollection
        .find({
            [option]: names,
            [tzone]: { $gte: start, $lte: end }
        })
        .project({ _id: 0, createdAt: 0, updatedAt: 0 })
        .toArray();
    return resultData;
}
async function handleDailyGrid(Network, option, names, start, end, database) { 
    const main = Network === 'FB_Mnet' ? 'Fb_Mnet_Daily' : 'Fb_Mnet_Daily';
    const mainCollection = database.collection(main);
    let query = {
        [option]: names
    };
    if (start && end) {
        query.date_start = { $gte: start, $lte: end };
        console.log({ $gte: start, $lte: end }, "[]");
    }
    const resultData = await mainCollection
        .find(query)
        .project({ _id: 0, createdAt: 0, updatedAt: 0 })
        .toArray();
    return resultData;
}