import React, { useState, useEffect, useRef, useLayoutEffect, useContext } from 'react'
import styles from '../../sprite.module.css'
import styled from 'styled-components'
import { usePrevious, useAnimation } from '../../hooks/index'
import { ReactComponent as Alien1s} from '../../../svg/alien1a.svg'
import { ReactComponent as Alien1e} from '../../../svg/alien1b.svg'
import { ReactComponent as Alien2s} from '../../../svg/alien2a.svg'
import { ReactComponent as Alien2e} from '../../../svg/alien2b.svg'
import { ReactComponent as Alien3s} from '../../../svg/alien3a.svg'
import { ReactComponent as Alien3e} from '../../../svg/alien3b.svg'
/*import {
    Alien1s,
    Alien1e,
    Alien2s,
    Alien2e,
    Alien3s,
    Alien3e
} from '../../../svg/index'*/
import { Store } from '../../hooks/store'

const bBoxScale = ({ width: w, height: h }) => ({
    width: w * 0.8,
    height: h * 0.8,
    top: h,
    left: w 
})

const BoundBox = styled.div.attrs(({ boxModel: { top, left, width, height } }) =>{ 
    return ({
        style: {
            width,
            height,
            top,
            left
        }
    })
})`
    position: absolute;
    border-width: 2px;
    border-color: red;
    border-style: solid;
`


const pairs = [
    [Alien1s, Alien1e, "rgba(199, 90, 157, 1)"],
    [Alien2s, Alien2e, "rgba(49, 53, 126, 1)"],
    [Alien3s, Alien3e, "rgba(157, 198, 96, 1)"]
]

const resolveComponent = (i, s) => pairs[ i <= 10 ? 2 : i <= 32 ? 1 : 0 ][ s ]
const resolveColor = i => resolveComponent(i, 2)

const Invader = styled(({ bounds, number, side=0, dispatch, position, alive, ...rest }) => {
    const Comp = resolveComponent(number, side)
    const color = resolveColor(number)
    const ir = useRef(null)
    //const previousPosition = usePrevious(position)
    //const boundBox = bBoxScale(bounds)
    //console.log('INVADWER   ', boundBox)

    useEffect(() => {
        if (ir.current) {
            //if (number === 1) console.log('AAAAAAAAAAAAAAA   change: ', ir.current?.getBoundingClientRect?.())
            dispatch({ type: 'GRID_UPDATE', number, bounds: ir.current?.getBoundingClientRect?.() })
        }

    }, [ dispatch, number, ir.current ])

    return <Comp fill={color} ref={ir} position={position} {...rest}/>

}).attrs(({ position }) => ({
    style: {
        gridArea: `${position[0]}/${position[1]}`
    }
}))`
    height: 2em;
    width: 2em;
    transform: scale(1);
`

export default Invader