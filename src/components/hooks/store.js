import React, { useReducer, createContext } from 'react'
import { reducers } from './reducers'
export const Store = createContext()

export const createStoreProvider = ({ initialState, reducers }) => 
                                ({ children }) => {
                                    const reducer = (state, action) => {
                                        //console.log('CORE UPDATES: before ', state, action)
                                        const newState = reducers[action.type](state, action)
                                        //console.log('CORE UPDATES: after ', newState)
                                        return newState
                                    }
                                    const [ state, dispatch ] = useReducer(reducer, initialState)

                                    return (
                                        <Store.Provider value={{ state, dispatch }}>
                                            { children }
                                        </Store.Provider>
                                        )
                                }  



export const ROWS = 5,
    COLUMNS = 11,
    CENTER_COLUMN = 11,
    CENTER_ROW = 2,
    INIT_DELAY = 500
const GRID_SIZE = ROWS * COLUMNS, 
     BARRIER_COL = 4,
     BARRIER_ROW = 3,
     BARRIER_COUNT = 4,
     BARRIER_Y = -7;



function makeBarrier(_, number) {
    return (new Array(BARRIER_COL)).fill()
                .flatMap((_, i) => {
                    return (new Array(BARRIER_ROW)).fill()
                            .map((__, j) => ({
                                alive: true,
                                bounds: false,
                                number: (number * 12) + (i * 3) + j,
                                position: [4 + i + (number * 7), BARRIER_Y + (i === 1 || i === 2 ? j - 1 : j)]
                            })
                        )
                })
}

function getRow(i) { 
    return (i / COLUMNS < 1 ? 1 : 1 + Math.floor(i / COLUMNS)) + CENTER_ROW
}

function getColumn(i) {
    return (i % COLUMNS) + CENTER_COLUMN
}

function makeInvader(_, i) {
    return ({
        row: getRow(i),
        column: getColumn(i),
        number: i,
        alive: true,
        bounds: {
            top: 0,
            left: 0,
            width: 0,
            height: 0,
            x: 0,
            y: 0
        }
    })
}


const grid = (new Array(GRID_SIZE))
                .fill()
                .map(makeInvader)
                            
const barriers = (new Array(BARRIER_COUNT)).fill()
                                        .map(makeBarrier)

export const initialState = {
        isPaused: false,
        time: 0,
        bulletTime: 0,
        tick: 0,
        direction: 'right',
        vd: 0,
        hd: 0,
        delay: INIT_DELAY,
        keys: new Set([]),
        spaceDelay: false,
        keyDelay: false,
        grid,
        invadersLeft: GRID_SIZE,
        emptyRows: 0,
        bullets: [],
        playerX: 0,
        playerAlive: true,
        playerLives: 3,
        score: 0,
        playerBounds: false,
        barriers
        
    }
    
export const StoreProvider = createStoreProvider({
    initialState,
    reducers
})