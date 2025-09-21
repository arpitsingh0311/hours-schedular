'use client';
import { useRouter } from 'next/navigation';

export default function ScheduleForm() {
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const eventName = formData.get('eventName') as string;
    const startTime = formData.get('startTime') as string;

    await fetch('/api/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventName, startTime }),
    });

    router.refresh();
    (event.target as HTMLFormElement).reset();
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-medium mb-4 text-black">Schedule a New Session</h3>
      <div className="flex flex-col gap-4">
        <input name="eventName" type="text" placeholder="Event Name (e.g., Deep Work)" required className="p-2 border rounded text-black" />
        <input name="startTime" type="datetime-local" required className="p-2 border rounded text-black" />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Add Schedule
        </button>
      </div>
    </form>
  );
}