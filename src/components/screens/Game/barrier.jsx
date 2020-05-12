import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'

const Barrier = styled(({ dispatch, number, windowSize, ...rest }) => {

    const bn = useRef(null)

    useEffect(() => {
        if (bn.current) {
            dispatch({ type: 'BARRIER_UPDATE', number, bounds: bn.current?.getBoundingClientRect?.()  })
        }
    }, [ windowSize, dispatch, number ])

    return (<svg {...rest} fill="rgba(0,250,0, 1)">
        <rect ref={bn} {...rest}/>
    </svg>)
})`
    grid-area: ${({ position: [ column, row ]}) => `${row}/${column}`};
    height: 2em;
    width: 2em;
    border: 0.1em solid rgba(0,250,0, 1);
`

export const BarrierGrid = styled(({ 
    barriers, 
    dispatch, 
    number,
    windowSize
}) => {
    return (
    <>
        {
            barriers.filter(({ alive }) => alive)
                    .map(({ position, number: n }, i) => <Barrier key={n} number={n} position={position} dispatch={dispatch} windowSize={windowSize}/>)
        }
    </>
    )
}
)``