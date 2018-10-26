export default (state = 0, action) => {
	switch (action.type) {
		case "ADD_BUN":
			return state + 1;
		default:
			return state;
	}
};
