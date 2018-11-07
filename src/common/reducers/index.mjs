import { combineReducers } from "redux";
import bunCount from "./bunCount";
import game from "./game";
import playerId from "./playerId";

export default combineReducers({ bunCount, game, playerId });
