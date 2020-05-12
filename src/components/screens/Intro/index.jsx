import React, { useContext } from 'react'
import styled from 'styled-components'



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


export const Intro = ({ startScreen }) => {
    return (<Container>
        <Banner>College Invaders</Banner>
        <Sub>- Quarantine Edition -</Sub>
        <Sub onClick={startScreen}>{ '>> NEW GAME <<' }</Sub>
        </Container>)
}