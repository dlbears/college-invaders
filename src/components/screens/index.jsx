import React, { useReducer } from 'react'


const Screens = (props) => {

    const [ state, dispatch ] = useReducer(props.reducer, ({
        isIntro: false,
        isPaused: false,
        game: {
            lives: 3,
            dead: []
        }
    })) 

    return (<>
            { state.isIntro ? <Intro />   
            : state.isPaused ? <><Pause /><Game /></> 
            : <Game /> } 
        </>

    )
}