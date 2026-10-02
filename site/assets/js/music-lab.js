/* Music Lab — a beginner-friendly song maker.

   One sheet of graph paper: rows are the notes of the scale (highest at the
   top), columns are eighth notes, and the strip along the bottom is the beat.
   You pick one sound for the notes and one drum for the beat, paint notes in,
   and press play. Sound is generated live with the Web Audio API — no samples,
   no downloads, no backend. */
(function () {
  const el = (id) => document.getElementById(id);

  const ROWS = 8;                                /* C up to the C above it */
  const DRUM_ROW = -1;                           /* the beat strip */
  const STEPS_PER_BAR = 8;                       /* eighth notes in 4/4 */
  const MAX_BARS = 64;                           /* 512 beats is plenty "endless" */
  const SEMITONES = [0, 2, 4, 5, 7, 9, 11, 12];  /* the major scale, in order */
  const NAMES = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C'];
  const MIDDLE_C = 261.6256;

  const SOUNDS = [
    { id: 'marimba', label: 'Marimba' },
    { id: 'piano', label: 'Piano' },
    { id: 'bell', label: 'Bells' },
    { id: 'pluck', label: 'Guitar' },
    { id: 'synth', label: 'Synth' },
    { id: 'pad', label: 'Strings' },
    { id: 'bass', label: 'Bass' },
    { id: 'chip', label: '8-bit' }
  ];

  const DRUMS = [
    { id: 'kick', label: 'Kick' },
    { id: 'snare', label: 'Snare' },
    { id: 'hihat', label: 'Hi-hat' }
  ];

  const soundExists = (id) => SOUNDS.some((sound) => sound.id === id);
  const drumExists = (id) => DRUMS.some((drum) => drum.id === id);

  /* ----------------------------------------------------------------- sound */

  const Sound = (function () {
    let ctx = null;
    let master = null;
    let noise = null;

    function ensure() {
      if (!ctx) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return null;
        ctx = new Ctx();
        master = ctx.createGain();
        master.gain.value = 0.8;
        master.connect(ctx.destination);
      }
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    }

    function noiseBuffer() {
      if (!noise) {
        const length = Math.floor(ctx.sampleRate * 0.6);
        noise = ctx.createBuffer(1, length, ctx.sampleRate);
        const data = noise.getChannelData(0);
        for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
      }
      return noise;
    }

    /* One oscillator with an attack/decay envelope and an optional sweeping
       low-pass, which is enough to fake every instrument in the list. */
    function tone(type, freq, when, dur, peak, gain, opts) {
      if (!ctx) return;
      const options = opts || {};
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.setValueAtTime(Math.max(freq, 20), when);
      if (options.sweepTo) osc.frequency.exponentialRampToValueAtTime(options.sweepTo, when + dur);

      let node = osc;
      if (options.filter) {
        const filter = ctx.createBiquadFilter();
        filter.type = options.filter.type || 'lowpass';
        filter.Q.value = options.filter.q || 0.8;
        filter.frequency.setValueAtTime(options.filter.from, when);
        if (options.filter.to) {
          filter.frequency.exponentialRampToValueAtTime(options.filter.to, when + dur);
        }
        osc.connect(filter);
        node = filter;
      }

      const shape = ctx.createGain();
      const attack = options.attack || 0.008;
      shape.gain.setValueAtTime(0.0001, when);
      shape.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), when + attack);
      shape.gain.exponentialRampToValueAtTime(0.0001, when + dur);

      const out = ctx.createGain();
      out.gain.value = gain;

      node.connect(shape);
      shape.connect(out);
      out.connect(master);
      osc.start(when);
      osc.stop(when + dur + 0.1);
    }

    function noiseHit(when, dur, peak, gain, highpass) {
      if (!ctx) return;
      const src = ctx.createBufferSource();
      src.buffer = noiseBuffer();
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = highpass;
      const shape = ctx.createGain();
      shape.gain.setValueAtTime(peak, when);
      shape.gain.exponentialRampToValueAtTime(0.0001, when + dur);
      const out = ctx.createGain();
      out.gain.value = gain;
      src.connect(filter);
      filter.connect(shape);
      shape.connect(out);
      out.connect(master);
      src.start(when);
      src.stop(when + dur + 0.05);
    }

    function play(instrument, freq, when, dur, gain) {
      switch (instrument) {
        case 'piano':
          tone('triangle', freq, when, dur * 1.9, 0.5, gain);
          tone('sine', freq * 2, when, dur * 1.1, 0.12, gain);
          break;
        case 'marimba':
          tone('sine', freq, when, dur * 0.9, 0.55, gain);
          tone('sine', freq * 4, when, dur * 0.3, 0.07, gain);
          break;
        case 'bell':
          tone('sine', freq, when, dur * 2.6, 0.34, gain);
          tone('sine', freq * 2.76, when, dur * 1.7, 0.1, gain);
          break;
        case 'pluck':
          tone('sawtooth', freq, when, dur * 1.05, 0.32, gain, { filter: { from: 3200, to: 700, q: 6 } });
          break;
        case 'synth':
          tone('sawtooth', freq, when, dur * 1.1, 0.26, gain, { filter: { from: 3400, to: 500, q: 8 } });
          break;
        case 'pad':
          tone('sawtooth', freq * 0.994, when, dur * 1.9, 0.15, gain, { attack: 0.32, filter: { from: 1700, q: 1 } });
          tone('sawtooth', freq * 1.006, when, dur * 1.9, 0.15, gain, { attack: 0.32, filter: { from: 1700, q: 1 } });
          break;
        case 'bass':
          tone('sine', freq, when, dur * 1.5, 0.6, gain);
          tone('triangle', freq * 2, when, dur * 0.9, 0.16, gain);
          break;
        case 'chip':
          tone('square', freq, when, dur * 0.55, 0.17, gain);
          break;
        case 'kick':
          tone('sine', 150, when, dur * 0.9, 0.9, gain, { sweepTo: 45, attack: 0.004 });
          break;
        case 'snare':
          noiseHit(when, dur * 0.6, 0.4, gain, 1400);
          tone('triangle', 190, when, dur * 0.3, 0.18, gain);
          break;
        case 'hihat':
          noiseHit(when, dur * 0.22, 0.18, gain, 7000);
          break;
        default:
          tone('sine', freq, when, dur, 0.4, gain);
      }
    }

    return { ensure, play };
  })();

  /* ------------------------------------------------------------------ song */

  let song = { bpm: 110, bars: 2, sound: 'marimba', drum: 'kick', notes: new Set(), hits: new Set() };
  let cellMap = new Map();  /* "row:step" -> button */
  let playCells = [];       /* [step] -> [buttons] */
  let headStep = -1;
  let undoStack = [];
  let playing = false;
  let schedStep = 0;
  let nextTime = 0;
  let ticker = 0;
  let headQueue = [];
  let dragging = false;
  let dragMode = 'add';

  const totalSteps = () => song.bars * STEPS_PER_BAR;
  const stepDuration = () => (60 / song.bpm) / 2;
  const key = (row, step) => row + ':' + step;
  const freqOf = (row) => MIDDLE_C * Math.pow(2, SEMITONES[row] / 12);

  function hasNote(row, step) {
    return row === DRUM_ROW ? song.hits.has(step) : song.notes.has(key(row, step));
  }

  function setNote(row, step, on) {
    if (row === DRUM_ROW) {
      if (on) song.hits.add(step);
      else song.hits.delete(step);
      return;
    }
    const id = key(row, step);
    if (on) song.notes.add(id);
    else song.notes.delete(id);
  }

  /* ---------------------------------------------------------------- presets */

  const PRESETS = [
    {
      name: 'Twinkle Twinkle', bpm: 120, bars: 2, sound: 'marimba', drum: 'kick', hits: [0, 4, 8, 12],
      notes: [[0, 0], [0, 2], [4, 4], [4, 6], [5, 8], [5, 10], [4, 12], [3, 14]]
    },
    {
      name: 'Ode to Joy', bpm: 120, bars: 2, sound: 'piano', drum: 'snare', hits: [0, 8],
      notes: [[2, 0], [2, 2], [3, 4], [4, 6], [4, 8], [3, 10], [2, 12], [1, 14]]
    },
    {
      name: 'Mary Had a Little Lamb', bpm: 120, bars: 2, sound: 'bell', drum: 'hihat',
      hits: [0, 2, 4, 6, 8, 10, 12, 14],
      notes: [[2, 0], [1, 2], [0, 4], [1, 6], [2, 8], [2, 10], [2, 12], [1, 14]]
    },
    {
      name: 'Happy Birthday', bpm: 110, bars: 2, sound: 'pluck', drum: 'kick', hits: [0, 8],
      notes: [[4, 0], [4, 2], [5, 4], [4, 6], [7, 8], [6, 10], [4, 12], [4, 14]]
    },
    {
      name: 'Drum and bass', bpm: 100, bars: 2, sound: 'bass', drum: 'kick', hits: [0, 4, 8, 12],
      notes: [[0, 0], [0, 4], [3, 8], [4, 12]]
    }
  ];

  function applyPreset(preset) {
    stop();
    song.bpm = preset.bpm;
    song.bars = preset.bars;
    song.sound = preset.sound;
    song.drum = preset.drum;
    song.notes = new Set((preset.notes || []).map((pair) => key(pair[0], pair[1])));
    song.hits = new Set(preset.hits || []);
    undoStack = [];
    el('ml-bpm').value = String(song.bpm);
    el('ml-bpm-val').textContent = String(song.bpm);
    renderAll();
  }

  /* ------------------------------------------------------------------- audio
     transport */

  function emit(step, when, dur) {
    for (let row = 0; row < ROWS; row++) {
      if (song.notes.has(key(row, step))) Sound.play(song.sound, freqOf(row), when, dur, 0.8);
    }
    if (song.hits.has(step)) Sound.play(song.drum, 200, when, dur, 0.9);
  }

  function schedule() {
    const ctx = Sound.ensure();
    if (!ctx) return;
    const total = totalSteps();
    while (nextTime < ctx.currentTime + 0.12) {
      emit(schedStep, nextTime, stepDuration());
      headQueue.push([schedStep, nextTime]);
      nextTime += stepDuration();
      schedStep = (schedStep + 1) % total;
    }
  }

  function paintHead() {
    if (!playing) return;
    const ctx = Sound.ensure();
    if (ctx) {
      let current = -1;
      while (headQueue.length && headQueue[0][1] <= ctx.currentTime) current = headQueue.shift()[0];
      if (current >= 0) setHead(current);
    }
    requestAnimationFrame(paintHead);
  }

  function setHead(step) {
    if (step === headStep) return;
    (playCells[headStep] || []).forEach((cell) => cell.classList.remove('is-play'));
    (playCells[step] || []).forEach((cell) => cell.classList.add('is-play'));
    headStep = step;
  }

  function play() {
    if (playing) return;
    const ctx = Sound.ensure();
    if (!ctx) {
      SS.toast('This browser cannot play audio');
      return;
    }
    playing = true;
    schedStep = 0;
    headQueue = [];
    nextTime = ctx.currentTime + 0.08;
    ticker = setInterval(schedule, 25);
    schedule();
    el('ml-play').textContent = '\u25A0 Stop';
    requestAnimationFrame(paintHead);
  }

  function stop() {
    playing = false;
    clearInterval(ticker);
    ticker = 0;
    headQueue = [];
    setHead(-1);
    el('ml-play').textContent = '\u25B6 Play';
  }

  function togglePlay() {
    if (playing) stop();
    else play();
  }

  /* ------------------------------------------------------------------ render */

  function renderSounds() {
    el('ml-sounds').innerHTML = SOUNDS.map((sound) =>
      '<button class="ml-button ml-chip' + (sound.id === song.sound ? ' is-active' : '') +
      '" type="button" data-sound="' + sound.id + '">' + sound.label + '</button>').join('');
    el('ml-drums').innerHTML = DRUMS.map((drum) =>
      '<button class="ml-button ml-chip ml-drumchip' + (drum.id === song.drum ? ' is-active' : '') +
      '" type="button" data-drum="' + drum.id + '">' + drum.label + '</button>').join('');
  }

  function cellHTML(row, step) {
    const drum = row === DRUM_ROW;
    const classes = 'ml-cell' +
      (drum ? ' is-drum' : '') +
      (step % 2 === 0 ? ' is-beat' : '') +
      (step % STEPS_PER_BAR === 0 ? ' is-bar' : '');
    const name = drum ? 'Drum' : NAMES[row];
    return '<button class="' + classes + '" type="button" data-row="' + row + '" data-step="' + step +
      '" aria-label="' + name + ' at beat ' + (step + 1) + '"></button>';
  }

  function renderGrid() {
    const steps = totalSteps();
    el('ml-bars').textContent = String(song.bars);
    const grid = el('ml-grid');
    grid.style.setProperty('--steps', String(steps));

    let html = '';
    for (let row = ROWS - 1; row >= 0; row--) {
      html += '<span class="ml-note mono small">' + NAMES[row] + '</span>';
      for (let step = 0; step < steps; step++) html += cellHTML(row, step);
    }
    html += '<span class="ml-note ml-note--drum mono">Drum</span>';
    for (let step = 0; step < steps; step++) html += cellHTML(DRUM_ROW, step);
    grid.innerHTML = html;

    cellMap = new Map();
    playCells = Array.from({ length: steps }, () => []);
    grid.querySelectorAll('.ml-cell').forEach((cell) => {
      const row = Number(cell.getAttribute('data-row'));
      const step = Number(cell.getAttribute('data-step'));
      cellMap.set(key(row, step), cell);
      playCells[step].push(cell);
      paintCell(row, step);
    });
    headStep = -1;
  }

  function paintCell(row, step) {
    const cell = cellMap.get(key(row, step));
    if (!cell) return;
    const on = hasNote(row, step);
    cell.classList.toggle('is-on', on);
    cell.innerHTML = on && row !== DRUM_ROW ? '<i></i>' : '';
  }

  function repaintCells() {
    cellMap.forEach((cell) => {
      paintCell(Number(cell.getAttribute('data-row')), Number(cell.getAttribute('data-step')));
    });
  }

  function renderAll() {
    renderSounds();
    renderGrid();
  }

  /* ------------------------------------------------------------------- edits */

  function snapshot() {
    return JSON.stringify({
      bpm: song.bpm,
      bars: song.bars,
      sound: song.sound,
      drum: song.drum,
      notes: Array.from(song.notes),
      hits: Array.from(song.hits)
    });
  }

  function pushUndo() {
    undoStack.push(snapshot());
    if (undoStack.length > 25) undoStack.shift();
  }

  /* Songs saved by the older multi-instrument version of this page are still
     read here: the first layer becomes the melody, the first drum layer the beat. */
  function restore(raw) {
    const data = JSON.parse(raw);
    const old = Array.isArray(data.layers) ? data.layers : null;
    if (old) {
      const melody = old.find((layer) => !drumExists(layer.instrument)) || old[0] || {};
      const drums = old.find((layer) => drumExists(layer.instrument));
      song.sound = soundExists(melody.instrument) ? melody.instrument : 'piano';
      song.notes = new Set(melody.notes || []);
      song.drum = drums ? drums.instrument : 'kick';
      song.hits = new Set(drums ? drums.notes.map((note) => Number(note.split(':')[1])) : []);
    } else {
      song.sound = soundExists(data.sound) ? data.sound : 'piano';
      song.drum = drumExists(data.drum) ? data.drum : 'kick';
      song.notes = new Set(data.notes || []);
      song.hits = new Set(data.hits || []);
    }
    song.bpm = data.bpm || 110;
    song.bars = Math.max(1, Math.min(MAX_BARS, data.bars || 2));
    el('ml-bpm').value = String(song.bpm);
    el('ml-bpm-val').textContent = String(song.bpm);
    renderAll();
  }

  function applyNote(row, step) {
    setNote(row, step, dragMode === 'add');
    paintCell(row, step);
  }

  el('ml-grid').addEventListener('pointerdown', (event) => {
    const cell = event.target.closest('.ml-cell');
    if (!cell) return;
    event.preventDefault();
    const row = Number(cell.getAttribute('data-row'));
    const step = Number(cell.getAttribute('data-step'));
    dragMode = hasNote(row, step) ? 'erase' : 'add';
    pushUndo();
    dragging = true;
    applyNote(row, step);
  });

  el('ml-grid').addEventListener('pointermove', (event) => {
    if (!dragging) return;
    const node = document.elementFromPoint(event.clientX, event.clientY);
    const cell = node && node.closest ? node.closest('.ml-cell') : null;
    if (cell) applyNote(Number(cell.getAttribute('data-row')), Number(cell.getAttribute('data-step')));
  });

  window.addEventListener('pointerup', () => { dragging = false; });
  window.addEventListener('pointercancel', () => { dragging = false; });

  /* ---------------------------------------------------------- sound pickers */

  function preview(instrument) {
    const ctx = Sound.ensure();
    if (!ctx) return;
    Sound.play(instrument, MIDDLE_C, ctx.currentTime + 0.02, 0.3, 0.8);
  }

  el('ml-sounds').addEventListener('click', (event) => {
    const button = event.target.closest('[data-sound]');
    if (!button) return;
    pushUndo();
    song.sound = button.getAttribute('data-sound');
    renderSounds();
    preview(song.sound);
  });

  el('ml-drums').addEventListener('click', (event) => {
    const button = event.target.closest('[data-drum]');
    if (!button) return;
    pushUndo();
    song.drum = button.getAttribute('data-drum');
    renderSounds();
    preview(song.drum);
  });

  /* --------------------------------------------------------------- transport */

  el('ml-play').addEventListener('click', togglePlay);

  el('ml-bpm').addEventListener('input', (event) => {
    song.bpm = Number(event.target.value);
    el('ml-bpm-val').textContent = String(song.bpm);
  });

  el('ml-add-bar').addEventListener('click', () => {
    if (song.bars >= MAX_BARS) { SS.toast('That is as long as it gets'); return; }
    pushUndo();
    song.bars += 1;
    renderGrid();
  });

  el('ml-remove-bar').addEventListener('click', () => {
    if (song.bars <= 1) return;
    pushUndo();
    song.bars -= 1;
    const limit = totalSteps();
    Array.from(song.notes).forEach((note) => {
      if (Number(note.split(':')[1]) >= limit) song.notes.delete(note);
    });
    Array.from(song.hits).forEach((step) => {
      if (step >= limit) song.hits.delete(step);
    });
    renderGrid();
  });

  el('ml-undo').addEventListener('click', () => {
    const previous = undoStack.pop();
    if (!previous) { SS.toast('Nothing to undo'); return; }
    restore(previous);
  });

  el('ml-clear').addEventListener('click', () => {
    pushUndo();
    song.notes.clear();
    song.hits.clear();
    repaintCells();
    SS.toast('Grid cleared');
  });

  el('ml-surprise').addEventListener('click', () => {
    pushUndo();
    const total = totalSteps();
    const rows = [0, 1, 2, 4, 5, 7];
    const pick = (list) => list[Math.floor(Math.random() * list.length)];

    song.sound = pick(SOUNDS).id;
    song.drum = pick(DRUMS).id;
    song.notes = new Set();
    song.hits = new Set();
    for (let step = 0; step < total; step += 2) {
      if (Math.random() < 0.7) song.notes.add(key(pick(rows), step));
    }
    const gap = song.drum === 'hihat' ? 2 : 4;
    for (let step = 0; step < total; step += gap) song.hits.add(step);

    renderAll();
    SS.toast('Here is a tune — press Play');
  });

  /* ------------------------------------------------------------- save & load */

  const SONGS_KEY = 'supersuite.musiclab.songs';

  function savedSongs() {
    try {
      return JSON.parse(localStorage.getItem(SONGS_KEY)) || {};
    } catch (err) {
      return {};
    }
  }

  function refreshSaved(selectName) {
    const all = savedSongs();
    const names = Object.keys(all).sort();
    el('ml-saved').innerHTML = names.length
      ? names.map((name) => '<option value="' + name + '">' + name + '</option>').join('')
      : '<option value="">No saved songs yet</option>';
    if (selectName && all[selectName]) el('ml-saved').value = selectName;
  }

  el('ml-save').addEventListener('click', () => {
    const name = (el('ml-songname').value || '').trim() || 'Untitled tune';
    const all = savedSongs();
    all[name] = JSON.parse(snapshot());
    try {
      localStorage.setItem(SONGS_KEY, JSON.stringify(all));
      SS.toast('Saved “' + name + '”');
    } catch (err) {
      SS.toast('Could not save — browser storage is full');
    }
    refreshSaved(name);
  });

  el('ml-load').addEventListener('click', () => {
    const name = el('ml-saved').value;
    const all = savedSongs();
    if (!name || !all[name]) { SS.toast('Nothing saved under that name'); return; }
    stop();
    pushUndo();
    restore(JSON.stringify(all[name]));
    el('ml-songname').value = name;
    SS.toast('Loaded “' + name + '”');
  });

  el('ml-delete').addEventListener('click', () => {
    const name = el('ml-saved').value;
    const all = savedSongs();
    if (!name || !all[name]) return;
    delete all[name];
    localStorage.setItem(SONGS_KEY, JSON.stringify(all));
    refreshSaved();
    SS.toast('Deleted “' + name + '”');
  });

  el('ml-export').addEventListener('click', () => {
    const name = (el('ml-songname').value || 'music-lab-tune').trim().replace(/[^a-z0-9-_ ]/gi, '') || 'music-lab-tune';
    SS.download(name.replace(/\s+/g, '-') + '.json',
      new Blob([JSON.stringify(JSON.parse(snapshot()), null, 2)], { type: 'application/json' }));
  });

  el('ml-import').addEventListener('click', () => el('ml-file').click());

  el('ml-file').addEventListener('change', (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (!data.notes && !data.layers) throw new Error('bad file');
        stop();
        pushUndo();
        restore(JSON.stringify(data));
        SS.toast('Song imported');
      } catch (err) {
        SS.toast('That file is not a Music Lab song');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  });

  /* --------------------------------------------------------------- shortcuts */

  document.addEventListener('keydown', (event) => {
    const target = event.target;
    if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
    if (event.code === 'Space') {
      event.preventDefault();
      togglePlay();
    }
  });

  /* -------------------------------------------------------------------- init */

  PRESETS.forEach((preset, index) => {
    el('ml-preset').insertAdjacentHTML('beforeend',
      '<option value="' + index + '">' + preset.name + '</option>');
  });

  el('ml-preset').addEventListener('change', (event) => {
    const preset = PRESETS[Number(event.target.value)];
    if (preset) {
      applyPreset(preset);
      el('ml-songname').value = preset.name;
      SS.toast('Loaded “' + preset.name + '” — press Play');
    }
  });

  refreshSaved();
  applyPreset(PRESETS[0]);
  window.addEventListener('pagehide', stop);
})();
