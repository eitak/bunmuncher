import React from "react";
import _ from "lodash";
import PropTypes from "prop-types";

import Bunny from "./Bunny";

const BunCounter = ({ addBun, bunCount }) => (
	<div style={{ padding: "1em", textAlign: "center" }}>
		<button type="button" className="btn btn-light" onClick={addBun}>
			<Bunny />
		</button>
		<div>
			{_.range(bunCount).map(i => (
				<Bunny key={i} />
			))}
		</div>
	</div>
);

BunCounter.propTypes = {
	addBun: PropTypes.func.isRequired,
	bunCount: PropTypes.number.isRequired
};

export default BunCounter;
