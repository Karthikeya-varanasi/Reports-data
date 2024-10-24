import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri = "mongodb+srv://karthikvaranasi07:l39eu8xTl4lK9stI@cluster0.vbw2n.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";


const client = new MongoClient(uri);
export async function POST(req) {
    try {
      const { Username, Password } = await req.json(); 
  
      if (!Username || !Password) {
        return NextResponse.json({ message: "Missing Username or Password" }, { status: 400 });
      }
  
      await client.connect();
      const db = client.db("Application");
      const usersCollection = db.collection("Access");
  
      const user = await usersCollection.findOne({ Username, Password });
  
      if (user) {
        if (user.Userstatus === 'Active') {
          return NextResponse.json({ message: "Login successful", user }, { status: 200 });
        } else {
          return NextResponse.json({ message: " Your account Logins are inactive status.Please contact admin.", user }, { status: 403 });
        }
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