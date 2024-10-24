import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
const uri = "mongodb+srv://karthikvaranasi07:l39eu8xTl4lK9stI@cluster0.vbw2n.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
const client = new MongoClient(uri);
export async function GET() {
    try {
      await client.connect(); 
      const db = client.db("Application");
      const usersCollection = db.collection("Networks_info");
      const user = await usersCollection.findOne({});
      //  console.log(user,"db")
      if (user) {
        // localStorage.setItem('username', user.userName);
        return NextResponse.json({ message: "Login successful", user }, { status: 200 });
      } else {
        return NextResponse.json({ message: "Wrong credentials" }, { status: 401 });
      }
    } catch (error) {
      console.error("Login error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    } finally {
      await client.close();
    }
  }