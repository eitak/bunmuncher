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

// Hot Module Replacement
if (module.hot) {
	module.hot.accept();
}
