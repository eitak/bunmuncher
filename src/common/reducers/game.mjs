import { boardSize, directions } from "../constants";
import _ from "lodash";

const initialBoard = Array(boardSize)
	.fill()
	.map((unused, i) => {
		return Array(boardSize)
			.fill()
			.map((unused, j) => {
				return { position: { i, j }, players: [] };
			});
	});

export default (state = { board: initialBoard, players: {} }, action) => {
	switch (action.type) {
		case "ADD_PLAYER":
			return addPlayer(state, action);
		case "SET_PLAYER_DIRECTION":
			return setPlayerDirection(state, action);
		case "NEXT_FRAME":
			return nextFrame(state);
		default:
			return state;
	}
};

function setPlayerDirection(state, { playerId, direction }) {
	const player = state.players[playerId];
	const { i, j } = player.position;
	const currentDirection = player.direction;

	// Don't let player move in opposite to current direction if not in own territory.
	const inOwnTerritory = state.board[i][j].filledPlayerId === playerId;
	const forbiddenMove =
		_.isEqual([currentDirection, direction].sort(), [directions.UP, directions.DOWN].sort()) ||
		_.isEqual([currentDirection, direction].sort(), [directions.LEFT, directions.RIGHT].sort());
	if (!inOwnTerritory && forbiddenMove) {
		return state;
	}

	return {
		board: state.board,
		players: {
			...state.players,
			[playerId]: {
				...player,
				nextDirection: direction
			}
		}
	};
}

function addPlayer({ board, players }, { player }) {
	const playerId = player.id;
	const position = player.position;

	const cell = board[position.i][position.j];
	const newCell = { ...cell, players: [...cell.players, playerId], filledPlayerId: playerId };

	return {
		board: updateCell(board, position, newCell),
		players: { ...players, [playerId]: player }
	};
}

function nextFrame({ board, players }) {
	const nextPositions = _.mapValues(
		players,
		player => getNextPosition(player) || player.position
	);
	const playersGroupedByPosition = _.groupBy(_.keys(players), playerId =>
		getPositionId(nextPositions[playerId])
	);

	const killedPlayers = _.compact(
		_.uniq(
			_.flatMap(_.values(playersGroupedByPosition), playersAtPosition => {
				return playersAtPosition.map(playerId => {
					const position = nextPositions[playerId];
					const cell = board[position.i][position.j];

					// Killed from no movement.
					// const player = players[playerId];
					// const noMovement = _.isEqual(position, player.position);
					// if (noMovement) {
					// 	return playerId;
					// }

					// Killed by collision
					const collision =
						playersAtPosition.length > 1 && cell.filledPlayerId !== playerId;
					if (collision) {
						return playerId;
					}

					// Killed by path collision
					if (cell.pathPlayerId) {
						return cell.pathPlayerId;
					}
				});
			})
		)
	);

	// Update players.
	const nextPlayers = _.mapValues(players, player => {
		const playerId = player.id;
		const position = nextPositions[playerId];
		const direction = player.nextDirection || player.direction;
		const killed = player.killed || killedPlayers.indexOf(playerId) >= 0;
		const path = [...player.path, position];
		const pathComplete = isPathComplete(board, { id: playerId, path });
		return { ...player, position, direction, killed, path: pathComplete || killed ? [] : path };
	});

	const result = {
		board: getNewBoard(board, nextPlayers, playersGroupedByPosition),
		players: nextPlayers
	};

	return result;
}

function getNewBoard(board, players, playersGroupedByPosition) {
	const newBoard = Array(boardSize)
		.fill(undefined)
		.map(() => Array(boardSize).fill(undefined));

	for (let i = 0; i < boardSize; i++) {
		for (let j = 0; j < boardSize; j++) {
			if (newBoard[i][j]) {
				continue;
			}

			const { area, filledPlayerId } = getArea({ i, j }, board, players);
			_.forEach(area, position => {
				const cell = board[position.i][position.j];
				const playersAtCell = playersGroupedByPosition[getPositionId(position)];
				const pathPlayerId = getPathPlayerId(cell, playersAtCell, players);
				newBoard[position.i][position.j] = {
					...cell,
					players: playersAtCell,
					filledPlayerId,
					pathPlayerId: pathPlayerId === filledPlayerId ? undefined : pathPlayerId
				};
			});
		}
	}

	return newBoard;
}

function getArea(initialPosition, board, players) {
	const filledPlayerId = getFilledOrPathCompletePlayerId(initialPosition, board, players);
	if (filledPlayerId) {
		return getFilledArea(initialPosition, board, players);
	}

	return getEmptyArea(initialPosition, board, players);
}

function getEmptyArea(initialPosition, board, players) {
	const area = [];
	const filledPlayerIds = [];

	const stack = [initialPosition];
	while (stack.length > 0) {
		const position = stack.pop();

		if (!position) {
			filledPlayerIds.push(undefined);
			continue;
		}

		const alreadyInArea = _.find(area, areaPosition => _.isEqual(areaPosition, position));
		if (alreadyInArea) {
			continue;
		}

		const filledPlayerId = getFilledOrPathCompletePlayerId(position, board, players);
		if (filledPlayerId) {
			filledPlayerIds.push(filledPlayerId);
			continue;
		}

		area.push(position);

		stack.push(getNextPosition({ position, direction: directions.UP }));
		stack.push(getNextPosition({ position, direction: directions.DOWN }));
		stack.push(getNextPosition({ position, direction: directions.LEFT }));
		stack.push(getNextPosition({ position, direction: directions.RIGHT }));
	}

	const filledPlayerId = _.uniq(filledPlayerIds).length === 1 ? filledPlayerIds[0] : undefined;
	return { area, filledPlayerId };
}

function getFilledArea(initialPosition, board, players) {
	const area = [];

	const filledPlayerId = getFilledOrPathCompletePlayerId(initialPosition, board, players);

	const stack = [initialPosition];
	while (stack.length > 0) {
		const position = stack.pop();

		if (!position) {
			continue;
		}

		const alreadyInArea = _.find(area, areaPosition => _.isEqual(areaPosition, position));
		if (alreadyInArea) {
			continue;
		}

		const cellFilledPlayerId = getFilledOrPathCompletePlayerId(position, board, players);
		if (cellFilledPlayerId === filledPlayerId) {
			area.push(position);
			continue;
		}

		stack.push(getNextPosition({ position, direction: directions.UP }));
		stack.push(getNextPosition({ position, direction: directions.DOWN }));
		stack.push(getNextPosition({ position, direction: directions.LEFT }));
		stack.push(getNextPosition({ position, direction: directions.RIGHT }));
	}

	return { area, filledPlayerId };
}

function getFilledOrPathCompletePlayerId(position, board, players) {
	const cell = board[position.i][position.j];
	const pathPlayerId = cell.pathPlayerId;
	const pathPlayer = pathPlayerId && players[pathPlayerId];
	if (pathPlayer && !pathPlayer.killed && pathPlayer.path.length === 0) {
		return pathPlayerId;
	}

	const filledPlayerId = cell.filledPlayerId;
	if (filledPlayerId && !players[filledPlayerId].killed) {
		return filledPlayerId;
	}
}

function getPathPlayerId(cell, playersAtCell, players) {
	const currentPathPlayerId = cell.pathPlayerId;
	const currentPathPlayer = currentPathPlayerId && players[currentPathPlayerId];
	const currentPathStillActive =
		currentPathPlayer && !currentPathPlayer.killed && currentPathPlayer.path.length > 0;
	if (currentPathStillActive) {
		return currentPathPlayerId;
	}

	return _.find(playersAtCell, playerId => !players[playerId].killed);
}

function isPathComplete(board, player) {
	const path = player.path;
	if (path.length === 0) {
		return false;
	}

	const playerId = player.id;

	// Check that the last element in the path is in filled cell.
	const lastInPath = path[path.length - 1];
	const lastInPathIsInFilledCell = board[lastInPath.i][lastInPath.j].filledPlayerId === playerId;
	if (!lastInPathIsInFilledCell) {
		return false;
	}

	if (path.length === 1) {
		return true;
	}

	// Check that first in path is next to a filled cell.
	const firstInPath = path[0];
	const adjacentPositions = _.compact(
		_.values(directions).map(direction => getNextPosition({ position: firstInPath, direction }))
	);
	const firstInPathIsNotNextToAFilledCell = adjacentPositions.every(
		({ i, j }) => board[i][j].filledPlayerId !== playerId
	);
	if (firstInPathIsNotNextToAFilledCell) {
		return false;
	}

	return true;
}

function getNextPosition(player) {
	const actualDirection = player.nextDirection || player.direction;
	const { i, j } = player.position;
	if (actualDirection === directions.LEFT && j > 0) {
		return { i, j: j - 1 };
	}

	if (actualDirection === directions.RIGHT && j < boardSize - 1) {
		return { i, j: j + 1 };
	}

	if (actualDirection === directions.UP && i > 0) {
		return { i: i - 1, j };
	}

	if (actualDirection === directions.DOWN && i < boardSize - 1) {
		return { i: i + 1, j };
	}
}

function getPositionId({ i, j }) {
	return `${i}-${j}`;
}

function updateCell(board, { i, j }, newContents) {
	const row = board[i];
	const newRow = [...row.slice(0, j), newContents, ...row.slice(j + 1)];
	return [...board.slice(0, i), newRow, ...board.slice(i + 1)];
}
