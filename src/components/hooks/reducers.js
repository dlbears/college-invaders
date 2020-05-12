import React from 'react'
import useStateWrapper from '../../config/ReactotronConfig'
import styled from 'styled-components'
import { INIT_DELAY , ROWS, COLUMNS, initialState } from './store'

const SECOND = 1000 // unit second in milliseconds
const PLAYER_RATE = 200 / SECOND// in px per sec
const BULLET_RATE = 375 / SECOND
const MAX_NPC_BULLETS = 6  
const POINT_ROW_MULTIPLIER = 10
const BULLET_SPAWN_RANGE = [19, -18]
const moment = rate => time => time * rate
const playerMoment = moment(PLAYER_RATE),
    bulletMoment = moment(BULLET_RATE)

const getRowIndicies = row => ([
    (row - 1) * COLUMNS, row * COLUMNS
])

const getRow0 = i => i / COLUMNS < 1 ? 0 : Math.floor(i / COLUMNS)
const getRow = i => (ROWS - getRow0(i))
const bBoxScale = ({ width, height }) => ({
    width: width * 0.8,
    height: height * 0.8,
    top: height * 0.1,
    left: width * 0.1 
})
const BoundBox = styled.div`
    position: absolute;
    border-width: 2px;
    border-color: red;
    border-style: solid;
    ${
        ({ boxModel }) => {
            const { width, height, top, left } = bBoxScale(boxModel)        
            return `
                width: ${width}px;
                height: ${height}px;
                top: ${top}px;
                left: ${left}px;
            `
        }
    }
`



const isCollision = (r1, r2) => (
    r1.x < r2.x + r2.width 
    && r1.x + r1.width > r2.x 
    && r1.y < r2.y + r2.height 
    && r1.y + r1.height > r2.y
) 

const nearbyInvaders = ({
    playerBounds,
    grid,
    bullets, 
    emptyRows,
    direction,
    tick,
    vd,
    hd
}) => {
    if (playerBounds && direction) {
        const inFlight = bullets.filter(b => b ?? false).reduce((n, { origin }) => origin === 'INVADER' ? n + 1 : n, 0)
        if (inFlight >= MAX_NPC_BULLETS) return bullets

        const getP = ([r, c], i) => {
            const moved = tick - 1 <= getRow0(i)
            const res = moved ? [
                r + (direction === "down" ? 1 : 0),
                c + (direction === "left" ? -1 
                    : direction === "right" ? 1
                    : 0)
            ] : [
                r,
                c
            ]
            //if (i === 10 &&  state.tick - 1 === getRow0(i)) console.log(res)
            return res
        }

        //const { x, width } = playerBounds
        //const [ min, max ] = [ x - (width * 5), x + (width * 5) ]
        const newBullets = grid.slice(...getRowIndicies(ROWS - emptyRows))
                              //.filter(({ bounds }) => bounds && (bounds.x >= min && bounds.x <= max))
                              .map(({ row, column, number }) => ({ origin: 'INVADER', position: getP([row - vd, column + hd], number), state: { x: 0, y: 0 } }))
        //console.log(newBullets)

        return bullets.concat(newBullets[Math.floor(Math.random() * newBullets.length)])
    }
    return bullets
}

const updateInvaders = ({
    tick, time, direction, vd, hd, emptyRows, ...rest
}) => {
    const tickReset = tick - 1 <= 0

    //console.log('emptyRows val: ', emptyRows)
    return ({
        ...rest,
        emptyRows,
        time: tickReset ? time + 1 : time,
        tick: tickReset ? 5 : tick - 1, 
        vd: direction === "down" && tickReset ? vd - 1  
                                    : vd,
        hd: direction === "left" && tickReset ? hd - 1 
        : direction === "right" && tickReset ? hd + 1 
                                    : hd,
        direction: tickReset && hd >= 8 && direction === "down" ? "left" 
                : tickReset && hd <= -8 && direction === "down" ? "right"
                : tickReset && hd + 1 >= 8 && direction !== "left" ? "down"
                : tickReset && hd - 1 <= -8 && direction !== "right" ? "down"
                : tickReset && vd <= (-12 - emptyRows) ? false
                : direction

    })
}


export const types = {
    tick: 'TICK',
    time: 'TIME',
    key: 'KEY',
    keyDelay: 'KEY_DELAY',
    upKey: 'UP_KEY',
    space: 'SPACE_RESET',
    bulletTime: 'BULLET_TICK',
    spawnBullet: 'BULLET_SPAWN',
    bulletBound: 'BULLET_BOUNDS',
    playerBound: 'PLAYER_BOUNDS',
    grid: 'GRID_UPDATE',
    invaderAttack: 'INVADER_ATTACK',
    barrierUpdate: 'BARRIER_UPDATE',
    completeRest: 'RESET',
    levelUp: 'RESET_GRID',
    respawn: 'PLAYER_RESPAWN',
    resume: 'RESUME',
    pause: 'PAUSE'
}

export const has = (objStr, str) => {
    if (typeof objStr[Symbol.iterator] === 'function') {
        for (const key of objStr) {
            if (key === str) return true
        }
        return false
    } 
    return objStr === str   
}

const remove = (strSet, str) => {
    const newSet = new Set([])
    for (const key of strSet) {
        if (key !== str) newSet.add(key)
    }
    return newSet
}

export const reducers = {
    [types.pause]: (state) => ({ ...state, isPaused: true }),
    [types.resume]: (state) => ({ ...state, isPaused: false }),
    [types.respawn]: ({ playerLives, ...rest}) => ({
        ...rest,
        playerLives: playerLives - 1,
        playerX: 0,
        playerAlive: true,
        playerBounds: false
    }),
    [types.completeRest]: () => initialState,
    [types.levelUp]: ({ playerLives, score, playerBounds, barriers, playerX }) => ({
        ...initialState,
        playerLives,
        score,
        playerBounds,
        barriers,
        playerX
    }),
    [types.barrierUpdate]: (state, { bounds, number }) => {
        if (state.isPaused) return state 
        const barrierIndex = Math.floor(number / 12)
        const barriers = ([
            ...state.barriers.slice(0, barrierIndex),
            state.barriers[barrierIndex].map(b => b.number === number ? ({ ...b, bounds }) : b),
            ...state.barriers.slice(barrierIndex + 1)
        ]) 
        //console.log()
        return ({
            ...state,
            barriers
        })
    },
    [types.invaderAttack]: (state, _) => ({
        ...state,
        bullets: nearbyInvaders(state)
    }),
    [types.keyDelay]: (state, _) => ({
        ...state,
        keyDelay: false
    }),
    [types.upKey]: (state, { key }) => ({
        ...state,
        keys: remove(state.keys, key)
    }),
    [types.key]: (state, { keys: newKeys }) => {
        //console.log('Key down reducer keys: ', newKeys)
        return (state.isPaused 
            ? state
            : ({
            ...state,
            bullets: (has(newKeys, ' ') && !state.spaceDelay) 
                    ? ([
                        ...state.bullets,
                        ({ origin: 'PLAYER', position: BULLET_SPAWN_RANGE, state: { x: state.playerX, y: 0 }})
                    ])
                    : state.bullets,
            spaceDelay: has(newKeys, ' ') ? true : state.spaceDelay,
            keys: typeof newKeys[Symbol.iterator] === 'function' ?
                    new Set([
                        ...state.keys,
                        ...newKeys
                    ])
                    : new Set([
                        ...state.keys,
                        newKeys
                    ])
    }))
    
},
    [types.space]: (state, _) => ({
        ...state,
        spaceDelay: false
    }),
    [types.bulletBound]: (state, { bounds, number }) => {
        //console.log(bounds)
        return ({
        ...state,
        bullets: state.bullets
                        .map((bullet, i) => i === number 
                                        ? ({ ...bullet, bounds }) 
                                        : bullet
                                    )
                        //.forEach(v => console.log('TRACE ', v, bounds))
    })},
    [types.playerBound]: (state, { bounds }) => ({
        ...state,
        playerBounds: bounds
    }),

    [types.time]: (state, action) => {
 
        if (!state.direction || state.isPaused) return state //game over flag?
        const newState = updateInvaders(state)  
        return newState
    },
    [types.bulletTime]: (state, { delta }) => {
        //console.log('bullet action ', state.bullets)
        if (state.isPaused) return state
        const bulletTime = state.bulletTime + delta
        /*
        console.log(
            'BULLET TIME delta: ', delta, 
            '\n\t\t\t\t\tcurrent: ', bulletTime,
            '\n\t\t\t\t\tprevious: ', state.bulletTime 
        ) 
            
 */
            //
            //console.log('BEFORE COLLISION CHECKS : ', state)
        const boundsAvailable = state.bullets.some(b => b?.bounds ?? false) 
                            && state.barriers.every(column => column.every(b => b?.bounds ?? false))
                            && state.playerBounds

        
        if (!boundsAvailable) {
            //onsole.log('no bounds')
            return state
        }
        let bullets = state.bullets.map((b, i) => ({ ...b, number: i }))
                                  .filter(b => b?.bounds ?? false)
        const unboundBullets = bullets.filter(b => !(b?.bounds ?? false) )
        const invaderCollisions = bullets.filter(({ origin }) => origin === 'PLAYER')
                                              .reduce((p, { bounds: bulletBox, number: i }) => {
                                                    //console.log("I RAN")
                                                  const collisionsFound = state.grid
                                                                                .filter(({ bounds: invaderBox, alive }) => {
                                                                                    //console.log('RANGE TEST: ', inRange(invaderBox.y) )
                                                                                    //console.log('alive: ', alive)
                                                                                    return alive && isCollision(invaderBox, bulletBox) 
                                                                                            //: false
                                                                                })
                                                                                .map(({ number }) => ({ bullet: i, invader: number }))
                                                  //console.log('COLLISIONS FOUND ', collisionsFound)
                                                  if (collisionsFound.length > 1) {
                                                    return [...p, collisionsFound[collisionsFound.length - 1]]
                                                  } else if (collisionsFound.length === 1) {
                                                    return [...p, collisionsFound[0]]
                                                  } else {
                                                    return p
                                                  }
                                              }, [])
                                              //console.log('AFTER COLLISION CHECKS : ', invaderCollisions)
        const barrierCollisions = (bullets.reduce((p, { bounds, number }) => {
            if (bounds) {
                const { x } = bounds
            const possibleCollisions = state.barriers.flatMap(col => {
                return col.filter(({ alive, bounds: { x: bx, width }}) => {
                    //console.log('min: ', bx, '\nmax: ', bx + width, '\nbullet: ', x)
                    return alive && bx <= x && (bx + width) >= x
                })
            })
            //console.log('possible collisions ', possibleCollisions)
            if (possibleCollisions.length >= 1) {
                const collisionsFound = possibleCollisions.flatMap(({ bounds: barrierBounds, number: n }) => {
                    return isCollision(bounds, barrierBounds) ? ({ barrier: n, bullet: number }) : []
                })
                if (collisionsFound.length >= 1) {
                    //console.log('COllisions found: ', collisionsFound)
                    return [
                            ...p,
                            collisionsFound[collisionsFound.length - 1]
                        ] 
                }
            }
        }
            return p

            }, []).concat(state.vd <= -7 ? state.grid.flatMap(({ bounds, alive }) => {

            if (alive) {
                const collisions = state.barriers.map(col => {
                    const found = col.flatMap(({ alive: a, bounds: b, number: n }) => {
                        const hasCollision = a && isCollision(bounds, b) ? ({ barrier: n }) : []
                        //if (hasCollision || isCollision(bounds, b)) console.log('COLLISION TRIP: is', isCollision(bounds, b), '\nhas: ', hasCollision)
                        return hasCollision
                    })
                    //console.log('col: ', col)
                    return found
                })
                const res = collisions.filter(a => a.length !== 0)
                //console.log('INVADER BARRIER COLLISION', collisions) STRAIGHT FROM THE FORGE
                 //console.log('coll ', res)
                if (res.length >= 1) return res[0]
            }
            return []
        }) : []))
        //if (barrierCollisions.length >= 1) console.log('BARRIER COLLISIONS: ', barrierCollisions)
        const bulletCollisions = barrierCollisions.filter((c) => {
            return c?.bullet + 1 ?? false
        })

        const playerCollisions = (state.playerAlive && bullets.length >= 1)
                                ? bullets.filter(({ origin, bounds }) => origin !== 'PLAYER' && isCollision(bounds, state.playerBounds))
                                         .map(({ number }) => ({ bullet: number }))
                                : []
        
        const playerAlive = playerCollisions.length === 0
        //console.log('bullet collisions: ', bulletCollisions)
        const invsRemoved = invaderCollisions.length
        const anyInvRemoved = invsRemoved >= 1
        //if (invaderCollisions.length >= 1) console.log(invaderCollisions)
        bullets = bullets.length >= 1 
                        ? bullets
                            .filter(({ bounds, number }) => (
                                ! ((invaderCollisions.some(c => c.bullet === number )
                                || bulletCollisions.some(c => {
                                    //console.log(c?.bullet)
                                    return c.bullet === number 
                                })
                                || playerCollisions.some(c => c.bullet === number )
                                || (
                                    bounds && state.playerBounds?.y 
                                        ? (
                                            bounds.y <= 0 
                                            || bounds.y >= state.playerBounds.y
                                        )
                                        : false
                                    )
                                ))
                            )).concat(unboundBullets)
                            .map(({ 
                                state: { x, y },
                                origin, 
                                ...rest
                            }) => { 
                                //if (y <= 0) console.log('player bullet out')
                            return ({
                                state: { 
                                    x,
                                    y: origin === "PLAYER" 
                                        ? y - bulletMoment(delta)
                                        : y + bulletMoment(delta)
                                },
                                origin,
                                ...rest,
                            })
                        })
                        : state.bullets

        
/*
        bullets = (bullets.length >= 1 
                && bulletCollisions.length >= 1) 
                ? bullets.flatMap((bullet, i) => {
                    console.log('Barrier')
                    return bulletCollisions.some(({ bullet: b }) => b === i) 
                            ? []
                            : bullet
                }) : bullets
*/
        const barriers = barrierCollisions.length >= 1 
                        ? state.barriers.map(col => col.map(({ number, ...rest }) => barrierCollisions.some(({ barrier }) => barrier === number) ? ({ ...rest, number, alive: false }) : ({ number, ...rest}) ))
                        : state.barriers
        //console.log('UPDATED BULLET ', bullets)
        const grid = anyInvRemoved
                    ? state.grid.map(({ number, ...rest }) => invaderCollisions.filter(({ invader }) => invader === number).length >= 1 ? ({
                        ...rest,
                        number,
                        alive: false 
                    }) : ({ number, ...rest })
                    )
                    : state.grid

        const invadersLeft = grid.length

        const score = invaderCollisions.length >= 1
                        ? invaderCollisions.reduce((p, { invader }) => {
                            return p + (getRow(invader) * POINT_ROW_MULTIPLIER)
                        }, state.score)
                        : state.score
        /*console.log('row gone: ', state.grid.slice(...getRowIndicies(ROWS - state.emptyRows)).every(({ alive }) => {
            //console.log('alive? ', alive)
            return !alive
        }))*/
        //if (state.time === 5) console.log('5th row', state.grid.slice(...getRowIndicies(5)))
        const emptyRows = (anyInvRemoved 
            && state.grid.slice(...getRowIndicies(ROWS - state.emptyRows)).every(({ alive }) => !alive))
                            ? (state.emptyRows) + 1   
                            : state.emptyRows

        const delay = anyInvRemoved
                ? state.delay - (INIT_DELAY/(5 * 11))
                : state.delay
 
        //if (invaderCollisions.length >= 1) console.log('GRID UP: ', grid)

        const playerX = ((has(state.keys,'ArrowLeft') && !has(state.keys, 'ArrowRight')) || (has(state.keys,'a') && !has(state.keys, 'd')))
                        ? state.playerX - playerMoment(delta)
                        : ((has(state.keys, 'ArrowRight') && !has(state.keys, 'ArrowLeft')) || (has(state.keys,'d') && !has(state.keys, 'a')))
                        ? state.playerX + playerMoment(delta)
                        : state.playerX
        const isPaused = has(state.keys, 'x')

        return ({
                ...state,
                bulletTime,
                grid,
                invadersLeft,
                barriers,
                emptyRows,
                bullets,
                playerX,
                playerAlive,
                delay,
                score,
                isPaused
            }) 
    },
    [types.spawnBullet]: (state, { origin, position }) => {
        //console.log('bullet action ', { origin, state })
        return state.isPaused ? state :({
            ...state,
            bullets: [
                ...state.bullets,
                ({ origin, state: { x: state.playerX, y: 0 }, position: ([19, -17]), bounds: false })
            ]
        })
    },
    [types.grid]: (
        {
            grid,
            ...rest
        }, 
        { 
            number, 
            bounds
        }) => {
            //if (number < 1) console.log({ top, left, width, height })
            const updatedInvader = grid
            .filter((_, i) => i === number)
            .map(invader => ({
                ...invader,
                bounds
            }))
            //if (number < 1) console.log('UPDATED INVADER: ', updatedInvader)

        const updatedGrid = [
            ...grid.slice(0, number),
            ...updatedInvader,
            ...grid.slice(number + 1)
        ]

        //if (number === 1) console.log('BBBBBBBB   update: ', updatedGrid)
        return {
            ...rest,
            grid: updatedGrid
        }

    }

}