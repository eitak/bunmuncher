import _ from "lodash";

import { directions, boardSize, characters } from "./common/constants";
import reducer from "./common/reducers/game";
import { createStore } from "redux";

const numPlayers = 4;
const snapshotSize = 20;

const playerStyles = _.range(numPlayers).map((position, index) => {
	return characters[index % characters.length];
});

const actions = _.values(directions);
module.exports.actions = actions;

const gridSize = snapshotSize;
module.exports.gridSize = gridSize;

module.exports.start = start;
async function start(getNextAction) {
	const sessionId = Date.now();
	let gameId = 0;

	while (true) {
		console.log("Start game " + gameId);

		const store = createStore(reducer);
		_.sampleSize(_.range(boardSize * boardSize), numPlayers)
			.map((x, index) => {
				const position = { i: x % boardSize, j: Math.floor(x / boardSize) };
				const character = characters[index % characters.length];
				return {
					id: `${index}`,
					name: "ROBOT_" + (index + 1),
					position: { i: x % boardSize, j: Math.floor(x / boardSize) },
					path: [],
					killed: false,
					direction: _.sample(_.values(directions)),
					...character
				};
			})
			.forEach(player => {
				console.log({ type: "ADD_PLAYER", player });
				store.dispatch({ type: "ADD_PLAYER", player });
			});

		let frameId = 0;
		let terminal = false;
		let score = 0;

		while (true) {
			const { players, board, scores } = store.getState();
			terminal =
				!_.findKey(players, ["killed", false]) && !_.findKey(scores, boardSize * boardSize);

			const orderedPlayers = _.sortBy(Object.values(players), "id");

			const frames = orderedPlayers.map(player => {
				const { i, j } = player.position;
				const radius = Math.floor(snapshotSize / 2);
				const topCoordinate = {
					i:
						i - radius < 0
							? 0
							: i + radius > boardSize
								? boardSize - snapshotSize
								: i - radius,
					j:
						j < radius
							? 0
							: j + radius > boardSize
								? boardSize - snapshotSize
								: j - radius
				};

				const boardSnapshot = board
					.slice(topCoordinate.i, topCoordinate.i + snapshotSize)
					.map(row => row.slice(topCoordinate.j, topCoordinate.j + snapshotSize));

				return {
					gameId: sessionId + "-" + gameId,
					frameId,
					state: boardSnapshot,
					snapshot: boardSnapshot,
					data: {
						frameIdx: frameId,
						score: player.killed ? 0 : scores[player.id],
						terminal
					}
				};
			});

			const actions = await getNextAction(frames);

			if (terminal) {
				console.log("End of game. Score: " + score);
				break;
			}

			actions.forEach((direction, index) => {
				store.dispatch({
					type: "SET_PLAYER_DIRECTION",
					direction,
					playerId: orderedPlayers[index].id
				});
			});

			// await wait(500);

			store.dispatch({ type: "NEXT_FRAME" });

			frameId++;
		}
		gameId++;
	}
}

function wait(ms) {
	return new Promise(cb => setTimeout(cb, ms));
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
	return +frame.score;
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
				ctx.fillStyle = playerStyles[cell.pathPlayerId].pathStyle.backgroundColor;
			} else if (cell.filledPlayerId) {
				ctx.fillStyle = playerStyles[cell.filledPlayerId].fillStyle.backgroundColor;
			} else {
				ctx.fillStyle = "white";
			}

			if (cell.players.length > 0) {
				ctx.fillText(playerStyles[cell.players[0]].icon, x, y);
			}
			ctx.fillRect(x, y, cw, ch);
		});
	});
}
