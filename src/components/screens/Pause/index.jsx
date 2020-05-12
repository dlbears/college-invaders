import React, { useContext, useState, useEffect } from 'react'
import styled from 'styled-components'
import { Store } from '../../hooks/store'
import { has } from '../../hooks/reducers'
import { useMultiKeyPress } from '../../hooks/index'

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: auto;
    width: auto;
    min-width: 800px;
    min-height: 600px;
    background-color: black;
`

const Banner = styled.h1`
    color: white;
    text-align: center;
`

const Sub = styled.h2`
    color: white;
    text-align: center;
`

export const Pause = ({ quitScreen, resumeScreen }) => {
    const { state, dispatch } = useContext(Store)
    const [ focused, setFocus ] = useState(0)
    let keys = useMultiKeyPress(() => {}, keys => {
            if (has(keys, 'x')) setFocus(n => {
                if (n === 0) resumeScreen() 
                else if (n === 1) quitScreen()
                return n
            })
        })

    return (<Container>
        <Banner>Paused.</Banner>
        <Sub>Current Score: {state.score}</Sub>
        <Sub onClick={resumeScreen}>{ '>> RESUME <<' }</Sub>
        <Sub onClick={quitScreen}>{ '>> QUIT <<'  }</Sub>
        </Container>)
}