import { connect } from "react-redux";
import JoinGameComponent from "../components/JoinGame";

const mapStateToProps = state => {
	return {};
};

const mapDispatchToProps = dispatch => {
	return {
		joinGame: player => {
			dispatch({ type: "ADD_PLAYER", player });
		}
	};
};

const JoinGame = connect(
	mapStateToProps,
	mapDispatchToProps
)(JoinGameComponent);

export default JoinGame;
