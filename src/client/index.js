import React from "react";
import ReactDOM from "react-dom";
import { createStore, applyMiddleware } from "redux";
import { Provider } from "react-redux";
import reducer from "../common/reducers";
import { actionsToSave } from "../common/constants";
import Main from "./components/Main";
import axios from "axios";

const saveActionMiddleware = store => next => {
	return action => {
		if (action.saved || actionsToSave.indexOf(action.type) < 0) {
			next(action);
			return;
		}

		axios.post("/api/game", action);
		return;
	};
};

const store = createStore(reducer, applyMiddleware(saveActionMiddleware));

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

const eventSource = new EventSource("/api/game/actions");
eventSource.onmessage = message => {
	store.dispatch(JSON.parse(message.data));
};

// Hot Module Replacement
if (module.hot) {
	module.hot.accept();
}
