import React, { useContext } from 'react'
import styled from 'styled-components'
import { Store } from '../../hooks/store'



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
    color: red;
    text-align: center;
`

const Sub = styled.h2`
    color: white;
    text-align: center;
`



export const GameOver = ({ continueScreen }) => {
    const { state, dispatch } = useContext(Store)
    return (<Container>
        <Banner>GAME OVER</Banner>
        <Sub>Final Score: {state.score}</Sub>
        <Sub onClick={continueScreen}>{ '>> MENU <<' }</Sub>
        </Container>)
}