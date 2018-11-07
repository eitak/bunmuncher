export default (state = false, action) => {
	switch (action.type) {
		case "SET_PLAYER_ID":
			return action.playerId;
		default:
			return state;
	}
};
