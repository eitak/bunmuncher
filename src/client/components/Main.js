import React, { Component } from "react";
import _ from "lodash";

import PropTypes from "prop-types";

const Main = ({ addBun, bunCount }) => (
	<div className="container">
		<h1>🐰 bunmuncher 🐰</h1>
		<button type="button" className="btn btn-light" onClick={addBun}>
			🐰
		</button>
		<div>
			{_.range(bunCount).map(i => (
				<span key={i}>🐰</span>
			))}
		</div>
	</div>
);

Main.propTypes = {
	addBun: PropTypes.func.isRequired,
	bunCount: PropTypes.number.isRequired
};

export default Main;
