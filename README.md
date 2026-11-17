# Temperament Lab

A small web app for listening to historical keyboard temperaments and building your own. It's aimed at people who tune or play harpsichords and organs, and anyone who has read about meantone and wanted to hear the wolf for themselves.

Everything runs in the browser. There are no samples: the sound is synthesised with the Web Audio API, so a note can be retuned while it's still sounding. That's the point of the app. Hold a chord, drag a fifth, and listen to the beats speed up or settle.

## Running it

You need Node 18 or newer.

```sh
npm install
npm run dev
```

Vite prints a local URL and a network URL. Open the network one on your phone (same Wi-Fi) to try it there.

`npm run build` writes a static site to `dist/`. You can host it anywhere that serves files.

## What's in it

**Circle of fifths.** The outer ring shows the twelve fifths and how far each is tempered, as a comma fraction where one fits (`-1/4s`, `-1/6p`) or in cents where it doesn't. The lines inside are the major thirds (or minor thirds, if you switch), coloured from green (pure) to red (wolf). Tap a fifth, a third or a note to hear it. Tap it again to stop.

**Comma workbench.** Select a fifth and set it with the fraction buttons or the slider. One fifth always takes up whatever is left over so that the octaves stay pure. That's the "closure" fifth, and you can move it anywhere on the circle.

**Keyboard.** Two octaves, C3 to C5. You can play it with the mouse, touch, your computer keyboard (`A W S E D F T G Y H U J K`) or a MIDI keyboard. Drone Hold keeps notes sounding until you tap them again, which is what you want for tuning work. You can also split G♯/A♭ and D♯/E♭, or all five accidentals, into front and back keys the way some Italian and North German instruments did.

**A/B comparison and repertoire.** Load two temperaments into slots A and B and flip between them while something is playing. There are short excerpts from Bach (the C major prelude from WTC I), Frescobaldi, Buxtehude and Couperin, plus a walk through all twelve major triads. Any step can be frozen so you can compare a single chord.

**Tables.** Key colour cards for all twelve triads, cent offsets for setting a strobe tuner (relative to A or to C), and beat rates in Hz for setting a temperament by ear.

Reference pitch can be 392, 415, 430, 440 or 465 Hz.

## The temperaments

21 are built in: meantones (1/3, 2/7, 1/4, 1/5, 1/6 comma), Schlick, a Schnitger-style modified meantone, Werckmeister III/IV/V, Lehman's Bach reading, Kellner, Kirnberger II and III, two of Neidhardt's, Vallotti, Young I and II, Rameau's ordinaire, d'Alembert/Rousseau, two Pythagorean layouts, 5-limit just intonation and equal temperament.

A caveat: several of these are reconstructions. Schlick, the Schnitger/Norden tuning, Rameau and d'Alembert/Rousseau in particular were never written down as neat comma fractions, and scholars disagree about the details. Lehman's Bach temperament is one reading of the title-page loops among several. The numbers here are reasonable versions, not the final word. If you know a better source for one of them, please change it.

## Adding your own

The easy way is the **Custom / Save** button. Type a fraction into each of the twelve fifth boxes (`-1/4s` for syntonic comma, `-1/6p` for Pythagorean, `0` for pure, `-3.2c` for cents), apply it, give it a name and save. Saved temperaments live in your browser's localStorage, so they don't follow you to other devices.

To make one permanent, add it to `HISTORICAL_PRESETS` in [`src/lib/temperament.ts`](src/lib/temperament.ts). The custom dialog can generate the code for you. The fifths are numbered clockwise from C–G:

```
0 C–G   1 G–D   2 D–A    3 A–E    4 E–B    5 B–F♯
6 F♯–C♯ 7 C♯–G♯ 8 G♯–E♭  9 E♭–B♭ 10 B♭–F  11 F–C
```

You only list the fifths that aren't pure. `makeFifthsWithClosure` works out the closure fifth:

```ts
fifthDeviationsCents: makeFifthsWithClosure(
  { 0: -sc / 4, 1: -sc / 4, 2: -sc / 4, 3: -sc / 4 }, // C–G–D–A–E, 1/4 syntonic comma
  6, // F♯–C♯ absorbs the rest
),
```

## Where things are

```
src/lib/temperament.ts      maths, presets, colour scales
src/lib/audioEngine.ts      Web Audio synth and instrument voices
src/lib/repertoire.ts       the musical excerpts, as note lists
src/components/             wheel, workbench, keyboard, tables, A/B player
```

React, TypeScript, Tailwind and Vite. No backend.

## Known limitations

- The instruments are additive synthesis with a fixed set of harmonics. They're useful for hearing beats, but they won't fool anyone into thinking they're a real Ruckers.
- Split keys are tuned by carrying the neighbouring fifths across the wolf. That's right for regular meantone but only an approximation for irregular temperaments.
- Safari on iOS doesn't support Web MIDI, so external keyboards won't work there.
- There's a web manifest, so you can add it to your home screen, but no service worker yet. It won't work offline.
- Beat rates are calculated for the middle octave with ideal harmonic partials. Real strings, especially in the bass, are slightly inharmonic.

## Ideas not done yet

A microphone tuner, Scala (`.scl`) export for Hauptwerk and Pianoteq, shareable links for custom temperaments, and an overtone view showing which partials clash.
