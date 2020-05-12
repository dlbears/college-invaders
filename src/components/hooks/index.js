import React, { useReducer, useEffect, useRef, useState, useContext } from 'react';
import { Store } from './store'



const ROW = 5
const ROW_STAGGER = 75


export const useAnimationFrame = (callback, delay=0) => {
    // Use useRef for mutable variables that we want to persist
    // without triggering a re-render on their change
    const [ noDelay, setIsDelay ] = useState(delay === 0);

    const requestRef = useRef();
    const previousTimeRef = useRef();
    const delayRef = useRef();
    
    const update = time => {
        if (previousTimeRef.current != undefined) {
            const deltaTime = time - previousTimeRef.current;
            callback(deltaTime)
          }
          previousTimeRef.current = time;
          requestRef.current = requestAnimationFrame(animate);
    }

    const animate = noDelay 
                    ? update
                    : time => {
                        delayRef.current = global.setTimeout(
                            () => update(time), 
                            delay
                        )
                    }
                
    useEffect(() => {
      requestRef.current = requestAnimationFrame(animate);
      setIsDelay(delay === 0)
      return noDelay 
            ? () => cancelAnimationFrame(requestRef.current)
            : () => {
                global.clearTimeout(delayRef.current)
                cancelAnimationFrame(requestRef.current);
            }
    }, [ delay, noDelay ]); 
  }
  

  export function useWindowSize() {
    const isClient = typeof window === 'object';
  
    function getSize() {
      return {
        width: isClient ? window.innerWidth : undefined,
        height: isClient ? window.innerHeight : undefined
      };
    }
  
    const [windowSize, setWindowSize] = useState(getSize);
  
    useEffect(() => {
      if (!isClient) {
        return false;
      }
      
      function handleResize() {
        setWindowSize(getSize());
      }
  
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []); 
  
    return windowSize;
  }
/*
export function useAnimation(    
    duration = 500,
    delay = 100,
    easingName = 'linear'
  ) {
    // The useAnimationTimer hook calls useState every animation frame ...
    // ... giving us elapsed time and causing a rerender as frequently ...
    // ... as possible for a smooth animation.
    //const elapsed = useAnimationTimer(duration, delay);
    const animate = time => {
        if (previousTime.current != undefined) {
            const delta = time - previousTime.current
        }
    }
    
    // Amount of specified duration elapsed on a scale from 0 - 1
    const n = Math.min(1, elapsed / duration);
    // Return altered value based on our specified easing function
    //console.log("timer", n)
    const { state, dispatch } = useContext(Store)

    if (Math.floor(elapsed / 100) > 1) {
        dispatch({type: "TICK"})
    }

    return elapsed > duration ? 99999 : elapsed //easing[easingName](n);
  }
  
  // Some easing functions copied from:
  // https://github.com/streamich/ts-easing/blob/master/src/index.ts
  // Hardcode here or pull in a dependency
  const easing = {
    linear: n => n,
    elastic: n =>
      n * (33 * n * n * n * n - 106 * n * n * n + 126 * n * n - 67 * n + 15),
    inExpo: n => Math.pow(2, 10 * (n - 1))
  };
  
export function useAnimationTimer(duration = 1000, delay = 0) {
    const [elapsed, setTime] = useState(0);
  
    useEffect(
      () => {
        let animationFrame, timerStop, start;
  
        // Function to be executed on each animation frame
        function onFrame() {
          setTime(Date.now() - start);
          loop();
        }
  
        // Call onFrame() on next animation frame
        function loop() {
          animationFrame = requestAnimationFrame(onFrame);
        }
  
        function onStart() {
          // Set a timeout to stop things when duration time elapses
          timerStop = setTimeout(() => {
            cancelAnimationFrame(animationFrame);
            setTime(Date.now() - start);
          }, duration);
  
          // Start the loop
          start = Date.now();
          loop();
        }
  
        // Start after specified delay (defaults to 0)
        const timerDelay = setTimeout(onStart, delay);
  
        // Clean things up
        return () => {
          clearTimeout(timerStop);
          clearTimeout(timerDelay);
          cancelAnimationFrame(animationFrame);
        };
      },
      [duration, delay] // Only re-run effect if duration or delay changes
    );
  
    return elapsed;
  }
*/

// Hook
export function useMultiKeyPress(down, up) {
    const [keysPressed, setKeyPressed] = useState(new Set([]));
  
    function downHandler(e) {
      e.preventDefault()
      if (!keysPressed.has(e.key)) {
        down(keysPressed.add(e.key))
        setKeyPressed(keysPressed.add(e.key));
      }
    }
  
    const upHandler = (e) => {
        e.preventDefault()
      up(e.key)
      keysPressed.delete(e.key);
      setKeyPressed(keysPressed);
    };
  
    useEffect(() => {
      window.addEventListener("keydown", downHandler);
      window.addEventListener("keyup", upHandler);
      return () => {
        window.removeEventListener("keydown", downHandler);
        window.removeEventListener("keyup", upHandler);
      };
    }, []); // Empty array ensures that effect is only run on mount and unmount
  
    return keysPressed;
  }

export const usePrevious = state => {
    const ref = useRef()
    
    useEffect(() => {
        ref.current = state
    }, [ state ])

    return ref.current
}

export const useInterval = (fn, delay) => {
    const savedFn = useRef()

    useEffect(() => {
        savedFn.current = fn
    }, [ fn ])

    useEffect(() => {
        const tick = () => {
            savedFn.current()
        }

        if (delay != null) {
            const id = global.setInterval(tick, delay)
            return () => global.clearInterval(id)
        }
    }, [ delay ])
}


const dirMap = {
    right: ([ row, col ]) => ([ row, col + 1 ]),
    left: ([ row, col ]) => ([ row, col - 1 ]),
    down: ([ row, col ]) => ([ row + 1, col ]) 
}



// Props { number: Int, position: [ R x C ], side: Int }

const getRow0 = i => i / 11 < 1 ? 0 : Math.floor(i / 11)
const getColumn0 = i => i % 11 < 1 ? 1 : Math.floor(i % 11)

const engineReducer = (state, action) => {
    //console.log("DISPATCH ", action.type)
    switch(action.type) {
        case 'TIME':
        case 'TICK':
            if (getRow0(state.number) === state.tick - 1) {
                const st = ({
                    position: dirMap[state.direction](state.position),
                    ...state 
                })
                //console.log("new state", st)
                return st
            }
        default:
            return state
    }
}

/*
export const useTime = (otherState, interval=625, tick=5) => {
    const [ state, dispatch ] = useReducer(reducer, {
        time: 0,
        tick,
        ...otherState
    })

    useInterval(() => {
        if (tick - 1 === 0) {
            dispatch({type: 'TIME'})
        } else {
            dispatch({type: 'TICK'})
        }
        
    }, Math.round(interval / tick))

    return [ state, dispatch ] 

    /*
    useEffect(() => {
        if (time >= 0) {
            const startTimer = r => global.setTimeout(setTick(tick === 1 ? ticks : dec(tick)),  r * (interval / ticks)) 
            const timers = (new Array(ticks)).fill().map((_, i) => startTimer(i + 1)).concat(
                global.setTimeout(() => setTime(inc(time)), interval)
            )
                
            return () => timers.map(tid => global.clearTimeout(tid))
        }
    }, [ time ])
    
 
}
*/
console.dir(["a"]) //?



const getGridPos = i => {
    const row = i / 11 < 1 ? 1 : 1 + Math.floor(i / 11)
    const column = i % 11 === 0 ? 11 : i % 11
    return [row, column]
}

const getRow = i => i / 11 < 1 ? 1 : 1 + Math.floor(i / 11)
const byRow = (array) => array.reduce((p, c, i) => {
    const cr = getRow(i)
    p[cr - 1] = !p[cr - 1] ? [c] : [ ... p[cr - 1], c ]
    return p
}, [])

const getColumn = i => i % 11 < 1 ? 1 : 1 + Math.floor(i % 11)
const byColumn = array => array.reduce((p, c, i) => {
    
    const cc = getColumn(i)
    p[cc - 1] = p[cc - 1] == null ? [c] : [ ... p[cc - 1], c ]
    return p
}, [])
const pluck = (optics, pre) => target => optics(pre(target))   

const firstColumn = pluck(([ firstColumn, ...rest ] ) => firstColumn, array => byColumn(array))

const lastColumn = pluck(array => array[array.length - 1], array => byColumn(array))
const firstRow = pluck(([ [ _, firstRow ], ...rest ] ) => firstRow, array => byRow(array))
const lastRow = pluck(array => array[array.length - 1], array => byRow(array))

const flColumns = col => [ firstColumn(col), lastColumn(col) ]

const boundCheck = ([     [ _fc, firstRow ], ...rest ]) => {
    const [ _lc, lastRow ] = rest[rest.length - 1]
    console.log(firstRow, lastRow)
    if (firstRow <= 3) {  
        console.log("left bound")
        return true
    } else if (lastRow >= 29) {
        console.log("right bound")
        return true
    }
    return false
}

const test234 = (val) => {
    boundCheck(val) //?
    console.log(val)
}
test234(byRow((new Array(5 * 11).fill()).map((_, i) => [getRow(i) + 3, (i % 11) + 11])))
const useEngineTest = config => reducers => {

}

const useClamp = (grid, idir="right", bounds=[3, 29]) => {
    const [ boundHit, setBoundHit ] = useState(false),
         [ direction, setDirection ] = useState(idir)
    useEffect(() => {
        const [f, l] = flColumns(grid)
        const [min, max] = bounds
        const minHit = col => col.every(([ c, _ ]) => c <= min),
             maxHit = col => col.every(([ c, _ ]) => c >= max)
        if (direction === "down" && boundHit) {
            if (minHit(f)) {
                setDirection("right")
            } else if (maxHit(f)) {
                setDirection("left")
            }
            setBoundHit(false)
        } else if (minHit(f) || maxHit(f)) {    
            setBoundHit(true)
            setDirection("down")
        }
        
    }, [ grid, direction, boundHit ])

    return {
        boundHit,
        direction
    }
    

}
/*
const useEngine = () => {
    const [ grid, setGrid ] = useState((new Array(5 * 11).fill()).map((_, i) => [getRow(i) + 3, (i % 11) + 11]))
    const { boundHit, direction } = useClamp(grid)

    const time = useTime((t, tick) => () => {
        const moveRow = row => row.map(
            direction === "down" ? ([ col, row ]) => ([ col, row + 1])
            : direction === "right" ? ([ col, row ]) => ([ col + 1, row ])
            : ([ col, row ]) => ([ col - 1, row ]) 
        )

        const newGrid = byRow(grid).reduce((d, c, i) => {
            if (tick === i + 1) {
                moveRow(c, direction)
            }
        })

        setGrid(newGrid)
        
        console.log(`
            Time-Tick: ${time}-${tick}
            Dir: ${direction}
            BoundHit: ${boundHit}        
        `)
    })
    return { grid, boundHit, direction, time }
}
*/

const useEngineex = (init={
    time: 0,
    move: ROW,
    //isPaused: false,
    boundHit: false,
    direction: 'right',
    recentMove: 'right',
    live: (new Array(5 * 11).fill()).map((_, i) => [getRow(i) + 3, (i % 11) + 11]),
    /*
        game: {
            lives: 3,
            dead: [],
            live: (new Array(5 * 11).fill())
        }
        */
} ) => {
    const reducers = (p, a) => {
        const actionDef = {
            'INIT': q => ({
                ...q,
                time: 1
            }),
            'TICK': q => q.move <= 1 ? {
                ...q,
                move: ROW,
                boundHit: boundCheck(byRow(q.live)),
                time: q.time + 1,
                direction: boundCheck(byRow(q.live)) ? (q.direction === 'right' ? 'left' : 'right') 
                                                     : q.direction,
                recentMove: boundCheck(byRow(q.live)) ? 'down' : q.direction,
                live: byRow(q.live).reduce((d, c, i) => {
                    //console.log("FIRST OF ROW", c[0], " LAST OF ROW: ",c[c.length - 1])
                    console.log("bound check: ===> ", boundCheck(byRow(q.live)))

                    if (i === q.move - 1) {
                        const boundHit = q.boundHit  //boundCheck(c)
                        const move = q.direction === 'right' ? ((a, b) => a + b) : ((a, b) => a - b)
                        return d.concat(c.map(boundHit ? ([row, col]) => ([row + 1, col])  
                                                      : ([row, col]) => ([row, move(col, 1)])))
                    }
                    return d.concat(c)
                }, [])

            } : {
                ...q,
                move: q.move - 1,
                direction: q.boundHit ? (q.direction === 'right' ? 'left' : 'right') 
                : q.direction,
                //recentMove: boundCheck(byRow(q.live)) ? 'down' : q.direction,
                //boundHit: boundCheck(byRow(q.live)),
                live: byRow(q.live).reduce((d, c, i) => {
                    if (i === q.move - 1) {
                        test234(byRow(q.live))
                        const boundHit = q.boundHit//boundCheck(c)
                        const move = q.direction === 'right' ? (a, b) => a + b : (a, b) => a - b
                        return d.concat(c.map(boundHit ? ([row, col]) => ([row + 1, col])  
                                                      : ([row, col]) => ([row, move(col, 1)])))
                    }
                    return d.concat(c)
                }, [])
            }
        }
        console.log(a, p)
        return actionDef[a] != null ? actionDef[a](p) : p
    }
    const [ state, dispatch ] = useReducer(reducers, init)

    //if (state.game?.dead?.length >= 1) {}
    /*
    useEffect(() => {
        if (state.time === 0) {
            dispatch('INIT')
        }
    }, [])

    */
    const test = p => p.move < 1 ? {
        ...p,
        move: ROW,
        time: p.time + 1

    } : {
        ...p,
        move: p.move - 1,
        live: byRow(p.live).reduce((p, c, i) => {
            if (i === p.move - 1) {
                return p.concat(c.map(([row, col]) => ([row, col + 1])))
            }
            return p.concat(c)
        }, [])
    }

    useEffect(() => {
        //console.log("post: ", test(state) )
        if (state.time >= 0) {
        //dispatch('TICK')
        const stagTime = r => global.setTimeout(() => dispatch('TICK'),  r * 125) 
        const timers = (new Array(ROW)).fill().map((_, i) => stagTime(i + 1))
            
        return () => timers.map(tid => global.clearTimeout(tid))
        }
    }, [ state.time ])

    return state
}



//export default useTime