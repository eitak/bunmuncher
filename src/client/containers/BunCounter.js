import { connect } from "react-redux";
import BunCounterComponent from "../components/BunCounter";

const mapStateToProps = (state, ownProps) => {
	return {
		bunCount: state.bunCount
	};
};

const mapDispatchToProps = dispatch => {
	return {
		addBun: () => {
			dispatch({ type: "ADD_BUN" });
		}
	};
};

const BunCounter = connect(
	mapStateToProps,
	mapDispatchToProps
)(BunCounterComponent);

export default BunCounter;
