import reducer from "../common/reducers/game";
import uuid from "uuid/v4";
import { EventEmitter } from "events";
import redux from "redux";

const NEW_ACTION_EVENT = "new-action";

class State {
	constructor() {
		this._stores = {};
		this._eventEmitter = new EventEmitter();
	}

	newStore() {
		const storeId = uuid();
		this._stores[storeId] = redux.createStore(reducer);
		return storeId;
	}

	saveAction(storeId, action) {
		if (action.type !== "NEXT_FRAME") {
			console.log("Saving action", action);
		}

		if (action.type === "NEW_STORE") {
			this._stores[storeId] = redux.createStore(reducer);
			return;
		}

		const store = this._stores[storeId];
		if (!store) {
			return;
		}

		store.dispatch(action);
		this._eventEmitter.emit(getNewActionEventName(storeId), action);
		return Promise.resolve();
	}

	getState(storeId) {
		return this._stores[storeId].getState();
	}

	subscribe(storeId, cb) {
		this._eventEmitter.on(getNewActionEventName(storeId), cb);
	}

	unsubscribe(storeId, cb) {
		this._eventEmitter.removeListener(getNewActionEventName(storeId), cb);
	}
}

function getNewActionEventName(storeId) {
	return NEW_ACTION_EVENT + "-" + storeId;
}

export default State;
