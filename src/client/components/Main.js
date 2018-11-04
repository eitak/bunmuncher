import React from "react";
import _ from "lodash";
import PropTypes from "prop-types";

import Bunny from "./Bunny";
import GameBoard from "../containers/GameBoard";
import Scores from "../containers/Scores";

const Main = ({ addBun, bunCount }) => (
	<div className="container">
		<h1>
			<Bunny /> bunmuncher <Bunny />
		</h1>
		<button type="button" className="btn btn-light" onClick={addBun}>
			<Bunny />
		</button>
		<div>
			{_.range(bunCount).map(i => (
				<Bunny key={i} />
			))}
		</div>
		<GameBoard />
		<Scores />
	</div>
);

Main.propTypes = {
	addBun: PropTypes.func.isRequired,
	bunCount: PropTypes.number.isRequired
};

export default Main;
