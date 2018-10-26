import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { boardSize, boardState, directions } from "../../common/constants";

const keyDirectionMapping = {
	ArrowDown: directions.DOWN,
	ArrowUp: directions.UP,
	ArrowLeft: directions.LEFT,
	ArrowRight: directions.RIGHT
};

class GameBoard extends Component {
	handleKeyPress(event) {
		console.log(event);
		const direction = keyDirectionMapping[event.key];
		if (direction) {
			this.props.changeDirection(direction);
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
	let backgroundColor;
	if (item.state === boardState.FILLED) {
		const ownerPlayer = players[item.ownerPlayerId];
		backgroundColor = ownerPlayer.colour;
	}

	const style = {
		float: "left",
		width: 25,
		height: 25,
		margin: 0,
		padding: 0,
		backgroundColor
	};

	if (item.players.length > 0) {
		const player = players[item.players[0]];
		return (
			<div style={{ ...style }}>
				<span role="img" aria-label={player.id} style={{ padding: 3 }}>
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
