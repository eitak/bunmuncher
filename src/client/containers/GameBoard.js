import { connect } from "react-redux";
import GameBoardComponent from "../components/GameBoard";
import { actions } from "../../common/constants";

const mapStateToProps = state => {
	return {
		players: state.game.players,
		board: state.game.board,
		player: state.game.players[state.playerId]
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
