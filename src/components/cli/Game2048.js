import { useEffect, useRef, useState } from "react";

// 2048 — tiles charge up the phosphor as they merge; hit 2048 and the
// board goes full glow. Arrows/wasd to slide.
const SIZE = 4;

// index paths for each direction — slide() compresses along these
const row = (r) => [0, 1, 2, 3].map((c) => r * SIZE + c);
const col = (c) => [0, 1, 2, 3].map((r) => r * SIZE + c);
const LINES = {
  left: [0, 1, 2, 3].map(row),
  right: [0, 1, 2, 3].map((r) => row(r).reverse()),
  up: [0, 1, 2, 3].map(col),
  down: [0, 1, 2, 3].map((c) => col(c).reverse()),
};

const addTile = (b) => {
  const empty = b.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
  if (!empty.length) return null;
  const i = empty[(Math.random() * empty.length) | 0];
  const nb = [...b];
  nb[i] = Math.random() < 0.9 ? 2 : 4;
  return { board: nb, spawned: i };
};

const freshBoard = () => {
  let b = Array(SIZE * SIZE).fill(0);
  b = addTile(b).board;
  b = addTile(b).board;
  return b;
};

// slide every line toward its head; returns null when nothing moved
const slide = (b, dir) => {
  const nb = [...b];
  let moved = false, gained = 0;
  const merged = [];
  for (const line of LINES[dir]) {
    const vals = line.map((i) => b[i]).filter((v) => v);
    const out = [];
    for (let i = 0; i < vals.length; i++) {
      if (vals[i] === vals[i + 1]) {
        out.push(vals[i] * 2);
        gained += vals[i] * 2;
        merged.push(line[out.length - 1]);
        i++;
      } else out.push(vals[i]);
    }
    for (let i = 0; i < line.length; i++) {
      const v = out[i] || 0;
      if (nb[line[i]] !== v) moved = true;
      nb[line[i]] = v;
    }
  }
  return moved ? { board: nb, gained, merged } : null;
};

const stuck = (b) =>
  b.every((v) => v) && !["left", "right", "up", "down"].some((d) => slide(b, d));

export default function Game2048({ onExit }) {
  const [board, setBoard] = useState(freshBoard);
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(false);
  const [won, setWon] = useState(false);
  const [going, setGoing] = useState(false); // keep playing past 2048
  const [pops, setPops] = useState([]);      // indices that just spawned/merged
  const [moveN, setMoveN] = useState(0);     // remounts popped cells so the animation retriggers
  // mutable mirrors so the key handler never works from a stale closure
  const boardRef = useRef(board);
  const scoreRef = useRef(0);

  useEffect(() => {
    const onKey = (e) => {
      const k = e.key;
      if (k === "Escape") return onExit(`2048 — score ${scoreRef.current}`);
      if (k === "Enter") {
        if (over) {
          boardRef.current = freshBoard();
          scoreRef.current = 0;
          setBoard(boardRef.current); setScore(0);
          setOver(false); setWon(false); setGoing(false); setPops([]);
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
      const res = slide(boardRef.current, dir);
      if (!res) return;
      const add = addTile(res.board);
      const nb = add ? add.board : res.board;
      boardRef.current = nb;
      scoreRef.current += res.gained;
      setBoard(nb);
      setScore(scoreRef.current);
      setPops([...res.merged, ...(add ? [add.spawned] : [])]);
      setMoveN((m) => m + 1);
      if (nb.includes(2048)) setWon(true);
      if (stuck(nb)) setOver(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [over, won, going, onExit]);

  const tileClass = (v) =>
    !v ? "" : v >= 2048 ? " tmax" : ` t${v}`;

  return (
    <div className="game g2048">
      <div className="game-hud">
        <span className="g-title">▸ 2048</span>
        <span className="g-score">SCORE {String(score).padStart(4, "0")}</span>
        <span className="g-keys">arrows/wasd slide · esc quit</span>
      </div>
      <div className="game-stage b2048">
        <div className="grid2048">
          {board.map((v, i) => (
            <div
              key={v && pops.includes(i) ? `${i}.${moveN}` : i}
              className={"cell2048" + tileClass(v) + (v && pops.includes(i) ? " pop" : "")}
            >
              {v || ""}
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
