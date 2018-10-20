import { connect } from "react-redux";
import MainComponent from "../components/Main";

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

const Main = connect(
	mapStateToProps,
	mapDispatchToProps
)(MainComponent);

export default Main;
