
import { MongoClient } from "mongodb";
const uri = "mongodb+srv://karthikvaranasi07:l39eu8xTl4lK9stI@cluster0.vbw2n.mongodb.net/?retryWrites=true&w=majority&appName=Karthik"
let client;


export async function POST(req) {
    try {
        if (!client) {
            client = new MongoClient(uri);
        }
        const userData = await req.json(); 
        if (!userData || !userData.Username || !userData.Password) {
            return new Response(JSON.stringify({ message: "Missing Username or Password" }), { status: 400 });
        }
        await client.connect();
        const db = client.db("Application");
        const usersCollection = db.collection("Access");
        const result = await usersCollection.insertOne(userData);
        return new Response(
            JSON.stringify({ message: "User added successfully", insertedId: result.insertedId }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error:', error);
        return new Response(JSON.stringify({ error: 'Failed to process request' }), { status: 500 });
    } finally {
        await client.close();
    }
}