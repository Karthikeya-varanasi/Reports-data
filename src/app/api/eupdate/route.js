import { NextResponse } from "next/server";
import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://karthikvaranasi07:l39eu8xTl4lK9stI@cluster0.vbw2n.mongodb.net/?retryWrites=true&w=majority&appName=Karthik"
let client;

// Initialize MongoDB client once
if (!client) {
    client = new MongoClient(uri);
    // client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
}

// Function to update user
async function updateUser(Username, updatedFields) {
    try {
        await client.connect();
        const database = client.db('Application'); // Your database name
        const usersCollection = database.collection('Access'); // Your collection name

        // console.log(`Searching for user with userName: ${userName}`); // Log the userName being searched

        // Update the user
        const result = await usersCollection.updateOne(
            { Username: Username },
            { $set: updatedFields }
        );

        if (result.matchedCount === 0) {
            console.log('No matching user found.'); // Log if no user found
            throw new Error('User not found');
        }

        // Return updated user data
        return await usersCollection.findOne({ Username: Username });
    } catch (error) {
        console.error('Error updating user in database:', error);
        throw error; // Propagate error
    }finally{
        await client.close();
    }
}

// Handle PUT requests
export async function PUT(req) {
    // console.log('Request received:', req.method);

    try {
        const body = await req.json(); // Parse request body
        // console.log('Request Body:', body); // Log request body for debugging

        const { Username, ...updatedFields } = body;

        if (!Username) {
            return NextResponse.json({ message: 'userName is required' }, { status: 400 });
        }

        // console.log(`Updating user: ${userName} with fields:`, updatedFields); // Log fields to be updated

        const updatedUser = await updateUser(Username, updatedFields);
        return NextResponse.json({ message: 'User updated successfully', user: updatedUser }, { status: 200 });
    } catch (error) {
        console.error('Error in PUT handler:', error.message);
        return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
    }
}

// Cleanup MongoDB client when shutting down the server
process.on('exit', () => {
    client.close();
});