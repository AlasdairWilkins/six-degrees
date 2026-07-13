import useTmdbPersonSearch from './hooks/useTmdbSearch'
import ChainRow from './components/ChainRow';

import './App.css'

function App() {
  useTmdbPersonSearch({query: 'Kevin Bacon'});

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

      <ChainRow targetActorId={4724}/>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App
