import React from "react";
import ReactDOM from "react-dom";
import { createStore } from "redux";
import { Provider } from "react-redux";
import reducer from "../common/reducers";
import Main from "./containers/Main";

const store = createStore(reducer);

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
		fillStyle: {
			backgroundColor: "DeepPink"
		},
		pathStyle: {
			backgroundColor: "Pink"
		},
		path: [],
		position: { i: 0, j: 0 }
	}
});
setInterval(() => store.dispatch({ type: "NEXT_FRAME" }), 300);

// Hot Module Replacement
if (module.hot) {
	module.hot.accept();
}
