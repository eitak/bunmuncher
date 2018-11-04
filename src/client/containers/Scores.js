import { connect } from "react-redux";
import ScoresComponent from "../components/Scores";

const mapStateToProps = state => {
	return {
		scores: state.game.scores,
		players: state.game.players
	};
};

const Scores = connect(mapStateToProps)(ScoresComponent);

export default Scores;
