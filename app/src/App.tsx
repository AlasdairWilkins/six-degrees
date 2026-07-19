import { useState } from "react";

import Game from "./components/Game";

import "./App.css";

function App() {
  const [gameUuid, setGameUuid] = useState<string>(crypto.randomUUID());

  return (
    <>
      <section id="center">
        <div>
          <h1>Six Degrees of Kevin Bacon</h1>
          <p>Inspired by the legendary game/waste of time</p>
        </div>
      </section>

      <Game key={gameUuid} reset={() => setGameUuid(crypto.randomUUID())} />

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  );
}

export default App;
