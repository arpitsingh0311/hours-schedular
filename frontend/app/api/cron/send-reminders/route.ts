import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("quiet_hours_db");
    const schedulesCollection = db.collection("schedules");

    const now = new Date();
    const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);
    const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60 * 1000);

    const upcomingSchedules = await schedulesCollection.find({
      startTime: { $gte: tenMinutesFromNow, $lt: fifteenMinutesFromNow },
      reminderSent: { $ne: true },
    }).toArray();

    if (upcomingSchedules.length === 0) {
      return NextResponse.json({ message: 'No reminders to send.' });
    }

    for (const schedule of upcomingSchedules) {
      await resend.emails.send({
        from: 'onboarding@resend.dev', 
        to: schedule.userEmail,
        subject: `Reminder: Your session "${schedule.eventName}" starts in about 10 minutes!`,
        text: `This is a reminder that your scheduled quiet time for "${schedule.eventName}" is beginning soon at ${new Date(schedule.startTime).toLocaleTimeString()}.`,
      });

      await schedulesCollection.updateOne(
        { _id: schedule._id },
        { $set: { reminderSent: true } }
      );
    }

    return NextResponse.json({ message: `${upcomingSchedules.length} reminders sent successfully.` });
  } catch (error) {
    console.error("Error in CRON job:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}