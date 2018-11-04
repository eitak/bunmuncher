import _ from "lodash";

import { directions, boardSize } from "./common/constants";
import reducer from "./common/reducers/game";
import { createStore } from "redux";

const playerId = "super-ml";
const icon = "🤖";
const fillColour = "SpringGreen";
const pathColour = "PaleGreen";

const actions = _.values(directions);
module.exports.actions = actions;

const gridSize = boardSize;
module.exports.gridSize = gridSize;

module.exports.start = start;
async function start(getNextAction) {
	const sessionId = Date.now();
	let gameId = 0;

	while (true) {
		console.log("Start game " + gameId);

		const store = createStore(reducer);

		store.dispatch({
			type: "ADD_PLAYER",
			player: {
				id: playerId,
				name: "SUPER ML",
				icon,
				direction: _.sample(_.values(directions)),
				fillStyle: {
					backgroundColor: fillColour
				},
				pathStyle: {
					backgroundColor: pathColour
				},
				path: [],
				position: _.sample(_.flatten(store.getState().board)).position
			}
		});

		let frameId = 0;
		let terminal = false;
		let score = 0;

		while (true) {
			const { players, board, scores } = store.getState();
			terminal = players[playerId].killed;
			score = scores[playerId];
			const action = await getNextAction({
				gameId: sessionId + "-" + gameId,
				frameId: frameId,
				state: board,
				snapshot: board,
				data: {
					frameIdx: frameId,
					score,
					terminal
				}
			});
			console.log(action);

			if (terminal) {
				console.log("End of game. Score: " + score);
				break;
			}

			store.dispatch({
				type: "SET_PLAYER_DIRECTION",
				direction: action,
				playerId
			});
			store.dispatch({ type: "NEXT_FRAME" });

			frameId++;
		}
		gameId++;
	}
}

export function stateToTensor(state) {
	console.log(state);
	return state.map(row =>
		row.map(cell => [
			cell.pathPlayerId ? 1 : 0,
			cell.filledPlayerId ? 1 : 0,
			cell.players.length > 0 ? 1 : 0,
			1
		])
	);
}

// Defines the reward function, so really part of ML. But it's specific to the game...
export function getScore(frame) {
	return +frame.score - frame.frameIdx / 10;
}

export function renderGameToCanvas(game, canvas) {
	const ctx = canvas.ctx || (canvas.ctx = canvas.getContext("2d"));
	const w = canvas.width;
	const h = canvas.height;
	const cw = w / gridSize;
	const ch = h / gridSize;

	ctx.clearRect(0, 0, w, h);
	ctx.strokeRect(0, 0, w, h);

	game.forEach((row, i) => {
		row.forEach((cell, j) => {
			const x = (i / gridSize) * w;
			const y = (j / gridSize) * h;
			if (cell.pathPlayerId) {
				ctx.fillStyle = pathColour;
			} else if (cell.filledPlayerId) {
				ctx.fillStyle = fillColour;
			} else {
				ctx.fillStyle = "white";
			}

			if (cell.players.length > 0) {
				ctx.fillText(icon, x, y);
			}
			ctx.fillRect(x, y, cw, ch);
		});
	});
}
