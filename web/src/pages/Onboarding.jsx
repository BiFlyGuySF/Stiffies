import { useState } from "react";

export default function Onboarding() {
  const [form, setForm] = useState({ name:"", age:"", tags:"" });

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h2 className="text-2xl font-semibold">Create Profile</h2>

      <input
        className="w-full border p-2 rounded"
        placeholder="Name"
        value={form.name}
        onChange={e=>setForm(s=>({...s,name:e.target.value}))}
      />

      <input
        className="w-full border p-2 rounded"
        placeholder="Age"
        type="number"
        value={form.age}
        onChange={e=>setForm(s=>({...s,age:e.target.value}))}
      />

      <input
        className="w-full border p-2 rounded"
        placeholder="I'm into (comma separated)"
        value={form.tags}
        onChange={e=>setForm(s=>({...s,tags:e.target.value}))}
      />

      <a className="inline-block px-4 py-2 rounded bg-black text-white" href="/map">
        Next
      </a>
    </div>
  );
}
