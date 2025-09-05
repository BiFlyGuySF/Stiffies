import { useParams } from "react-router-dom";

export default function Chat() {
  const { id } = useParams();

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <h2 className="text-xl font-semibold">Chat with User #{id}</h2>

      <div className="h-64 border rounded p-2 overflow-auto">
        No messages yet
      </div>

      <div className="flex gap-2">
        <input className="flex-1 border rounded p-2" placeholder="Message"/>
        <button className="px-3 py-2 rounded bg-black text-white">Send</button>
      </div>
    </div>
  );
}
