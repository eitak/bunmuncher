import React, { Component } from "react";
import _ from "lodash";
import PropTypes from "prop-types";

import { characters, nameMaxLength } from "../../common/constants";

class JoinGame extends Component {
	constructor(props) {
		super(props);
		this.state = { player: { ...characters[0], name: "" } };
	}

	handleSubmit(event) {
		this.props.joinGame(this.state.player);
		event.preventDefault();
	}

	handleNameChange(event) {
		this.setState({ player: { ...this.state.player, name: event.target.value } });
		event.preventDefault();
	}

	handleCharacterChange(event) {
		const icon = event.target.value;
		const character = _.find(characters, character => character.icon === icon);
		this.setState({ player: { ...this.state.player, ...character } });
		event.preventDefault();
	}

	render() {
		return (
			<form onSubmit={this.handleSubmit.bind(this)} autoComplete="off">
				<div className="row">
					<div className="form-group col-md-2">
						<select
							className="form-control"
							id="character"
							onChange={this.handleCharacterChange.bind(this)}
							required
						>
							{characters.map((character, i) => (
								<option key={i} style={character.fillStyle} value={character.icon}>
									{character.icon}
								</option>
							))}
						</select>
					</div>
					<div className="form-group col-md-10">
						<input
							className="form-control"
							id="name"
							placeholder="name"
							value={this.state.player.name}
							onChange={this.handleNameChange.bind(this)}
							maxLength={nameMaxLength}
							required
						/>
					</div>
					<div className="form-group col">
						<input
							type="submit"
							className="btn btn-light"
							style={{ width: "100%" }}
							value={`${this.state.player.icon} join game ${this.state.player.icon}`}
							required
						/>
					</div>
				</div>
			</form>
		);
	}
}

JoinGame.propTypes = {
	joinGame: PropTypes.func.isRequired
};

export default JoinGame;
