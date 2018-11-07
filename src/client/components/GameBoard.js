import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { boardSize, directions } from "../../common/constants";

const keyDirectionMapping = {
	ArrowDown: directions.DOWN,
	ArrowUp: directions.UP,
	ArrowLeft: directions.LEFT,
	ArrowRight: directions.RIGHT
};

class GameBoard extends Component {
	handleKeyPress(event) {
		const direction = keyDirectionMapping[event.key];
		if (this.props.player && direction) {
			this.props.changeDirection({
				direction,
				playerId: this.props.player.playerId
			});
		}
	}

	componentWillMount() {
		document.addEventListener("keydown", event => this.handleKeyPress(event));
	}

	componentWillUnmount() {
		document.removeEventListener("keydown", event => this.handleKeyPress(event));
	}

	render() {
		return (
			<div>
				<div>{this.props.player && this.props.player.killed ? "💀💀💀" : null}</div>
				<div
					style={{
						borderWidth: 1,
						borderStyle: "solid",
						display: "inline-block"
					}}
				>
					{_.range(boardSize).map(i => (
						<Row key={i} players={this.props.players} row={this.props.board[i]} />
					))}
				</div>
			</div>
		);
	}
}

GameBoard.propTypes = {
	changeDirection: PropTypes.object.isRequired,
	players: PropTypes.object.isRequired,
	board: PropTypes.array.isRequired
};

const Row = ({ row, players }) => {
	return (
		<div style={{ height: 25, margin: 0, padding: 0 }}>
			{_.range(boardSize).map(i => (
				<Item key={i} players={players} item={row[i]} />
			))}
		</div>
	);
};

const Item = ({ item, players }) => {
	let style = {
		float: "left",
		width: 25,
		height: 25,
		margin: 0,
		padding: 0
	};

	const filledPlayerId = item.filledPlayerId;
	if (filledPlayerId) {
		const filledPlayer = players[filledPlayerId];
		style = {
			...style,
			...filledPlayer.fillStyle
		};
	}

	const pathPlayerId = item.pathPlayerId;
	if (pathPlayerId) {
		const pathPlayer = players[pathPlayerId];
		style = {
			...style,
			...pathPlayer.pathStyle
		};
	}

	const playerId = _.find(item.players, playerId => !players[playerId].killed);
	if (playerId) {
		const player = players[playerId];
		return (
			<div style={{ ...style }}>
				<span role="img" aria-label={player.id} style={{ padding: 4 }}>
					{player.icon}
				</span>
			</div>
		);
	}

	return <div style={style} />;
};

GameBoard.propTypes = {
	players: PropTypes.object.isRequired,
	board: PropTypes.array.isRequired
};

export default GameBoard;
