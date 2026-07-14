import GameGrid from './components/GameGrid'

import './App.css'

function App() {
  // useTmdbSearch({query: 'Kevin Bacon'});

  return (
    <>
      <section id="center">
        <div>
          <h1>Six Degrees of Kevin Bacon</h1>
          <p>
            Inspired by the legendary game/waste of time
          </p>
        </div>
      </section>

      <GameGrid />

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App
