import Reactotron from 'reactotron-react-js'

Reactotron
  .configure() // we can use plugins here -- more on this later
  .connect() 

function useStateWrapper(fn) {
    const stateWatcher = (...initialState) => {
        let response = fn(...initialState);

        Reactotron.log(...response);

        return response;
    }
    return stateWatcher;
}

export default useStateWrapper;