(() => {
  const permEl = document.getElementById('perm');
  const youEl  = document.getElementById('you');
  const gridEl = document.getElementById('grid');
  const refreshBtn = document.getElementById('refreshBtn');

  const km = (m) => (m/1000).toFixed(m < 10000 ? 2 : 1);
  const toFixed = (n, d=5) => Number.parseFloat(n).toFixed(d);

  function distanceMeters(a, b) {
    const R = 6371e3;
    const φ1 = a.lat * Math.PI/180, φ2 = b.lat * Math.PI/180;
    const dφ = (b.lat-a.lat) * Math.PI/180;
    const dλ = (b.lng-a.lng) * Math.PI/180;
    const s = Math.sin(dφ/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(dλ/2)**2;
    return 2 * R * Math.asin(Math.sqrt(s));
  }

  function randomName() {
    const A = ["Zac","Milo","Ace","Jax","Kai","Leo","Nico","Rey","Theo","Rex","Owen","Beau","Eli","Drew","Cruz","Phoenix","Ryder","Remy","Shawn","Tate","Grey"];
    const B = ["SF","SoMa","Castro","Sunset","Bay","City","Fog","Noe","Mission","Marina","Haight","Tender","Dogpatch","Potrero","Nob","Twin","Bernal","Glen"];
    return `${A[Math.floor(Math.random()*A.length)]} • ${B[Math.floor(Math.random()*B.length)]}`;
  }

  function seededRand(seed) {
    let s = seed % 2147483647; if (s <= 0) s += 2147483646;
    return () => (s = s * 16807 % 2147483647) / 2147483647;
  }

  function genMockUsers(center, count=24) {
    const key = 'stiffies_mock_users_v1';
    const cached = localStorage.getItem(key);
    if (cached) { try { const p = JSON.parse(cached); if (Array.isArray(p) && p.length) return p; } catch {}
    }
    const seed = Math.round(center.lat*1000)*100000 + Math.round(center.lng*1000);
    const rnd = seededRand(seed);
    const out = [];
    for (let i=0; i<count; i++) {
      const maxMeters = 5000;
      const r = Math.sqrt(rnd()) * maxMeters;
      const t = rnd()*Math.PI*2;
      const dy = (r * Math.cos(t)) / 111320;
      const dx = (r * Math.sin(t)) / (111320 * Math.cos(center.lat*Math.PI/180));
      const lat = center.lat + dy;
      const lng = center.lng + dx;

      out.push({
        id: i+1,
        name: randomName(),
        age: 21 + Math.floor(rnd()*22),
        lat, lng,
        bio: ["Looking","Chat first","No drama","Gym later?","Pizza + movie","Night owl"][Math.floor(rnd()*6)],
        img: `https://robohash.org/${seed}-${i}?set=set1&size=400x400`
      });
    }
    localStorage.setItem(key, JSON.stringify(out));
    return out;
  }

  function render(center, users) {
    youEl.textContent = `You: ${toFixed(center.lat,5)}, ${toFixed(center.lng,5)}`;
    const enriched = users.map(u => ({...u, d: distanceMeters(center, {lat: u.lat, lng: u.lng})}))
                          .sort((a,b) => a.d - b.d);
    gridEl.innerHTML = '';
    for (const u of enriched) {
      const card = document.createElement('article');
      card.className = 'card';

      const pfp = document.createElement('div');
      pfp.className = 'pfp';
      const img = document.createElement('img');
      img.loading = 'lazy'; img.alt = `${u.name}`; img.src = u.img;
      pfp.appendChild(img);

      const badge = document.createElement('div');
      badge.className = 'badge';
      badge.textContent = `${km(u.d)} km`;
      pfp.appendChild(badge);

      const info = document.createElement('div'); info.className = 'info';
      const top = document.createElement('div'); top.className = 'name';
      const n = document.createElement('div'); n.className = 'n'; n.textContent = `${u.name}`;
      const age = document.createElement('div'); age.className = 'km'; age.textContent = `${u.age}`;
      top.appendChild(n); top.appendChild(age);

      const meta = document.createElement('div'); meta.className = 'meta';
      meta.textContent = u.bio;

      info.appendChild(top); info.appendChild(meta);
      card.appendChild(pfp); card.appendChild(info);
      gridEl.appendChild(card);
    }
  }

  function getLocationOnce() {
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) return reject(new Error('Geolocation not supported'));
      navigator.geolocation.getCurrentPosition(
        pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        err => reject(err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  }

  function setPerm(text, ok=false) {
    permEl.textContent = text;
    permEl.style.borderColor = ok ? '#14532d' : '#334155';
    permEl.style.background = ok ? 'rgba(16,185,129,.12)' : 'var(--chip)';
  }

  async function boot() {
    try {
      setPerm('Requesting location…');
      const center = await getLocationOnce();
      setPerm('Location active', true);
      localStorage.setItem('stiffies_me', JSON.stringify(center));
      const users = genMockUsers(center, 24);
      render(center, users);
    } catch (e) {
      if (e.code === 1) setPerm('Permission denied. Enable location for this site.');
      else if (e.code === 2) setPerm('Position unavailable. Try again.');
      else if (e.code === 3) setPerm('Timed out. Tap refresh.');
      else setPerm('Location error. Check browser settings.');
      youEl.textContent = '—';
    }
  }

  refreshBtn.addEventListener('click', boot);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) boot(); });
  boot();
})();
