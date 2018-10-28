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
	const nextPositions = _.mapValues(players, getNextPosition);
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

	// Update players with new positions.
	const nextPlayers = _.mapValues(players, player => {
		const playerId = player.id;
		const position = nextPositions[playerId];
		const direction = player.nextDirection || player.direction;
		const killed = player.killed || killedPlayers.indexOf(playerId) >= 0;
		const path = [...player.path, position];
		const pathComplete = isPathComplete(board, { id: playerId, path });
		return { ...player, position, direction, killed, path: pathComplete ? [] : path };
	});

	// Cells that are already filled or are filled with a complete path.
	const definiteFilledCells = updateBoard(board, ({ pathPlayerId, filledPlayerId }) => {
		const pathPlayer = pathPlayerId && nextPlayers[pathPlayerId];
		if (pathPlayer && !pathPlayer.killed && pathPlayer.path.length === 0) {
			return pathPlayerId;
		}

		const filledPlayer = filledPlayerId && nextPlayers[filledPlayerId];
		if (filledPlayer && !filledPlayer.killed) {
			return filledPlayerId;
		}
	});

	const nextBoard = updateBoard(board, cell => {
		const filledPlayerId = getFilledPlayerId(definiteFilledCells, cell);
		const players = playersGroupedByPosition[getPositionId(cell.position)] || [];

		const currentPathPlayerId = cell.pathPlayerId;
		const currentPathPlayer = currentPathPlayerId && nextPlayers[currentPathPlayerId];
		if (currentPathPlayer && !currentPathPlayer.killed && currentPathPlayer.path.length > 0) {
			return { ...cell, players, filledPlayerId, pathPlayerId: currentPathPlayerId };
		}

		const playerIdAtCell = _.find(players, playerId => !nextPlayers[playerId].killed);
		const pathPlayerId = filledPlayerId === playerIdAtCell ? undefined : playerIdAtCell;

		return { ...cell, players, filledPlayerId, pathPlayerId };
	});

	return { board: nextBoard, players: nextPlayers };
}

function getFilledPlayerId(definiteFilledCells, cell) {
	// Is cell filled by path complete or was already filled.
	const existingFilledPlayerId = definiteFilledCells[cell.position.i][cell.position.j];
	if (existingFilledPlayerId) {
		return existingFilledPlayerId;
	}

	// Is cell newly filled.
	const { i, j } = cell.position;
	const row = definiteFilledCells[i];

	const nextFilledLeft = _.findLast(row.slice(0, j));
	if (!nextFilledLeft) {
		return;
	}

	const nextFilledPlayerId = nextFilledLeft;

	const nextFilledRight = _.find(row.slice(j + 1));
	if (!nextFilledRight || nextFilledRight !== nextFilledPlayerId) {
		return;
	}

	const column = _.zip(...definiteFilledCells)[j];
	const nextFilledUp = _.findLast(column.slice(0, i));
	if (!nextFilledUp || nextFilledUp !== nextFilledPlayerId) {
		return;
	}

	const nextFilledDown = _.find(column.slice(i + 1));
	if (!nextFilledDown || nextFilledDown !== nextFilledPlayerId) {
		return;
	}

	return nextFilledPlayerId;
}

function isPathComplete(board, player) {
	const path = player.path;
	if (path.length === 0) {
		return;
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
	const adjacentPositions = _.values(directions).map(direction =>
		getNextPosition({ position: firstInPath, direction })
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

	return { i, j };
}

function getPositionId({ i, j }) {
	return `${i}-${j}`;
}

function updateBoard(board, updateCell) {
	return board.map(row => row.map(updateCell));
}

function updateCell(board, { i, j }, newContents) {
	const row = board[i];
	const newRow = [...row.slice(0, j), newContents, ...row.slice(j + 1)];
	return [...board.slice(0, i), newRow, ...board.slice(i + 1)];
}
