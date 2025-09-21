import { createClient } from '@/lib/supabase/server'; 
import { redirect } from 'next/navigation';
import clientPromise from '@/lib/mongodb';
import ScheduleForm from './ScheduleForm';

export default async function Dashboard() {
  const supabase = createClient(); 

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const client = await clientPromise;
  const db = client.db("quiet_hours_db");
  const schedules = await db.collection("schedules").find({ userId: user?.id }).sort({ startTime: 1 }).toArray();

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Quiet Hours</h1>
        <form action="/auth/signout" method="post">
          <button type="submit" className="bg-gray-200 px-4 py-2 rounded text-black">Sign out</button>
        </form>
      </div>

      <ScheduleForm />

      <div className="mt-8">
        <h2 className="text-xl font-semibold">Upcoming Sessions</h2>
        <ul>
          {schedules.map((schedule) => (
            <li key={schedule._id.toString()} className="mt-2 p-4 border rounded">
              <p className="font-bold">{schedule.eventName}</p>
              <p>{new Date(schedule.startTime).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}