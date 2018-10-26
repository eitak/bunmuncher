import { combineReducers } from "redux";
import bunCount from "./bunCount";
import game from "./game";

export default combineReducers({ bunCount, game });
