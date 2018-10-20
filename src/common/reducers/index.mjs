export default (state = { bunCount: 0 }, action) => {
	switch (action.type) {
		case "ADD_BUN":
			console.log("add bun");
			return { ...state, bunCount: state.bunCount + 1 };
		default:
			return state;
	}
};
