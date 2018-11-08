import { connect } from "react-redux";
import GameBoardComponent from "../components/GameBoard";
import { boardSize, snapshotSize } from "../../common/constants";

const mapStateToProps = ({ playerId, game }) => {
	const player = playerId && game.players[playerId];
	if (!player) {
		return { players: {}, board: [] };
	}

	const { i, j } = player.position;

	const radius = Math.floor(snapshotSize / 2);
	const topCoordinate = {
		i: i - radius < 0 ? 0 : i + radius > boardSize ? boardSize - snapshotSize : i - radius,
		j: j < radius ? 0 : j + radius > boardSize ? boardSize - snapshotSize : j - radius
	};
	const board = game.board
		.slice(topCoordinate.i, topCoordinate.i + snapshotSize)
		.map(row => row.slice(topCoordinate.j, topCoordinate.j + snapshotSize));
	return {
		players: game.players,
		board,
		player
	};
};

const mapDispatchToProps = dispatch => {
	return {
		changeDirection: ({ direction, playerId }) => {
			dispatch({ type: "SET_PLAYER_DIRECTION", direction, playerId });
		}
	};
};

const GameBoard = connect(
	mapStateToProps,
	mapDispatchToProps
)(GameBoardComponent);

export default GameBoard;
