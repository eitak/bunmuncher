import React from "react";
import _ from "lodash";

import GameBoard from "../containers/GameBoard";
import Scores from "../containers/Scores";
import JoinGame from "../containers/JoinGame";

const Game = () => (
	<div>
		<div className="row justify-content-center">
			<div className="col-md-6">
				<JoinGame />
			</div>
		</div>

		<div className="row">
			<div className="col-md-6">
				<GameBoard />
			</div>
			<div className="col-md-6">
				<Scores />
			</div>
		</div>
	</div>
);

export default Game;
