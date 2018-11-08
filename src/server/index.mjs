import Bundler from "parcel-bundler";
import express from "express";
import path from "path";
import _ from "lodash";
import State from "./state";
import { directions, actionsToSave, boardSize } from "../common/constants";
import uuid from "uuid/v4";
import cookieSession from "cookie-session";

// Set up state
const state = new State();
const storeId = state.newStore();

// Set up server
const app = express();
app.use(express.json());

app.use(
	cookieSession({
		name: "session",
		keys: ["secret cat"],
		maxAge: 24 * 60 * 60 * 1000 // 24 hours
	})
);

setInterval(() => state.saveAction(storeId, { type: "NEXT_FRAME" }), 500);

app.post("/api/game", (request, response) => {
	const action = request.body;
	if (actionsToSave.indexOf(action.type) < 0) {
		response.send(400);
		return;
	}

	if (action.type === "ADD_PLAYER") {
		// TODO: validate player
		action.player.position = { i: _.random(0, boardSize), j: _.random(0, boardSize) };
		action.player.direction = _.sample(directions);
		action.player.path = [];
		action.player.id = request.session.playerId;
	}

	if (action.type === "SET_PLAYER_DIRECTION") {
		// TODO: verify player is not dead
		action.playerId = request.session.playerId;
	}

	// TODO: validate action
	state
		.saveAction(storeId, request.body)
		.then(() => response.sendStatus(200))
		.catch(err => {
			console.error("Failed to save action", err);
			response.sendStatus(500);
		});
});

app.get("/api/game/actions", (request, response) => {
	const playerId = uuid();
	request.session.playerId = playerId;

	response.writeHead(200, {
		"Content-Type": "text/event-stream",
		"Cache-Control": "no-cache",
		Connection: "keep-alive"
	});

	response.write(`data: ${JSON.stringify({ type: "SET_PLAYER_ID", playerId, saved: true })}\n\n`);

	response.write(
		`data: ${JSON.stringify({
			type: "GAME_SNAPSHOT",
			snapshot: state.getState(storeId),
			saved: true
		})}\n\n`
	);

	const cb = action => {
		response.write(`data: ${JSON.stringify({ ...action, saved: true })}\n\n`);
	};
	state.subscribe(storeId, cb);

	request.on("close", () => {
		state.unsubscribe(storeId, cb);
		response.end();
	});
});

// Use parcel-bundler for client code
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const bundler = new Bundler(path.join(__dirname, "./index.html"), {});
app.use(bundler.middleware());

// Listen on port 1234
app.listen(1234, () => console.log("Listening on port 1234 🐰"));
