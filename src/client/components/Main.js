import React from "react";
import _ from "lodash";

import Bunny from "./Bunny";
import Game from "./Game";
import BunCounter from "../containers/BunCounter";

const Main = () => (
	<div className="container">
		<div style={{ textAlign: "center" }}>
			<h1>
				<Bunny /> bunmuncher <Bunny />
			</h1>
		</div>

		<Game />

		<BunCounter />
	</div>
);

export default Main;
