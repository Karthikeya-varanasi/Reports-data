import { NextResponse } from "next/server";
import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://karthikvaranasi07:l39eu8xTl4lK9stI@cluster0.vbw2n.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);
export async function GET() {
    try {
      await client.connect();
      const db = client.db("Application");
      const usersCollection = db.collection("Access");
      const users = await usersCollection.find({}).toArray(); 
      // console.log(users, "db");
        
      if (users.length > 0) {
        // Assuming you want to return the first user or all users based on your logic
        return NextResponse.json({ message: "Login successful", users }, { status: 200 });
      } else {
        return NextResponse.json({ message: "No users found" }, { status: 401 });
      }
    } catch (error) {
      console.error("Login error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    } finally {
      await client.close(); 
    }
  }