import React from "react";
import _ from "lodash";

export default ({ scores, players }) => {
	const scoresToDisplay = _.sortBy(
		Object.entries(scores).map(entry => {
			return { score: entry[1], player: players[entry[0]] };
		}),
		"score",
		"desc"
	);

	return (
		<table className="table">
			<thead>
				<tr>
					<th scope="col">#</th>
					<th scope="col">Name</th>
					<th scope="col">Score</th>
				</tr>
			</thead>
			<tbody>
				{scoresToDisplay.map((score, position) => {
					console.log(score, position);
					return (
						<tr key={score.player.id}>
							<th scope="row">{position}</th>
							<td>
								{score.player.name} {score.player.icon}
							</td>
							<td>{score.score}</td>
						</tr>
					);
				})}
			</tbody>
		</table>
	);
};
