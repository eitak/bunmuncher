import React from "react";
import ReactDOM from "react-dom";
import { createStore, applyMiddleware, compose } from "redux";
import { Provider } from "react-redux";
import reducer from "../common/reducers";
import Main from "./containers/Main";

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(reducer, composeEnhancers(applyMiddleware(socketIoMiddleware)));

const rootElement = document.getElementById("root");
const render = () =>
	ReactDOM.render(
		<Provider store={store}>
			<Main />
		</Provider>,
		rootElement
	);
render();
store.subscribe(render);

store.dispatch({
	type: "ADD_PLAYER",
	player: {
		id: "katie",
		icon: "🐰",
		direction: "DOWN",
		colour: "DeepPink"
	},
	position: { i: 10, j: 5 }
});
setInterval(() => store.dispatch({ type: "NEXT_FRAME" }), 300);

// Hot Module Replacement
if (module.hot) {
	module.hot.accept();
}
