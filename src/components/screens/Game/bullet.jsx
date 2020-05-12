import { ReactComponent as ShotEl } from '../../../svg/shot1.svg'
import React, { useLayoutEffect, useRef, useContext } from 'react'
import styled from 'styled-components'


export const Bullet = styled(({ dispatch, number, state, windowSize, ...rest}) => {
    const bulletRef = useRef()
    useLayoutEffect(() => {
        if (bulletRef.current) {
            dispatch({ type: 'BULLET_BOUNDS', number, bounds: bulletRef.current?.getBoundingClientRect?.() })
        }
    }, [ dispatch, number, state, windowSize ])
    return <ShotEl fill="white" ref={bulletRef} state={state} {...rest} />
}).attrs(({
    position: [ row, col ],
    state: { x, y }
}) => ({
    style: {
        gridArea: `${row}/${col}`,
        transform: `translate(${x * 2}%, ${y}%)`
    }
}))`
        height: 1em;
        width: 1em;
        align-self: end;
        justify-self: center;
    `
    

export default Bullet


