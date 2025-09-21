import { createClient } from '@/lib/supabase/server'; 
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request: Request) {
  const supabase = createClient(); 

  const { data: { user } } = await supabase.auth.getUser(); 

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { eventName, startTime } = await request.json();

  const client = await clientPromise;
  const db = client.db("quiet_hours_db");
  console.log("Inserting schedule for user:", user.id, user.email);
  await db.collection("schedules").insertOne({
    userId: user.id,
    userEmail: user.email, 
    eventName,
    startTime: new Date(startTime),
    reminderSent: false,
  });

  return NextResponse.json({ message: 'Schedule created' }, { status: 201 });
}