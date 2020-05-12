import React, { useState, useEffect, useContext, useRef } from 'react'
import styles from './sprite.module.css'
import Player from './screens/Game/player'
import Invader from './screens/Game/invader'
import Bullet from './screens/Game/bullet'
import { BarrierGrid } from './screens/Game/barrier'
import { Store } from './hooks/store'
import { useMultiKeyPress } from './hooks/index' 
import { useInterval, useAnimationFrame, useWindowSize } from './hooks'
import { types } from './hooks/reducers'
import useStateWrapper from '../config/ReactotronConfig'
import styled from 'styled-components'


const Info = styled.div`
flex-direction: row;
    align-self: start;
    color: white;
    margin-left: 5%;
`


const boundCheck = ([ [ [__, firstCol], ..._rest ], ...rest ], min=3, max=29) => {
    const [ [__r, lastCol], ..._rrest ] = rest[rest.length - 1]
    return [
        firstCol <= min || lastCol <= min,
        lastCol >= max || firstCol >= max
    ]
}

const getRow0 = i => i / 11 < 1 ? 0 : Math.floor(i / 11)
const getRow = i => i / 11 < 1 ? 1 : 1 + Math.floor(i / 11)
const getColumn = i => i % 11 === 0 ? 11 : i % 11
const byRow = (array) => array.reduce((p, c, i) => {
    const cr = getRow(i)
    if (!p[cr - 1]) {
        p[cr - 1] = [c]
    } else {
        p[cr - 1] = [ ... p[cr - 1], c]
    }
    return p
}, [])
const byColumn = array => array.reduce((p, c, i) => {
    
    const cc = getColumn(i)
    p[cc - 1] = p[cc - 1] == null ? [c] : [ ...p[cc - 1], c ]
    return p
}, [])

const getGridPos = i => {
    const row = i / 11 < 1 ? 1 : 1 + Math.floor(i / 11)
    const column = i % 11 === 0 ? 11 : i % 11
    return [row, column]
}

const has = (objStr, str) => {
    if (typeof objStr[Symbol.iterator] === 'function') {
        for (const key of objStr) {
            if (key === str) return true
        }
        return false
    } 
    return objStr === str   
}

const Grid = ({ gameOver }) => {

    //Intemitent State Store
    const { state, dispatch } = useContext(Store)
    const windowSize = useWindowSize()

    useEffect(() => {
        if (state.invadersLeft === 0) dispatch({ type: 'RESET_GRID' })
        if (state.playerLives === 0 || !state.direction || (!state.playerAlive && ((state.playerLives - 1) === 0))) gameOver()
        else if (!state.playerAlive) global.setTimeout(() => dispatch({ type: 'PLAYER_RESPAWN' }), 250)

    }, [ state.playerLives, state.direction, state.invadersLeft, state.playerAlive ])
    //Bullet Initial State
    //const bulletNodes = useRef([])

    //Invader Initial State 
    //const irNodes = useRef([])
    //const [ grid, setGrid ] = useState((new Array(5 * 11).fill()).map((_, i) => [getRow(i) + 3, (i % 11) + 11]))

    //Player Initial State
    //const playerNode = useRef()

    //Keyboard State

    const onDown = keys => {
        //console.log('down ', keys)
        //console.log('down keys ', keys)

        dispatch({ type: 'KEY', keys })
        if (has(keys, ' ')) global.setTimeout(() => dispatch({ type: 'SPACE_RESET'}), 1000)
        //else if (keys != null) global.setTimeout(() => dispatch({ type: 'KEY_DELAY' }), 10)
    }

    const onUp = key => {
        //console.log('up keys ', key)
        dispatch({ type: 'UP_KEY', key })
    }

    const keysPressed = useMultiKeyPress(
        onDown,
        onUp
    )

        /*
    useEffect(() => {
        //if (
        //    irNodes.current.length >= 1
        //    && bulletNodes.current.length >= 1
        //    && playerNode.current != null 
        //) {
            //console.log('Invaders ', irNodes.current)
            //console.log('Bullets ', bulletNodes.current)
            console.log('Player: ', playerNode.current)
        //}
        
    }, [ playerNode.current ])
*/

    useAnimationFrame(delta => {
        //if (state.tick - 1 <= 0) {
            dispatch({ type: types.time })
        //} else {
            //dispatch({ type: types.tick })
       //}
    }, state.delay)

    useAnimationFrame(delta => {
        //console.log('raf bullets: ', bullets)
        dispatch({ type: types.bulletTime, delta })
        

    })

    useAnimationFrame(delta => {
        dispatch({ type: types.invaderAttack })
    }, 500 + ((state.invadersLeft / 55) * 1500))

 

    const getP = ([r, c], i) => {
        const moved = state.tick - 1 <= getRow0(i)
        const res = moved ? [
            r + (state.direction === "down" ? 1 : 0),
            c + (state.direction === "left" ? -1 
                : state.direction === "right" ? 1
                : 0)
        ] : [
            r,
            c
        ]
        //if (i === 10 &&  state.tick - 1 === getRow0(i)) console.log(res)
        return res
    }
    //console.log('GRID CHANGE:     ', state.grid)
    return (<> 
    
        <div className={styles.grid} id={"grid"}>
            <p>{state.time} {state.tick} {state.vd} {state.hd}</p>
            { 
                
                state.grid?.map?.(({ row: r, column: c, bounds, alive }, i) => {
                    const [ aR, aC ] = getP([r - state.vd, c + state.hd], i)
                        //console.log(live[i])
                        return alive ? <Invader 
                                    bounds={bounds}
                              
                                    key={i}
                                    dispatch={dispatch}
                                    id={`invader${i}`}   
                                    position={([ aR, aC ])}
                                    number={i}
                                    side={state.tick - 1 <= getRow0(i) ? state.time % 2 : (state.time + 1) % 2 } 
                                    /> : null
                }) 
    
            }
            {

                state.bullets?.filter(b => b ?? false).map((b, i) => {
                    //console.log('render bullets: ', b)
                    return <Bullet key={i} position={b.position} state={b.state} number={i} dispatch={dispatch} windowSize={windowSize} />
                })

            }
            {
                state.barriers?.flatMap((bar, n) => {
                    //console.log('Barrier Render: ', bar)
                    const anyAlive = bar.some(({ alive }) => alive)
                    return (anyAlive
                            ? <BarrierGrid key={n * n} barriers={bar} dispatch={dispatch} number={n} windowSize={windowSize}/> 
                            : [])
                })
            }{
                state.playerAlive 
                && <Player
                    position={([20, 16])}
                    state={{ x: state.playerX }}
                    dispatch={dispatch}
                />
            }
            
            
        </div>
        <Info>
            <p>Score: {state.score}</p>
            <p>Lives: {state.playerLives}</p>
        </Info>
        </>
    )

}


//console.dir(styles.grid)

export default Grid
