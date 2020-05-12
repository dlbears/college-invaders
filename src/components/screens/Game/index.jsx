import React from 'react'
import { Invader } from './invader'
const Game = (props) => {


    const g = (new Array(5 * 11)).fill()
    return (<div className={styles.grid} id={"grid"} >
    { g.map((_, i) => <Invader number={i} key={i} id={`invader${i}`} />) }
    </div>)
}