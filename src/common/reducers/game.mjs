import { boardSize, boardState, directions } from "../constants";
import _ from "lodash";

const initialBoard = Array(boardSize)
	.fill()
	.map(() => {
		return Array(boardSize)
			.fill()
			.map(() => {
				return {
					players: [],
					state: boardState.EMPTY
				};
			});
	});

export default (state = { board: initialBoard, players: {} }, action) => {
	switch (action.type) {
		case "ADD_PLAYER":
			return addPlayer(state, action);
		case "SET_PLAYER_DIRECTION":
			return {
				board: state.board,
				players: {
					...state.players,
					[action.playerId]: {
						...state.players[action.playerId],
						direction: action.direction
					}
				}
			};
		case "NEXT_FRAME":
			return nextFrame(state);
		default:
			return state;
	}
};

function addPlayer({ board, players }, { player, position }) {
	const nextBoard = _.cloneDeep(board);

	// kill players already at that position

	const playerId = player.id;
	setPlayerPostion(nextBoard, playerId, position);

	const nextBoardPosition = nextBoard[position.i][position.j];
	nextBoardPosition.state = boardState.FILLED;
	nextBoardPosition.ownerPlayerId = player.id;

	return {
		board: nextBoard,
		players: { ...players, [playerId]: player }
	};
}

function nextFrame({ board, players }) {
	const nextBoard = _.cloneDeep(board);
	_.forEach(players, player => movePlayer(nextBoard, player));

	return { board: nextBoard, players };
}

function movePlayer(board, player) {
	const playerId = player.id;
	const currentPosition = getCurrentPosition(board, playerId);

	const nextPosition = getNextPosition(player, currentPosition);

	board[currentPosition.i][currentPosition.j].players = _.remove(
		board[currentPosition.i][currentPosition.j].players,
		playerId
	);
	setPlayerPostion(board, playerId, nextPosition);

	return board;
}

function setPlayerPostion(board, playerId, position) {
	board[position.i][position.j].players.push(playerId);
}

function getNextPosition(player, currentPosition) {
	if (player.direction === directions.LEFT && currentPosition.j > 0) {
		return { i: currentPosition.i, j: currentPosition.j - 1 };
	}

	if (player.direction === directions.RIGHT && currentPosition.j < boardSize - 1) {
		return { i: currentPosition.i, j: currentPosition.j + 1 };
	}

	if (player.direction === directions.UP && currentPosition.i > 0) {
		return { i: currentPosition.i - 1, j: currentPosition.j };
	}

	if (player.direction === directions.DOWN && currentPosition.i < boardSize - 1) {
		return { i: currentPosition.i + 1, j: currentPosition.j };
	}

	return currentPosition;
}

function getCurrentPosition(board, playerId) {
	return board
		.map((row, i) => {
			const j = _.findIndex(row, item => item.players.indexOf(playerId) >= 0);
			return { i, j };
		})
		.filter(item => item.j >= 0)[0];
}
