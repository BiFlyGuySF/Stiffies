export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-black via-slate-900 to-indigo-950 text-white">
      {/* subtle dotted grid */}
      <div className="absolute inset-0 dotted-grid opacity-30" />

      {/* glowing blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-[28rem] w-[28rem] rounded-full bg-fuchsia-500/25 glowblob" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-[32rem] w-[32rem] rounded-full bg-indigo-500/25 glowblob" />

      {/* nav */}
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <a href="/onboarding" className="text-2xl font-extrabold tracking-tight shiny-text hover:opacity-90 transition">
          STIFFIES
        </a>
        <a href="/map" className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur hover:bg-white/20">
          Enter the Map
        </a>
      </header>

      {/* hero */}
      <main className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 pb-20 pt-10 md:grid-cols-2 md:pt-16">
        <section className="space-y-6">
          <h1 className="text-5xl font-extrabold leading-tight md:text-6xl">
            Welcome to <span className="shiny-text">Stiffies</span>
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold opacity-90">
            Don’t Sniff, Get Stiff
          </h2>
          <p className="max-w-md opacity-80">
            Clear profiles. Real-time map. Safety by default. Flip between precise or approximate location anytime.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="/onboarding" className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black hover:scale-[1.03] active:scale-[.99] transition">
              Create your profile
            </a>
            <a href="/map" className="rounded-2xl border border-white/30 px-5 py-3 text-sm font-semibold hover:bg-white/10 transition">
              Jump to live map
            </a>
          </div>
          <ul className="mt-4 grid gap-1 text-sm opacity-80">
            <li>• Photo avatars as markers</li>
            <li>• Real-time movement</li>
            <li>• Privacy toggle: Approximate ↔ Precise</li>
          </ul>
        </section>

        {/* phone mock with floating effect */}
        <section className="mx-auto w-full max-w-md float">
          <div className="rounded-[2rem] border border-white/10 bg-black/40 p-3 shadow-2xl backdrop-blur">
            <div className="aspect-[9/16] overflow-hidden rounded-[1.5rem] bg-[url('https://images.unsplash.com/photo-1526259099246-514b5b7360a0?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center">
              <div className="grid h-full grid-cols-3 gap-3 p-4">
                {[
                  "https://i.pravatar.cc/200?img=11",
                  "https://i.pravatar.cc/200?img=12",
                  "https://i.pravatar.cc/200?img=13",
                  "https://i.pravatar.cc/200?img=14",
                  "https://i.pravatar.cc/200?img=15",
                  "https://i.pravatar.cc/200?img=16",
                ].map((src, i) => (
                  <div key={i} className="relative">
                    <img src={src} className="h-28 w-full rounded-full object-cover ring-2 ring-white/40" alt="" />
                    <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-black" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="pointer-events-none mx-auto mt-6 h-6 w-2/3 rounded-full bg-black/60 blur-2xl" />
        </section>
      </main>

      <footer className="relative z-10 mx-auto max-w-6xl px-6 pb-10 text-xs opacity-70">
        © {new Date().getFullYear()} Stiffies — All rights reserved.
      </footer>
    </div>
  );
}
