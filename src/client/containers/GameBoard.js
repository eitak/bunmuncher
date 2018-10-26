import { connect } from "react-redux";
import GameBoardComponent from "../components/GameBoard";
import { actions } from "../../common/constants";

const mapStateToProps = (state, ownProps) => {
	return {
		players: state.game.players,
		board: state.game.board
	};
};

const mapDispatchToProps = dispatch => {
	return {
		changeDirection: direction => {
			dispatch({ type: "SET_PLAYER_DIRECTION", direction, playerId: "katie" });
		}
	};
};

const GameBoard = connect(
	mapStateToProps,
	mapDispatchToProps
)(GameBoardComponent);

export default GameBoard;
