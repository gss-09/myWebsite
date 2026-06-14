import { useEffect, useRef, useState } from "react";

// 2048 — tiles charge up the phosphor as they merge; hit 2048 and the
// board goes full glow. Arrows/wasd to slide.
//
// Tiles are identity-tracked and absolutely positioned, so moves animate
// as real slides (CSS transform transition). A move runs in two phases:
// slide everything, then ~0.1s later collapse merged pairs into their
// doubled tile and spawn the new one. A fresh keypress flushes the
// pending phase instantly so fast play never waits on the animation.
const SIZE = 4;
const TILE = 64, GAP = 7, CELL = TILE + GAP;
const SLIDE_MS = 110;

let uid = 1;
const nid = () => uid++;

const spawnTile = (tiles) => {
  const used = new Set(tiles.map((t) => t.r * SIZE + t.c));
  const free = [...Array(SIZE * SIZE).keys()].filter((i) => !used.has(i));
  if (!free.length) return null;
  const i = free[(Math.random() * free.length) | 0];
  return { id: nid(), v: Math.random() < 0.9 ? 2 : 4, r: (i / SIZE) | 0, c: i % SIZE, state: "new" };
};

const freshTiles = () => {
  const ts = [];
  ts.push(spawnTile(ts));
  ts.push(spawnTile(ts));
  return ts;
};

// slide all tiles toward `dir`; returns null when nothing moves
const moveTiles = (tiles, dir) => {
  const horiz = dir === "left" || dir === "right";
  const fwd = dir === "left" || dir === "up";
  const cell = (line, pos) => (horiz ? { r: line, c: pos } : { r: pos, c: line });
  let moved = false, gained = 0;
  const out = [], merges = [];
  for (let line = 0; line < SIZE; line++) {
    const lane = tiles
      .filter((t) => (horiz ? t.r : t.c) === line)
      .sort((a, b) => (horiz ? a.c - b.c : a.r - b.r));
    if (!fwd) lane.reverse();
    let pos = fwd ? 0 : SIZE - 1;
    const step = fwd ? 1 : -1;
    let prev = null; // last placed tile that hasn't merged yet
    for (const t of lane) {
      if (prev && prev.v === t.v) {
        // ride onto prev's cell; both collapse into one tile in phase two
        out.push({ ...t, r: prev.r, c: prev.c, state: "idle" });
        merges.push({ ids: [prev.id, t.id], r: prev.r, c: prev.c, v: t.v * 2 });
        gained += t.v * 2;
        moved = true;
        prev = null;
      } else {
        const { r, c } = cell(line, pos);
        pos += step;
        if (r !== t.r || c !== t.c) moved = true;
        const nt = { ...t, r, c, state: "idle" };
        out.push(nt);
        prev = nt;
      }
    }
  }
  return moved ? { tiles: out, merges, gained } : null;
};

const noMoves = (tiles) => {
  if (tiles.length < SIZE * SIZE) return false;
  const grid = Array(SIZE * SIZE).fill(0);
  tiles.forEach((t) => { grid[t.r * SIZE + t.c] = t.v; });
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      const v = grid[r * SIZE + c];
      if (c + 1 < SIZE && grid[r * SIZE + c + 1] === v) return false;
      if (r + 1 < SIZE && grid[(r + 1) * SIZE + c] === v) return false;
    }
  return true;
};

export default function Game2048({ onExit }) {
  const [tiles, setTiles] = useState(freshTiles);
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(false);
  const [won, setWon] = useState(false);
  const [going, setGoing] = useState(false); // keep playing past 2048
  // mutable mirrors so the key handler never works from a stale closure
  const tilesRef = useRef(tiles);
  const scoreRef = useRef(0);
  const pending = useRef(null); // { timer, finalize } for the merge/spawn phase

  useEffect(() => {
    const flush = () => {
      if (!pending.current) return;
      clearTimeout(pending.current.timer);
      pending.current.finalize();
    };

    const onKey = (e) => {
      const k = e.key;
      if (k === "Escape") return onExit(`2048 — score ${scoreRef.current}`);
      if (k === "Enter") {
        if (over) {
          flush();
          tilesRef.current = freshTiles();
          scoreRef.current = 0;
          setTiles(tilesRef.current); setScore(0);
          setOver(false); setWon(false); setGoing(false);
        } else if (won && !going) setGoing(true);
        return;
      }
      if (over || (won && !going)) return;
      const dir =
        k === "ArrowLeft" || k === "a" ? "left" :
        k === "ArrowRight" || k === "d" ? "right" :
        k === "ArrowUp" || k === "w" ? "up" :
        k === "ArrowDown" || k === "s" ? "down" : null;
      if (!dir) return;
      e.preventDefault();
      flush();
      const res = moveTiles(tilesRef.current, dir);
      if (!res) return;
      // phase one: everything slides (merging pairs ride to the same cell)
      tilesRef.current = res.tiles;
      setTiles(res.tiles);
      // phase two: collapse merges, pop the spawn, settle the score
      const finalize = () => {
        pending.current = null;
        const dead = new Set(res.merges.flatMap((m) => m.ids));
        let ts = tilesRef.current.filter((t) => !dead.has(t.id));
        ts = ts.concat(res.merges.map((m) => ({ id: nid(), v: m.v, r: m.r, c: m.c, state: "merged" })));
        const spawn = spawnTile(ts);
        if (spawn) ts = ts.concat(spawn);
        tilesRef.current = ts;
        scoreRef.current += res.gained;
        setTiles(ts);
        setScore(scoreRef.current);
        if (ts.some((t) => t.v >= 2048)) setWon(true);
        if (noMoves(ts)) setOver(true);
      };
      pending.current = { finalize, timer: setTimeout(finalize, SLIDE_MS) };
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [over, won, going, onExit]);

  // clear any in-flight phase-two timer on unmount
  useEffect(() => () => pending.current && clearTimeout(pending.current.timer), []);

  const tileClass = (v) => (v >= 2048 ? " tmax" : ` t${v}`);

  return (
    <div className="game g2048">
      <div className="game-hud">
        <span className="g-title">▸ 2048</span>
        <span className="g-score">SCORE {String(score).padStart(4, "0")}</span>
        <span className="g-keys">arrows/wasd slide · esc quit</span>
      </div>
      <div className="game-stage b2048">
        <div className="board2048">
          {Array.from({ length: SIZE * SIZE }).map((_, i) => (
            <div key={i} className="bcell2048" />
          ))}
          {tiles.map((t) => (
            <div
              key={t.id}
              className="tile2048"
              style={{ transform: `translate(${t.c * CELL}px, ${t.r * CELL}px)` }}
            >
              <div className={"tin" + tileClass(t.v) + (t.state !== "idle" ? " pop" : "")}>
                {t.v}
              </div>
            </div>
          ))}
        </div>
        {won && !going && (
          <div className="game-veil over">
            <div className="go-title">2048 ⚡</div>
            <div className="go-score">score · {score}</div>
            <div className="go-hint">[enter] keep going &nbsp;·&nbsp; [esc] quit</div>
          </div>
        )}
        {over && (
          <div className="game-veil over">
            <div className="go-title">NO MOVES LEFT</div>
            <div className="go-score">score · {score}</div>
            <div className="go-hint">[enter] play again &nbsp;·&nbsp; [esc] quit</div>
          </div>
        )}
      </div>
    </div>
  );
}
