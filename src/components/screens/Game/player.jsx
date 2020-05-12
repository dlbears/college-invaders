import React, { useContext, useEffect, useState, useRef } from 'react'
import { useMultiKeyPress } from '../../hooks/index'
import { Store } from '../../hooks/store'
import { ReactComponent as PlayerEl } from '../../../svg/player.svg'
import { ReactComponent as ShotEl } from '../../../svg/shot1.svg'
import styles from '../../sprite.module.css' 
import styled from 'styled-components'




/*

 ${({ position: [ row, col ] }) => `grid-area: ${row}/${col};`}
    ${({ state: { x } }) => `transform: translate(${x}%, 0%);`}
*/
const PlayerRe = ({ position, state, dispatch, ...rest }) => {
    const playerRef = useRef(null)
    const { state: gstate } = useContext(Store)
    useEffect(() => {
        if (playerRef.current) {
            dispatch({ type: 'PLAYER_BOUNDS', bounds: playerRef.current?.getBoundingClientRect?.() })
        }
    }, [ dispatch, state.x, playerRef.current, gstate.time ])

    return (
        <PlayerEl 
            fill={"rgba(0, 255, 20, 1)"}
            position={position}
            state={state}
            ref={playerRef}
            {...rest}
        />
    )
}

const Player = styled(PlayerRe).attrs((
    { 
        state: { x=0 }, 
        position: [ row=0, col=0 ]
    }
    ) => ({
    style:  (
        {
            transform: `translate(${x}%, 0%)`,
            gridArea: `${row}/${col}`
        }
    )
}))`
    height: 2em;
    width: 2em;
`

export default Player 