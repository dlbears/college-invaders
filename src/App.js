import React, { useContext, useEffect, useState } from 'react';
import Grid from './components/sprites'
import styles from './components/sprite.module.css'
import { Store } from './components/hooks/store'
import { useMultiKeyPress } from './components/hooks/index'
import { Intro } from './components/screens/Intro/index'
import { Pause } from './components/screens/Pause/index'
import { GameOver } from './components/screens/Pause/gameover'
import { has } from './components/hooks/reducers';


const INTRO = 'INTRO',
     GRID = 'GRID',
     PAUSE = 'PAUSE',
     GAME_OVER = 'GAMEOVER'


function App() {
  //const keysPressed = useMultiKeyPress(x => x, x => x)
  const { state, dispatch } = useContext(Store)
  const [ currentScreen, setScreen ] = useState(INTRO)
  const keysPressed = useMultiKeyPress(() => {}, keys => {
    if (has(keys, 'x') && currentScreen === GRID) {
      setScreen(PAUSE)
      dispatch({ type: 'PAUSE' })
    }  
 
  } )
  

  useEffect(() => {
    if (state.isPaused) {
        setScreen(PAUSE)
    } else if (currentScreen === PAUSE) {
        setScreen(GRID)
    }
  }, [ state.isPaused ])

  return (currentScreen === INTRO 
        ? <Intro keys={keysPressed} startScreen={() => setScreen(GRID)} />
        : currentScreen === PAUSE
        ? <Pause keys={keysPressed} quitScreen={() => { setScreen(INTRO); dispatch({ type: 'RESET' }) }} resumeScreen={() => { setScreen(GRID); dispatch({ type: 'RESUME' })} } />
        : currentScreen === GAME_OVER
        ? <GameOver keys={keysPressed} continueScreen={() => { setScreen(INTRO); dispatch({ type: 'RESET' }) }} />
        : <div className={styles.contain}>
          <Grid gameOver={() => { setScreen(GAME_OVER) }}/>
        </div>
        );
}

export default App;
