/**
 * Gen 3 moves
 */
exports.BattleMovedex = {
	absorb: {
		pp: 20,
		inherit: true
	},
	acid: {
		secondary: {
			chance: 10,
			boosts: {
				def: -1
			}
		},
		inherit: true
	},
	acidarmor: {
		pp: 40,
		inherit: true
	},
	aircutter: {
		basePower: 55,
		inherit: true
	},
	ancientpower: {
		isContact: true,
		name: "Ancient Power",
		inherit: true
	},
	aromatherapy: {
		onHit: function (pokemon, source) {
			var side = pokemon.side;
			for (var i = 0; i < side.pokemon.length; i++) {
				side.pokemon[i].status = '';
			}
			this.add('-cureteam', source, '[from] move: Aromatherapy');
		},
		inherit: true
	},
	assist: {
		desc: "The user performs a random move from any of the Pokemon on its team. Assist cannot generate itself, Chatter, Copycat, Counter, Covet, Destiny Bond, Detect, Endure, Feint, Focus Punch, Follow Me, Helping Hand, Me First, Metronome, Mimic, Mirror Coat, Mirror Move, Protect, Sketch, Sleep Talk, Snatch, Struggle, Switcheroo, Thief or Trick.",
		onHit: function (target) {
			var moves = [];
			for (var j = 0; j < target.side.pokemon.length; j++) {
				var pokemon = target.side.pokemon[j];
				if (pokemon === target) continue;
				for (var i = 0; i < pokemon.moves.length; i++) {
					var move = pokemon.moves[i];
					var noAssist = {
						assist: 1,
						chatter: 1,
						copycat: 1,
						counter: 1,
						covet: 1,
						destinybond: 1,
						detect: 1,
						endure: 1,
						feint: 1,
						focuspunch: 1,
						followme: 1,
						helpinghand: 1,
						mefirst: 1,
						metronome: 1,
						mimic: 1,
						mirrorcoat: 1,
						mirrormove: 1,
						protect: 1,
						sketch: 1,
						sleeptalk: 1,
						snatch: 1,
						struggle: 1,
						switcheroo: 1,
						thief: 1,
						trick: 1
					};
					if (move && !noAssist[move]) {
						moves.push(move);
					}
				}
			}
			var move = '';
			if (moves.length) move = moves[this.random(moves.length)];
			if (!move) {
				return false;
			}
			this.useMove(move, target);
		},
		inherit: true
	},
	astonish: {
		basePowerCallback: function (pokemon, target) {
			if (target.volatiles['minimize']) return 60;
			return 30;
		},
		inherit: true
	},
	attract: {
		effect: {
			noCopy: true,
			onStart: function (pokemon, source, effect) {
				if (!(pokemon.gender === 'M' && source.gender === 'F') && !(pokemon.gender === 'F' && source.gender === 'M')) {
					this.debug('incompatible gender');
					return false;
				}
				if (!this.runEvent('Attract', pokemon, source)) {
					this.debug('Attract event failed');
					return false;
				}

				if (effect.id === 'cutecharm') {
					this.add('-start', pokemon, 'Attract', '[from] ability: Cute Charm', '[of] ' + source);
				}
				else if (effect.id === 'destinyknot') {
					this.add('-start', pokemon, 'Attract', '[from] item: Destiny Knot', '[of] ' + source);
				}
				else {
					this.add('-start', pokemon, 'Attract');
				}
			},
			onBeforeMove: function (pokemon, target, move) {
				if (this.effectData.source && !this.effectData.source.isActive && pokemon.volatiles['attract']) {
					this.debug('Removing Attract volatile on ' + pokemon);
					pokemon.removeVolatile('attract');
					return;
				}
				this.add('-activate', pokemon, 'Attract', '[of] ' + this.effectData.source);
				if (this.random(2) === 0) {
					this.add('cant', pokemon, 'Attract');
					return false;
				}
			}
		},
		inherit: true
	},
	barrier: {
		pp: 30,
		inherit: true
	},
	beatup: {
		basePower: 10,
		basePowerCallback: null,
		effect: {
			duration: 1,
			onStart: function (pokemon) {
				this.effectData.index = 0;
				while (pokemon.side.pokemon[this.effectData.index] !== pokemon &&
					(!pokemon.side.pokemon[this.effectData.index] ||
						pokemon.side.pokemon[this.effectData.index].fainted ||
						pokemon.side.pokemon[this.effectData.index].status)) {
					this.effectData.index++;
				}
			},
			onRestart: function (pokemon) {
				do {
					this.effectData.index++;
					if (this.effectData.index >= 6) break;
				} while (!pokemon.side.pokemon[this.effectData.index] ||
					pokemon.side.pokemon[this.effectData.index].fainted ||
					pokemon.side.pokemon[this.effectData.index].status)
			}
		},
		inherit: true
	},
	bellydrum: {
		onHit: function (target) {
			if (target.hp <= target.maxhp / 2 || target.boosts.atk >= 6 || target.maxhp === 1) { // Shedinja clause
				return false;
			}
			this.directDamage(target.maxhp / 2);
			target.setBoost({
				atk: 6
			});
			this.add('-setboost', target, 'atk', '6', '[from] move: Belly Drum');
		},
		inherit: true
	},
	bide: {
		accuracy: 100,
		priority: 0,
		effect: {
			duration: 3,
			onLockMove: "bide",
			onStart: function (pokemon) {
				this.effectData.totalDamage = 0;
				this.add('-start', pokemon, 'Bide');
			},
			onDamage: function (damage, target, source, move) {
				if (!move || move.effectType !== 'Move') return;
				if (!source || source.side === target.side) return;
				this.effectData.totalDamage += damage;
				this.effectData.sourcePosition = source.position;
				this.effectData.sourceSide = source.side;
			},
			onAfterSetStatus: function (status, pokemon) {
				if (status.id === 'slp') {
					pokemon.removeVolatile('bide');
				}
			},
			onBeforeMove: function (pokemon) {
				if (this.effectData.duration === 1) {
					if (!this.effectData.totalDamage) {
						this.add('-end', pokemon, 'Bide');
						this.add('-fail', pokemon);
						return false;
					}
					this.add('-end', pokemon, 'Bide');
					var target = this.effectData.sourceSide.active[this.effectData.sourcePosition];
					if (!target.runImmunity('Normal')) {
						this.add('-immune', target, '[msg]');
						return false;
					}
					this.moveHit(target, pokemon, 'bide', {
						damage: this.effectData.totalDamage * 2
					});
					return false;
				}
				this.add('-activate', pokemon, 'Bide');
				return false;
			}
		},
		inherit: true
	},
	bind: {
		accuracy: 75,
		inherit: true
	},
	bite: {
		isBiteAttack: null,
		inherit: true
	},
	blizzard: {
		onModifyMove: null,
		basePower: 120,
		inherit: true
	},
	block: {
		onHit: function (target) {
			target.addVolatile('trapped');
		},
		inherit: true
	},
	bonerush: {
		accuracy: 80,
		inherit: true
	},
	bounce: {
		onTry: function (attacker, defender, move) {
			if (attacker.removeVolatile(move.id)) {
				return;
			}
			this.add('-prepare', attacker, move.name, defender);
			if (!this.runEvent('ChargeMove', attacker, defender, move)) {
				this.add('-anim', attacker, move.name, defender);
				return;
			}
			attacker.addVolatile(move.id, defender);
			return null;
		},
		effect: {
			duration: 2,
			onLockMove: "bounce",
			onAccuracy: function (accuracy, target, source, move) {
				if (move.id === 'gust' || move.id === 'twister') {
					return;
				}
				if (move.id === 'skyuppercut' || move.id === 'thunder' || move.id === 'hurricane' || move.id === 'smackdown' || move.id === 'helpinghand') {
					return;
				}
				return 0;
			},
			onSourceBasePower: function (bpMod, target, source, move) {
				if (move.id === 'gust' || move.id === 'twister') {
					return this.chain(bpMod, 2);
				}
			}
		},
		inherit: true
	},
	brickbreak: {
		onTryHit: function (pokemon) {
			pokemon.side.removeSideCondition('reflect');
			pokemon.side.removeSideCondition('lightscreen');
		},
		inherit: true
	},
	bubble: {
		basePower: 20,
		inherit: true
	},
	bulletseed: {
		basePower: 10,
		inherit: true
	},
	camouflage: {
		desc: "The user's type changes based on the battle terrain. Ground-type in Wi-Fi battles. (In-game: Ground-type in puddles, rocky ground, and sand, Water-type on water, Rock-type in caves, Ice-type on snow and ice, and Normal-type everywhere else.) Fails if the user's type cannot be changed or if the user is already purely that type.",
		shortDesc: "Changes user's type based on terrain. (Ground)",
		onHit: function (target) {
			this.add('-start', target, 'typechange', 'Ground');
			target.types = ['Ground'];
		},
		inherit: true
	},
	charge: {
		boosts: false,
		onHit: function (pokemon) {
			this.add('-activate', pokemon, 'move: Charge');
		},
		effect: {
			duration: 2,
			onRestart: function (pokemon) {
				this.effectData.duration = 2;
			},
			onBasePowerPriority: 3,
			onBasePower: function (bpMod, attacker, defender, move) {
				if (move.type === 'Electric') {
					this.debug('charge boost');
					return this.chain(bpMod, 2);
				}
			}
		},
		inherit: true
	},
	charm: {
		type: "Normal",
		inherit: true
	},
	clamp: {
		accuracy: 75,
		pp: 10,
		inherit: true
	},
	conversion: {
		onHit: function (target) {
			var possibleTypes = target.moveset.map(function (val) {
				var move = this.getMove(val.id);
				if (move.id !== 'conversion' && !target.hasType(move.type)) {
					return move.type;
				}
			}, this).compact();
			if (!possibleTypes.length) {
				return false;
			}
			var type = possibleTypes[this.random(possibleTypes.length)];
			this.add('-start', target, 'typechange', type);
			target.types = [type];
		},
		inherit: true
	},
	conversion2: {
		onHit: function (target, source) {
			if (!target.lastMove) {
				return false;
			}
			var possibleTypes = [];
			var attackType = this.getMove(target.lastMove).type;
			for (var type in this.data.TypeChart) {
				if (source.hasType(type) || target.hasType(type)) continue;
				var typeCheck = this.data.TypeChart[type].damageTaken[attackType];
				if (typeCheck === 2 || typeCheck === 3) {
					possibleTypes.push(type);
				}
			}
			if (!possibleTypes.length) {
				return false;
			}
			var type = possibleTypes[this.random(possibleTypes.length)];
			this.add('-start', source, 'typechange', type);
			source.types = [type];
		},
		inherit: true
	},
	cottonspore: {
		accuracy: 85,
		onTryHit: function () {},
		inherit: true
	},
	counter: {
		damageCallback: function (pokemon) {
			if (pokemon.lastAttackedBy && pokemon.lastAttackedBy.thisTurn && (this.getCategory(pokemon.lastAttackedBy.move) === 'Physical' || this.getMove(pokemon.lastAttackedBy.move).id === 'hiddenpower')) {
				return 2 * pokemon.lastAttackedBy.damage;
			}
			this.add('-fail', pokemon);
			return false;
		},
		inherit: true
	},
	covet: {
		basePower: 40,
		isContact: false,
		onHit: function (target, source) {
			if (source.item) {
				return;
			}
			var yourItem = target.takeItem(source);
			if (!yourItem) {
				return;
			}
			if (!source.setItem(yourItem)) {
				target.item = yourItem.id; // bypass setItem so we don't break choicelock or anything
				return;
			}
			this.add('-item', source, yourItem, '[from] move: Covet', '[of] ' + target);
		},
		inherit: true
	},
	crabhammer: {
		accuracy: 85,
		basePower: 90,
		inherit: true
	},
	crunch: {
		secondary: {
			chance: 20,
			boosts: {
				spd: -1
			}
		},
		isBiteAttack: null,
		inherit: true
	},
	curse: {
		type: "???",
		onModifyMove: function (move, source, target) {
			if (!source.hasType('Ghost')) {
				delete move.volatileStatus;
				delete move.onHit;
				move.self = {
					boosts: {
						atk: 1,
						def: 1,
						spe: -1
					}
				};
				move.target = move.nonGhostTarget;
			}
		},
		onTryHit: function (target, source, move) {
			if (move.volatileStatus && target.volatiles.curse) return false;
		},
		onHit: function (target, source) {
			this.directDamage(source.maxhp / 2, source, source);
		},
		effect: {
			onStart: function (pokemon, source) {
				this.add('-start', pokemon, 'Curse', '[of] ' + source);
			},
			onResidualOrder: 10,
			onResidual: function (pokemon) {
				this.damage(pokemon.maxhp / 4);
			}
		},
		inherit: true
	},
	destinybond: {
		effect: {
			onStart: function (pokemon) {
				this.add('-singlemove', pokemon, 'Destiny Bond');
			},
			onFaint: function (target, source, effect) {
				if (!source || !effect) return;
				if (effect.effectType === 'Move' && target.lastMove === 'destinybond') {
					this.add('-activate', target, 'Destiny Bond');
					source.faint();
				}
			},
			onBeforeMovePriority: 100,
			onBeforeMove: function (pokemon) {
				this.debug('removing Destiny Bond before attack');
				pokemon.removeVolatile('destinybond');
			}
		},
		inherit: true
	},
	detect: {
		priority: 3,
		onTryHit: function (pokemon) {
			return !!this.willAct() && this.runEvent('StallMove', pokemon);
		},
		onHit: function (pokemon) {
			pokemon.addVolatile('stall');
		},
		inherit: true
	},
	dig: {
		basePower: 60,
		onTry: function (attacker, defender, move) {
			if (attacker.removeVolatile(move.id)) {
				return;
			}
			this.add('-prepare', attacker, move.name, defender);
			if (!this.runEvent('ChargeMove', attacker, defender, move)) {
				this.add('-anim', attacker, move.name, defender);
				return;
			}
			attacker.addVolatile(move.id, defender);
			return null;
		},
		effect: {
			duration: 2,
			onLockMove: "dig",
			onImmunity: function (type, pokemon) {
				if (type === 'sandstorm' || type === 'hail') return false;
			},
			onAccuracy: function (accuracy, target, source, move) {
				if (move.id === 'earthquake' || move.id === 'magnitude' || move.id === 'helpinghand') {
					return;
				}
				return 0;
			},
			onSourceModifyDamage: function (damageMod, source, target, move) {
				if (move.id === 'earthquake' || move.id === 'magnitude') {
					return this.chain(damageMod, 2);
				}
			}
		},
		inherit: true
	},
	disable: {
		accuracy: 55,
		isBounceable: false,
		effect: {
			durationCallBack: function () {
				return this.random(2, 6);
			},
			noCopy: true,
			onStart: function (pokemon) {
				if (!this.willMove(pokemon)) {
					this.effectData.duration++;
				}
				if (!pokemon.lastMove) {
					return false;
				}
				var moves = pokemon.moveset;
				for (var i = 0; i < moves.length; i++) {
					if (moves[i].id === pokemon.lastMove) {
						if (!moves[i].pp) {
							return false;
						}
						else {
							this.add('-start', pokemon, 'Disable', moves[i].move);
							this.effectData.move = pokemon.lastMove;
							return;
						}
					}
				}
				return false;
			},
			onEnd: function (pokemon) {
				this.add('-message', pokemon.name + ' is no longer disabled! (placeholder)');
			},
			onBeforeMove: function (attacker, defender, move) {
				if (move.id === this.effectData.move) {
					this.add('cant', attacker, 'Disable', move);
					return false;
				}
			},
			onModifyPokemon: function (pokemon) {
				var moves = pokemon.moveset;
				for (var i = 0; i < moves.length; i++) {
					if (moves[i].id === this.effectData.move) {
						moves[i].disabled = true;
					}
				}
			}
		},
		inherit: true
	},
	dive: {
		basePower: 60,
		onTry: function (attacker, defender, move) {
			if (attacker.removeVolatile(move.id)) {
				return;
			}
			this.add('-prepare', attacker, move.name, defender);
			if (!this.runEvent('ChargeMove', attacker, defender, move)) {
				this.add('-anim', attacker, move.name, defender);
				return;
			}
			attacker.addVolatile(move.id, defender);
			return null;
		},
		effect: {
			duration: 2,
			onLockMove: "dive",
			onImmunity: function (type, pokemon) {
				if (type === 'sandstorm' || type === 'hail') return false;
			},
			onAccuracy: function (accuracy, target, source, move) {
				if (move.id === 'surf' || move.id === 'whirlpool' || move.id === 'helpinghand') {
					return;
				}
				return 0;
			},
			onSourceModifyDamage: function (damageMod, source, target, move) {
				if (move.id === 'surf' || move.id === 'whirlpool') {
					return this.chain(damageMod, 2);
				}
			}
		},
		inherit: true
	},
	doomdesire: {
		accuracy: 85,
		basePower: 120,
		onModifyMove: function (move) {
			move.type = '???';
		},
		onTryHit: function (target, source) {
			source.side.addSideCondition('futuremove');
			if (source.side.sideConditions['futuremove'].positions[source.position]) {
				return false;
			}
			source.side.sideConditions['futuremove'].positions[source.position] = {
				duration: 3,
				move: 'doomdesire',
				targetPosition: target.position,
				source: source,
				moveData: {
					basePower: 140,
					category: "Special",
					type: 'Steel'
				}
			};
			this.add('-start', source, 'Doom Desire');
			return null;
		},
		inherit: true
	},
	dragonbreath: {
		name: "Dragon Breath",
		inherit: true
	},
	dreameater: {
		desc: "Deals damage to one adjacent target, if it is asleep and does not have a Substitute. The user recovers half of the HP lost by the target, rounded up. If Big Root is held by the user, the HP recovered is 1.3x normal, rounded half down.",
		onTryHit: function (target) {
			if (target.status !== 'slp' || target.volatiles['substitute']) {
				this.add('-immune', target, '[msg]');
				return null;
			}
		},
		inherit: true
	},
	dynamicpunch: {
		name: "Dynamic Punch",
		inherit: true
	},
	encore: {
		isBounceable: false,
		effect: {
			durationCallBack: function () {
				return this.random(3, 7);
			},
			onStart: function (target) {
				var noEncore = {
					encore: 1,
					mimic: 1,
					mirrormove: 1,
					sketch: 1,
					transform: 1
				};
				var moveIndex = target.moves.indexOf(target.lastMove);
				if (!target.lastMove || noEncore[target.lastMove] || (target.moveset[moveIndex] && target.moveset[moveIndex].pp <= 0)) {
					// it failed
					this.add('-fail', target);
					delete target.volatiles['encore'];
					return;
				}
				this.effectData.move = target.lastMove;
				this.add('-start', target, 'Encore');
				if (!this.willMove(target)) {
					this.effectData.duration++;
				}
			},
			onOverrideDecision: function (pokemon) {
				return this.effectData.move;
			},
			onResidualOrder: 13,
			onResidual: function (target) {
				if (target.moves.indexOf(target.lastMove) >= 0 && target.moveset[target.moves.indexOf(target.lastMove)].pp <= 0) {
					// early termination if you run out of PP
					delete target.volatiles.encore;
					this.add('-end', target, 'Encore');
				}
			},
			onEnd: function (target) {
				this.add('-end', target, 'Encore');
			},
			onModifyPokemon: function (pokemon) {
				if (!this.effectData.move || !pokemon.hasMove(this.effectData.move)) {
					return;
				}
				for (var i = 0; i < pokemon.moveset.length; i++) {
					if (pokemon.moveset[i].id !== this.effectData.move) {
						pokemon.moveset[i].disabled = true;
					}
				}
			}
		},
		inherit: true
	},
	endeavor: {
		damageCallback: function (pokemon, target) {
			if (target.hp > pokemon.hp) {
				return target.hp - pokemon.hp;
			}
			this.add('-immune', target, '[msg]');
			return false;
		},
		inherit: true
	},
	endure: {
		onTryHit: function (pokemon) {
			return this.willAct() && this.runEvent('StallMove', pokemon);
		},
		onHit: function (pokemon) {
			pokemon.addVolatile('stall');
		},
		effect: {
			duration: 1,
			onStart: function (target) {
				this.add('-singleturn', target, 'move: Endure');
			},
			onDamagePriority: -10,
			onDamage: function (damage, target, source, effect) {
				if (effect && effect.effectType === 'Move' && damage >= target.hp) {
					return target.hp - 1;
				}
			}
		},
		inherit: true
	},
	eruption: {
		basePowerCallback: function (pokemon) {
			return 150 * pokemon.hp / pokemon.maxhp;
		},
		inherit: true
	},
	explosion: {
		basePower: 500,
		inherit: true
	},
	extrasensory: {
		basePowerCallback: function (pokemon, target) {
			if (target.volatiles['minimize']) return 160;
			return 80;
		},
		pp: 30,
		inherit: true
	},
	extremespeed: {
		priority: 1,
		name: "Extreme Speed",
		inherit: true
	},
	facade: {
		onBasePower: function (bpMod, pokemon) {
			if (pokemon.status && pokemon.status !== 'slp') {
				return this.chain(bpMod, 2);
			}
		},
		inherit: true
	},
	fakeout: {
		priority: 1,
		isContact: false,
		onTryHit: function (target, pokemon) {
			if (pokemon.activeTurns > 1) {
				this.debug('It is not your first turn out.');
				return false;
			}
		},
		inherit: true
	},
	fireblast: {
		basePower: 120,
		inherit: true
	},
	firespin: {
		accuracy: 70,
		basePower: 15,
		inherit: true
	},
	flail: {
		basePowerCallback: function (pokemon, target) {
			var hpPercent = pokemon.hp * 100 / pokemon.maxhp;
			if (hpPercent <= 5) {
				return 200;
			}
			if (hpPercent <= 10) {
				return 150;
			}
			if (hpPercent <= 20) {
				return 100;
			}
			if (hpPercent <= 35) {
				return 80;
			}
			if (hpPercent <= 70) {
				return 40;
			}
			return 20;
		},
		inherit: true
	},
	flamethrower: {
		basePower: 95,
		inherit: true
	},
	flash: {
		accuracy: 70,
		inherit: true
	},
	fly: {
		basePower: 70,
		onTry: function (attacker, defender, move) {
			if (attacker.removeVolatile(move.id)) {
				return;
			}
			this.add('-prepare', attacker, move.name, defender);
			if (!this.runEvent('ChargeMove', attacker, defender, move)) {
				this.add('-anim', attacker, move.name, defender);
				return;
			}
			attacker.addVolatile(move.id, defender);
			return null;
		},
		effect: {
			duration: 2,
			onLockMove: "fly",
			onAccuracy: function (accuracy, target, source, move) {
				if (move.id === 'gust' || move.id === 'twister') {
					return;
				}
				if (move.id === 'skyuppercut' || move.id === 'thunder' || move.id === 'hurricane' || move.id === 'smackdown' || move.id === 'helpinghand') {
					return;
				}
				return 0;
			},
			onSourceBasePower: function (bpMod, target, source, move) {
				if (move.id === 'gust' || move.id === 'twister') {
					return this.chain(bpMod, 2);
				}
			}
		},
		inherit: true
	},
	focusenergy: {
		effect: {
			onStart: function (pokemon) {
				this.add('-start', pokemon, 'move: Focus Energy');
			},
			onModifyMove: function (move) {
				move.critRatio += 2;
			}
		},
		inherit: true
	},
	focuspunch: {
		beforeTurnCallback: function (pokemon) {
			pokemon.addVolatile('focuspunch');
		},
		beforeMoveCallback: function (pokemon) {
			if (!pokemon.removeVolatile('focuspunch')) {
				return false;
			}
			if (pokemon.lastAttackedBy && pokemon.lastAttackedBy.damage && pokemon.lastAttackedBy.thisTurn) {
				this.add('cant', pokemon, 'flinch', 'Focus Punch');
				return true;
			}
		},
		effect: {
			duration: 1,
			onStart: function (pokemon) {
				this.add('-singleturn', pokemon, 'move: Focus Punch');
			}
		},
		inherit: true
	},
	followme: {
		priority: 3,
		effect: {
			duration: 1,
			onFoeRedirectTarget: function (target, source, source2, move) {
				if (this.validTarget(this.effectData.target, source, move.target)) {
					this.debug("Follow Me redirected target of move");
					return this.effectData.target;
				}
			}
		},
		inherit: true
	},
	foresight: {
		isBounceable: false,
		effect: {
			onStart: function (pokemon) {
				this.add('-start', pokemon, 'Foresight');
			},
			onModifyPokemon: function (pokemon) {
				if (pokemon.hasType('Ghost')) {
					pokemon.negateImmunity['Normal'] = true;
					pokemon.negateImmunity['Fighting'] = true;
				}
			},
			onSourceModifyMove: function (move) {
				move.ignorePositiveEvasion = true;
			}
		},
		inherit: true
	},
	frustration: {
		basePowerCallback: function (pokemon) {
			return Math.floor(((255 - pokemon.happiness) * 10) / 25) || 1;
		},
		inherit: true
	},
	furycutter: {
		basePower: 10,
		basePowerCallback: function (pokemon) {
			if (!pokemon.volatiles.furycutter) {
				pokemon.addVolatile('furycutter');
			}
			return 20 * pokemon.volatiles.furycutter.multiplier;
		},
		onHit: function (target, source) {
			source.addVolatile('furycutter');
		},
		effect: {
			duration: 2,
			onStart: function () {
				this.effectData.multiplier = 1;
			},
			onRestart: function () {
				if (this.effectData.multiplier < 8) {
					this.effectData.multiplier <<= 1;
				}
				this.effectData.duration = 2;
			}
		},
		inherit: true
	},
	futuresight: {
		accuracy: 90,
		basePower: 80,
		pp: 15,
		onModifyMove: function (move) {
			move.type = '???';
		},
		onTryHit: function (target, source) {
			source.side.addSideCondition('futuremove');
			if (source.side.sideConditions['futuremove'].positions[source.position]) {
				return false;
			}
			source.side.sideConditions['futuremove'].positions[source.position] = {
				duration: 3,
				move: 'futuresight',
				targetPosition: target.position,
				source: source,
				moveData: {
					basePower: 100,
					category: "Special",
					affectedByImmunities: true,
					type: 'Psychic'
				}
			};
			this.add('-start', source, 'move: Future Sight');
			return null;
		},
		inherit: true
	},
	gigadrain: {
		basePower: 60,
		pp: 5,
		inherit: true
	},
	glare: {
		accuracy: 75,
		affectedByImmunities: true,
		inherit: true
	},
	growth: {
		onModifyMove: null,
		boosts: {
			spa: 1
		},
		inherit: true
	},
	grudge: {
		effect: {
			onStart: function (pokemon) {
				this.add('-singlemove', pokemon, 'Grudge');
			},
			onFaint: function (target, source, effect) {
				this.debug('Grudge detected fainted pokemon');
				if (!source || !effect) return;
				if (effect.effectType === 'Move' && target.lastMove === 'grudge') {
					for (var i in source.moveset) {
						if (source.moveset[i].id === source.lastMove) {
							source.moveset[i].pp = 0;
							this.add('-activate', source, 'Grudge', this.getMove(source.lastMove).name);
						}
					}
				}
			},
			onBeforeMovePriority: -10,
			onBeforeMove: function (pokemon) {
				this.debug('removing Grudge before attack');
				pokemon.removeVolatile('grudge');
			}
		},
		inherit: true
	},
	haze: {
		onHitField: function () {
			this.add('-clearallboost');
			for (var i = 0; i < this.sides.length; i++) {
				for (var j = 0; j < this.sides[i].active.length; j++) {
					this.sides[i].active[j].clearBoosts();
				}
			}
		},
		inherit: true
	},
	healbell: {
		onHit: function (pokemon, source) {
			var side = pokemon.side;
			for (var i = 0; i < side.pokemon.length; i++) {
				side.pokemon[i].status = '';
			}
			this.add('-cureteam', source, '[from] move: HealBell');
		},
		inherit: true
	},
	heatwave: {
		basePower: 100,
		inherit: true
	},
	helpinghand: {
		onTryHit: function (target, source) {
			if (target === source) return false;
		},
		effect: {
			duration: 1,
			onStart: function (target, source) {
				this.add('-singleturn', target, 'Helping Hand', '[of] ' + source);
			},
			onBasePowerPriority: 3,
			onBasePower: function (bpMod) {
				this.debug('Boosting from Helping Hand');
				return this.chain(bpMod, 1.5);
			}
		},
		inherit: true
	},
	hiddenpower: {
		basePower: 0,
		basePowerCallback: function (pokemon) {
			return pokemon.hpPower || 70;
		},
		onModifyMove: function (move, pokemon) {
			move.type = pokemon.hpType || 'Dark';
		},
		category: null,
		desc: null,
		shortDesc: null,
		inherit: true
	},
	hiddenpowerbug: {
		basePower: 70,
		inherit: true
	},
	hiddenpowerdark: {
		basePower: 70,
		inherit: true
	},
	hiddenpowerdragon: {
		basePower: 70,
		inherit: true
	},
	hiddenpowerelectric: {
		basePower: 70,
		inherit: true
	},
	hiddenpowerfighting: {
		basePower: 70,
		inherit: true
	},
	hiddenpowerfire: {
		basePower: 70,
		inherit: true
	},
	hiddenpowerflying: {
		basePower: 70,
		inherit: true
	},
	hiddenpowerghost: {
		basePower: 70,
		inherit: true
	},
	hiddenpowergrass: {
		basePower: 70,
		inherit: true
	},
	hiddenpowerground: {
		basePower: 70,
		inherit: true
	},
	hiddenpowerice: {
		basePower: 70,
		inherit: true
	},
	hiddenpowerpoison: {
		basePower: 70,
		inherit: true
	},
	hiddenpowerpsychic: {
		basePower: 70,
		inherit: true
	},
	hiddenpowerrock: {
		basePower: 70,
		inherit: true
	},
	hiddenpowersteel: {
		basePower: 70,
		inherit: true
	},
	hiddenpowerwater: {
		basePower: 70,
		inherit: true
	},
	highjumpkick: {
		inherit: true,
		basePower: 85,
		pp: 20,
		onMoveFail: function (target, source, move) {
			if (target.runImmunity('Fighting')) {
				var damage = this.getDamage(source, target, move, true);
				this.damage(clampIntRange(damage / 2, 1, Math.floor(target.maxhp / 2)), source);
			}
		}
	},
	hydropump: {
		basePower: 120,
		inherit: true
	},
	hyperfang: {
		isBiteAttack: null,
		inherit: true
	},
	iceball: {
		basePowerCallback: function (pokemon, target) {
			var bp = 30;
			var bpTable = [30, 60, 120, 240, 480];
			if (pokemon.volatiles.iceball && pokemon.volatiles.iceball.hitCount) {
				bp = (bpTable[pokemon.volatiles.iceball.hitCount] || 480);
			}
			pokemon.addVolatile('iceball');
			if (pokemon.volatiles.defensecurl) {
				bp *= 2;
			}
			this.debug("Ice Ball bp: " + bp);
			return bp;
		},
		effect: {
			duration: 2,
			onLockMove: "iceball",
			onStart: function () {
				this.effectData.hitCount = 1;
			},
			onRestart: function () {
				this.effectData.hitCount++;
				if (this.effectData.hitCount < 5) {
					this.effectData.duration = 2;
				}
			},
			onResidual: function (target) {
				if (target.lastMove === 'struggle') {
					// don't lock
					delete target.volatiles['iceball'];
				}
			}
		},
		inherit: true
	},
	icebeam: {
		basePower: 95,
		inherit: true
	},
	iciclespear: {
		basePower: 10,
		inherit: true
	},
	imprison: {
		effect: {
			noCopy: true,
			onStart: function (target) {
				this.add('-start', target, 'move: Imprison');
			},
			onFoeModifyPokemon: function (pokemon) {
				var foeMoves = this.effectData.source.moveset;
				for (var f = 0; f < foeMoves.length; f++) {
					pokemon.disabledMoves[foeMoves[f].id] = true;
				}
			},
			onFoeBeforeMove: function (attacker, defender, move) {
				if (attacker.disabledMoves[move.id]) {
					this.add('cant', attacker, 'move: Imprison', move);
					return false;
				}
			}
		},
		inherit: true
	},
	ingrain: {
		effect: {
			onStart: function (pokemon) {
				this.add('-start', pokemon, 'move: Ingrain');
			},
			onResidualOrder: 7,
			onResidual: function (pokemon) {
				this.heal(pokemon.maxhp / 16);
			},
			onModifyPokemon: function (pokemon) {
				pokemon.negateImmunity['Ground'] = true;
				pokemon.trapped = true;
			},
			onDragOut: function (pokemon) {
				this.add('-activate', pokemon, 'move: Ingrain');
				return null;
			}
		},
		inherit: true
	},
	jumpkick: {
		basePower: 70,
		pp: 25,
		onMoveFail: function (target, source, move) {
			if (target.runImmunity('Fighting')) {
				var damage = this.getDamage(source, target, move, true);
				this.damage(clampIntRange(damage / 2, 1, Math.floor(target.maxhp / 2)), source);
			}
		},
		inherit: true
	},
	knockoff: {
		basePower: 20,
		onHit: function (target, source) {
			var item = target.getItem();
			if (item.id === 'mail') {
				target.setItem('');
			}
			else {
				item = target.takeItem(source);
			}
			if (item) {
				this.add('-enditem', target, item.name, '[from] move: Knock Off', '[of] ' + source);
			}
		},
		inherit: true
	},
	leafblade: {
		basePower: 70,
		inherit: true
	},
	leechseed: {
		effect: {
			onStart: function (target) {
				this.add('-start', target, 'move: Leech Seed');
			},
			onResidualOrder: 8,
			onResidual: function (pokemon) {
				var target = pokemon.side.foe.active[pokemon.volatiles['leechseed'].sourcePosition];
				if (!target || target.fainted || target.hp <= 0) {
					this.debug('Nothing to leech into');
					return;
				}
				var damage = this.damage(pokemon.maxhp / 8, pokemon, target);
				if (damage) {
					this.heal(damage, target, pokemon);
				}
			}
		},
		onTryHit: function (target) {
			if (target.hasType('Grass')) {
				this.add('-immune', target, '[msg]');
				return null;
			}
		},
		inherit: true
	},
	lick: {
		basePower: 20,
		inherit: true
	},
	lightscreen: {
		effect: {
			duration: 5,
			durationCallBack: function (target, source, effect) {
				if (source && source.item === 'lightclay') {
					return 8;
				}
				return 5;
			},
			onFoeModifyDamage: function (damageMod, source, target, move) {
				if (this.getCategory(move) === 'Special' && target.side === this.effectData.target) {
					if (!move.crit && source.ability !== 'infiltrator') {
						this.debug('Light Screen weaken')
						if (source.side.active.length > 1) return this.chain(damageMod, 0.66);
						return this.chain(damageMod, 0.5);
					}
				}
			},
			onStart: function (side) {
				this.add('-sidestart', side, 'move: Light Screen');
			},
			onResidualOrder: 21,
			onResidualSubOrder: 1,
			onEnd: function (side) {
				this.add('-sideend', side, 'move: Light Screen');
			}
		},
		inherit: true
	},
	lockon: {
		effect: {
			duration: 2,
			onFoeModifyMove: function (move) {
				move.accuracy = true;
				move.alwaysHit = true;
			}
		},
		inherit: true
	},
	lowkick: {
		basePowerCallback: function (pokemon, target) {
			var targetWeight = target.weightkg;
			if (target.weightkg >= 200) {
				return 120;
			}
			if (target.weightkg >= 100) {
				return 100;
			}
			if (target.weightkg >= 50) {
				return 80;
			}
			if (target.weightkg >= 25) {
				return 60;
			}
			if (target.weightkg >= 10) {
				return 40;
			}
			return 20;
		},
		inherit: true
	},
	magiccoat: {
		effect: {
			duration: 1,
			onStart: function (target) {
				this.add('-singleturn', target, 'move: Magic Coat');
			},
			onTryHitPriority: 2,
			onTryHit: function (target, source, move) {
				if (target === source) return;
				if (move.hasBounced) return;
				if (typeof move.isBounceable === 'undefined') {
					move.isBounceable = !! (move.category === 'Status' && (move.status || move.boosts || move.volatileStatus === 'confusion' || move.forceSwitch));
				}
				if (move.isBounceable) {
					var newMove = this.getMoveCopy(move.id);
					newMove.hasBounced = true;
					this.useMove(newMove, target, source);
					return null;
				}
			},
			onAllyTryHitSide: function (target, source, move) {
				if (target.side === source.side) return;
				if (move.hasBounced) return;
				if (typeof move.isBounceable === 'undefined') {
					move.isBounceable = !! (move.category === 'Status' && (move.status || move.boosts || move.volatileStatus === 'confusion' || move.forceSwitch));
				}
				if (move.isBounceable) {
					var newMove = this.getMoveCopy(move.id);
					newMove.hasBounced = true;
					this.useMove(newMove, target, source);
					return null;
				}
			}
		},
		inherit: true
	},
	magnitude: {
		onModifyMove: function (move, pokemon) {
			var i = this.random(100);
			if (i < 5) {
				this.add('-activate', pokemon, 'move: Magnitude', 4);
				move.basePower = 10;
			}
			else if (i < 15) {
				this.add('-activate', pokemon, 'move: Magnitude', 5);
				move.basePower = 30;
			}
			else if (i < 35) {
				this.add('-activate', pokemon, 'move: Magnitude', 6);
				move.basePower = 50;
			}
			else if (i < 65) {
				this.add('-activate', pokemon, 'move: Magnitude', 7);
				move.basePower = 70;
			}
			else if (i < 85) {
				this.add('-activate', pokemon, 'move: Magnitude', 8);
				move.basePower = 90;
			}
			else if (i < 95) {
				this.add('-activate', pokemon, 'move: Magnitude', 9);
				move.basePower = 110;
			}
			else {
				this.add('-activate', pokemon, 'move: Magnitude', 10);
				move.basePower = 150;
			}
		},
		inherit: true
	},
	meanlook: {
		onHit: function (target) {
			target.addVolatile('trapped');
		},
		inherit: true
	},
	megadrain: {
		pp: 10,
		inherit: true
	},
	meteormash: {
		accuracy: 85,
		basePower: 100,
		inherit: true
	},
	metronome: {
		onHit: function (target) {
			var moves = [];
			for (var i in exports.BattleMovedex) {
				var move = exports.BattleMovedex[i];
				if (i !== move.id) continue;
				if (move.isNonstandard) continue;
				var noMetronome = {
					afteryou: 1,
					assist: 1,
					bestow: 1,
					chatter: 1,
					copycat: 1,
					counter: 1,
					covet: 1,
					destinybond: 1,
					detect: 1,
					endure: 1,
					feint: 1,
					focuspunch: 1,
					followme: 1,
					freezeshock: 1,
					helpinghand: 1,
					iceburn: 1,
					mefirst: 1,
					metronome: 1,
					mimic: 1,
					mirrorcoat: 1,
					mirrormove: 1,
					naturepower: 1,
					protect: 1,
					quash: 1,
					quickguard: 1,
					ragepowder: 1,
					relicsong: 1,
					secretsword: 1,
					sketch: 1,
					sleeptalk: 1,
					snatch: 1,
					snarl: 1,
					snore: 1,
					struggle: 1,
					switcheroo: 1,
					technoblast: 1,
					thief: 1,
					transform: 1,
					trick: 1,
					vcreate: 1,
					wideguard: 1
				};
				if (!noMetronome[move.id]) {
					moves.push(move.id);
				}
			}
			var move = '';
			if (moves.length) move = moves[this.random(moves.length)];
			if (!move) {
				return false;
			}
			this.useMove(move, target);
		},
		inherit: true
	},
	mimic: {
		onHit: function (target, source) {
			var disallowedMoves = {
				chatter: 1,
				mimic: 1,
				sketch: 1,
				struggle: 1,
				transform: 1
			};
			if (source.transformed || !target.lastMove || disallowedMoves[target.lastMove] || source.moves.indexOf(target.lastMove) !== -1) return false;
			var moveslot = source.moves.indexOf('mimic');
			if (moveslot === -1) return false;
			var move = Tools.getMove(target.lastMove);
			source.moveset[moveslot] = {
				move: move.name,
				id: move.id,
				pp: move.pp,
				maxpp: move.pp,
				target: move.target,
				disabled: false,
				used: false
			};
			source.moves[moveslot] = toId(move.name);
			this.add('-start', source, 'Mimic', move.name);
		},
		inherit: true
	},
	minimize: {
		boosts: {
			evasion: 1
		},
		pp: 20,
		effect: {
			noCopy: true,
			onSourceModifyDamage: function (damageMod, source, target, move) {
				if (move.id === 'stomp' || move.id === 'steamroller') {
					return this.chain(damageMod, 2);
				}
			}
		},
		inherit: true
	},
	mirrorcoat: {
		damageCallback: function (pokemon) {
			if (pokemon.lastAttackedBy && pokemon.lastAttackedBy.thisTurn && this.getCategory(pokemon.lastAttackedBy.move) === 'Special') {
				return 2 * pokemon.lastAttackedBy.damage;
			}
			return false;
		},
		inherit: true
	},
	mirrormove: {
		onTryHit: function (target) {
			var noMirrorMove = {
				acupressure: 1,
				afteryou: 1,
				aromatherapy: 1,
				chatter: 1,
				conversion2: 1,
				curse: 1,
				doomdesire: 1,
				feint: 1,
				finalgambit: 1,
				focuspunch: 1,
				futuresight: 1,
				gravity: 1,
				guardsplit: 1,
				hail: 1,
				haze: 1,
				healbell: 1,
				healpulse: 1,
				helpinghand: 1,
				lightscreen: 1,
				luckychant: 1,
				mefirst: 1,
				mimic: 1,
				mirrorcoat: 1,
				mirrormove: 1,
				mist: 1,
				mudsport: 1,
				naturepower: 1,
				perishsong: 1,
				powersplit: 1,
				psychup: 1,
				quickguard: 1,
				raindance: 1,
				reflect: 1,
				reflecttype: 1,
				roleplay: 1,
				safeguard: 1,
				sandstorm: 1,
				sketch: 1,
				spikes: 1,
				spitup: 1,
				stealthrock: 1,
				sunnyday: 1,
				tailwind: 1,
				taunt: 1,
				teeterdance: 1,
				toxicspikes: 1,
				transform: 1,
				watersport: 1,
				wideguard: 1
			};
			if (!target.lastMove || noMirrorMove[target.lastMove] || this.getMove(target.lastMove).target === 'self') {
				return false;
			}
		},
		onHit: function (target, source) {
			this.useMove(this.lastMove, source);
		},
		inherit: true
	},
	mist: {
		effect: {
			duration: 5,
			onBoost: function (boost, target, source) {
				if (!source || target === source) return;
				for (var i in boost) {
					if (boost[i] < 0) {
						delete boost[i];
						this.add('-activate', target, 'Mist');
					}
				}
			},
			onStart: function (side) {
				this.add('-sidestart', side, 'Mist');
			},
			onResidualOrder: 21,
			onResidualSubOrder: 3,
			onEnd: function (side) {
				this.add('-sideend', side, 'Mist');
			}
		},
		inherit: true
	},
	moonlight: {
		onHit: function (pokemon) {
			if (this.isWeather('sunnyday')) this.heal(this.modify(pokemon.maxhp, 0.667));
			else if (this.isWeather(['raindance', 'sandstorm', 'hail'])) this.heal(this.modify(pokemon.maxhp, 0.25));
			else this.heal(this.modify(pokemon.maxhp, 0.5));
		},
		type: "Normal",
		inherit: true
	},
	morningsun: {
		onHit: function (pokemon) {
			if (this.isWeather('sunnyday')) this.heal(this.modify(pokemon.maxhp, 0.667));
			else if (this.isWeather(['raindance', 'sandstorm', 'hail'])) this.heal(this.modify(pokemon.maxhp, 0.25));
			else this.heal(this.modify(pokemon.maxhp, 0.5));
		},
		inherit: true
	},
	mudsport: {
		onTryHitField: function (target, source) {
			if (source.volatiles['mudsport']) return false;
		},
		effect: {
			noCopy: true,
			onStart: function (pokemon) {
				this.add("-start", pokemon, 'Mud Sport');
			},
			onBasePowerModifier: 1,
			onAnyBasePower: function (bpMod, user, target, move) {
				if (move.type === 'Electric') return this.chain(bpMod, [0x548, 0x1000]); // The Mud Sport modifier is slightly higher than the usual 0.33 modifier (0x547)
			}
		},
		inherit: true
	},
	muddywater: {
		basePower: 95,
		inherit: true
	},
	naturepower: {
		onHit: function (target) {
			this.useMove('swift', target);
		},
		desc: "This move calls another move for use depending on the battle terrain. Earthquake in Wi-Fi battles. (In-game: Seed Bomb in grass, Mud Bomb in puddles, Hydro Pump on water, Rock Slide in caves, Earthquake on rocky ground and sand, Blizzard on snow, Ice Beam on ice, and Tri Attack everywhere else.)",
		shortDesc: "Attack changes based on terrain. (Earthquake)",
		inherit: true
	},
	needlearm: {
		basePowerCallback: function (pokemon, target) {
			if (target.volatiles['minimize']) return 120;
			return 60;
		},
		inherit: true
	},
	nightmare: {
		effect: {
			onResidualOrder: 9,
			onStart: function (pokemon) {
				if (pokemon.status !== 'slp') {
					return false;
				}
				this.add('-start', pokemon, 'Nightmare');
			},
			onResidual: function (pokemon) {
				if (pokemon.status !== 'slp') {
					pokemon.removeVolatile('nightmare');
					return;
				}
				this.damage(pokemon.maxhp / 4);
			}
		},
		inherit: true
	},
	odorsleuth: {
		isBounceable: false,
		inherit: true
	},
	outrage: {
		basePower: 90,
		pp: 15,
		inherit: true
	},
	overheat: {
		isContact: true,
		basePower: 140,
		inherit: true
	},
	painsplit: {
		onHit: function (target, pokemon) {
			var averagehp = Math.floor((target.hp + pokemon.hp) / 2) || 1;
			target.sethp(averagehp);
			pokemon.sethp(averagehp);
			this.add('-sethp', target, target.getHealth, pokemon, pokemon.getHealth, '[from] move: Pain Split');
		},
		inherit: true
	},
	payday: {
		onHit: function () {
			this.add('-fieldactivate', 'move: Pay Day');
		},
		inherit: true
	},
	perishsong: {
		onHitField: function (target, source) {
			var result = true;
			for (var i = 0; i < this.sides.length; i++) {
				for (var j = 0; j < this.sides[i].active.length; j++) {
					if (this.sides[i].active[j]) {
						if (!this.sides[i].active[j].volatiles['perishsong']) {
							result = false;
						}
						if (this.sides[i].active[j].ability !== 'soundproof') {
							this.sides[i].active[j].addVolatile('perishsong');
						}
						else {
							this.add('-immune', this.sides[i].active[j], '[msg]');
							this.add('-end', this.sides[i].active[j], 'Perish Song');
						}
					}
				}
			}
			if (result) return false;
			this.add('-fieldactivate', 'move: Perish Song');
		},
		effect: {
			duration: 4,
			onEnd: function (target) {
				this.add('-start', target, 'perish0');
				target.faint();
			},
			onResidual: function (pokemon) {
				var duration = pokemon.volatiles['perishsong'].duration;
				this.add('-start', pokemon, 'perish' + duration);
			}
		},
		inherit: true
	},
	petaldance: {
		basePower: 70,
		pp: 20,
		inherit: true
	},
	pinmissile: {
		accuracy: 85,
		basePower: 14,
		inherit: true
	},
	poisonfang: {
		isBiteAttack: null,
		inherit: true
	},
	poisongas: {
		accuracy: 55,
		target: "normal",
		inherit: true
	},
	poisonpowder: {
		isPowder: null,
		onTryHit: function () {},
		inherit: true
	},
	present: {
		onModifyMove: function (move, pokemon, target) {
			var rand = this.random(10);
			if (rand < 2) {
				move.heal = [1, 4];
			}
			else if (rand < 6) {
				move.basePower = 40;
			}
			else if (rand < 9) {
				move.basePower = 80;
			}
			else {
				move.basePower = 120;
			}
		},
		inherit: true
	},
	protect: {
		priority: 3,
		onTryHit: function (pokemon) {
			return !!this.willAct() && this.runEvent('StallMove', pokemon);
		},
		onHit: function (pokemon) {
			pokemon.addVolatile('stall');
		},
		effect: {
			duration: 1,
			onStart: function (target) {
				this.add('-singleturn', target, 'Protect');
			},
			onTryHitPriority: 3,
			onTryHit: function (target, source, move) {
				if (move.breaksProtect) {
					target.removeVolatile('Protect');
					return;
				}
				if (move && (move.target === 'self' || move.isNotProtectable)) return;
				this.add('-activate', target, 'Protect');
				var lockedmove = source.getVolatile('lockedmove');
				if (lockedmove) {
					// Outrage counter is reset
					if (source.volatiles['lockedmove'].duration === 2) {
						delete source.volatiles['lockedmove'];
					}
				}
				return null;
			}
		},
		inherit: true
	},
	psychup: {
		onHit: function (target, source) {
			var targetBoosts = {};
			for (var i in target.boosts) {
				targetBoosts[i] = target.boosts[i];
			}
			source.setBoost(targetBoosts);
			this.add('-copyboost', source, target, '[from] move: Psych Up');
		},
		inherit: true
	},
	psywave: {
		damageCallback: function (pokemon) {
			return (this.random(50, 151) * pokemon.level) / 100;
		},
		inherit: true
	},
	pursuit: {
		basePowerCallback: function (pokemon, target) {
			// you can't get here unless the pursuit succeeds
			if (target.beingCalledBack) {
				this.debug('Pursuit damage boost');
				return 80;
			}
			return 40;
		},
		beforeTurnCallback: function (pokemon, target) {
			target.side.addSideCondition('pursuit', pokemon);
			if (!target.side.sideConditions['pursuit'].sources) {
				target.side.sideConditions['pursuit'].sources = [];
			}
			target.side.sideConditions['pursuit'].sources.push(pokemon);
		},
		onModifyMove: function (move, source, target) {
			if (target && target.beingCalledBack) move.accuracy = true;
		},
		onTryHit: function (target, pokemon) {
			target.side.removeSideCondition('pursuit');
		},
		effect: {
			duration: 1,
			onBeforeSwitchOut: function (pokemon) {
				this.debug('Pursuit start');
				var sources = this.effectData.sources;
				for (var i = 0; i < sources.length; i++) {
					this.cancelMove(sources[i]);
					this.runMove('pursuit', sources[i], pokemon);
				}
			}
		},
		inherit: true
	},
	rage: {
		effect: {
			onStart: function (pokemon) {
				this.add('-singlemove', pokemon, 'Rage');
			},
			onHit: function (target, source, move) {
				if (target !== source && move.category !== 'Status') {
					this.boost({
						atk: 1
					});
				}
			},
			onBeforeMovePriority: 100,
			onBeforeMove: function (pokemon) {
				this.debug('removing Rage before attack');
				pokemon.removeVolatile('rage');
			}
		},
		inherit: true
	},
	rapidspin: {
		self: {
			onHit: function (pokemon) {
				if (pokemon.hp && pokemon.removeVolatile('leechseed')) {
					this.add('-end', pokemon, 'Leech Seed', '[from] move: Rapid Spin', '[of] ' + pokemon);
				}
				var sideConditions = {
					spikes: 1,
					toxicspikes: 1,
					stealthrock: 1
				};
				for (var i in sideConditions) {
					if (pokemon.hp && pokemon.side.removeSideCondition(i)) {
						this.add('-sideend', pokemon.side, this.getEffect(i).name, '[from] move: Rapid Spin', '[of] ' + pokemon);
					}
				}
				if (pokemon.hp && pokemon.volatiles['partiallytrapped']) {
					this.add('-remove', pokemon, pokemon.volatiles['partiallytrapped'].sourceEffect.name, '[from] move: Rapid Spin', '[of] ' + pokemon, '[partiallytrapped]');
					delete pokemon.volatiles['partiallytrapped'];
				}
			}
		},
		inherit: true
	},
	razorwind: {
		onTry: function (attacker, defender, move) {
			if (attacker.removeVolatile(move.id)) {
				return;
			}
			this.add('-prepare', attacker, move.name, defender);
			if (!this.runEvent('ChargeMove', attacker, defender, move)) {
				this.add('-anim', attacker, move.name, defender);
				return;
			}
			attacker.addVolatile(move.id, defender);
			return null;
		},
		inherit: true
	},
	recover: {
		pp: 20,
		inherit: true
	},
	recycle: {
		onHit: function (pokemon) {
			if (!pokemon.item && pokemon.lastItem) {
				pokemon.setItem(pokemon.lastItem);
				this.add("-item", pokemon, pokemon.item, '[from] move: Recycle');
			}
			else return false;
		},
		inherit: true
	},
	reflect: {
		effect: {
			duration: 5,
			durationCallBack: function (target, source, effect) {
				if (source && source.item === 'lightclay') {
					return 8;
				}
				return 5;
			},
			onFoeModifyDamage: function (damageMod, source, target, move) {
				if (this.getCategory(move) === 'Physical' && target.side === this.effectData.target) {
					if (!move.crit && source.ability !== 'infiltrator') {
						this.debug('Reflect weaken');
						if (source.side.active.length > 1) return this.chain(damageMod, 0.66);
						return this.chain(damageMod, 0.5);
					}
				}
			},
			onStart: function (side) {
				this.add('-sidestart', side, 'Reflect');
			},
			onResidualOrder: 21,
			onEnd: function (side) {
				this.add('-sideend', side, 'Reflect');
			}
		},
		inherit: true
	},
	refresh: {
		onHit: function (pokemon) {
			pokemon.cureStatus();
		},
		inherit: true
	},
	rest: {
		onHit: function (target) {
			if (target.hp >= target.maxhp) return false;
			if (!target.setStatus('slp')) return false;
			target.statusData.time = 3;
			target.statusData.startTime = 3;
			this.heal(target.maxhp) //Aeshetic only as the healing happens after you fall asleep in-game
			this.add('-status', target, 'slp', '[from] move: Rest');
		},
		inherit: true
	},
	return :{
		basePowerCallback: function (pokemon) {
			return Math.floor((pokemon.happiness * 10) / 25) || 1;
		},
		inherit: true
	},
	revenge: {
		basePowerCallback: function (pokemon, source) {
			if (source.lastDamage > 0 && pokemon.lastAttackedBy && pokemon.lastAttackedBy.thisTurn) {
				this.debug('Boosted for getting hit by ' + pokemon.lastAttackedBy.move);
				return 120;
			}
			return 60;
		},
		inherit: true
	},
	reversal: {
		basePowerCallback: function (pokemon, target) {
			var ratio = pokemon.hp * 48 / pokemon.maxhp;
			if (ratio < 2) {
				return 200;
			}
			if (ratio < 5) {
				return 150;
			}
			if (ratio < 10) {
				return 100;
			}
			if (ratio < 17) {
				return 80;
			}
			if (ratio < 33) {
				return 40;
			}
			return 20;
		},
		inherit: true
	},
	roar: {
		isBounceable: false,
		accuracy: 100,
		isNotProtectable: null,
		inherit: true
	},
	rockblast: {
		accuracy: 80,
		inherit: true
	},
	rocksmash: {
		basePower: 20,
		inherit: true
	},
	rocktomb: {
		accuracy: 80,
		basePower: 50,
		pp: 10,
		inherit: true
	},
	roleplay: {
		onTryHit: function (target, source) {
			var bannedAbilities = {
				flowergift: 1,
				forecast: 1,
				illusion: 1,
				imposter: 1,
				multitype: 1,
				trace: 1,
				wonderguard: 1,
				zenmode: 1
			};
			if (bannedAbilities[target.ability] || source.ability === 'multitype' || target.ability === source.ability) {
				return false;
			}
		},
		onHit: function (target, source) {
			if (source.setAbility(target.ability)) {
				this.add('-ability', source, source.ability, '[from] move: Role Play', '[of] ' + target);
				return;
			}
			return false;
		},
		inherit: true
	},
	rollout: {
		basePowerCallback: function (pokemon, target) {
			var bp = 30;
			var bpTable = [30, 60, 120, 240, 480];
			if (pokemon.volatiles.rollout && pokemon.volatiles.rollout.hitCount) {
				bp = (bpTable[pokemon.volatiles.rollout.hitCount] || 480);
			}
			pokemon.addVolatile('rollout');
			if (pokemon.volatiles.defensecurl) {
				bp *= 2;
			}
			this.debug("Rollout bp: " + bp);
			return bp;
		},
		effect: {
			duration: 2,
			onLockMove: "rollout",
			onStart: function () {
				this.effectData.hitCount = 1;
			},
			onRestart: function () {
				this.effectData.hitCount++;
				if (this.effectData.hitCount < 5) {
					this.effectData.duration = 2;
				}
			},
			onResidual: function (target) {
				if (target.lastMove === 'struggle') {
					// don't lock
					delete target.volatiles['rollout'];
				}
			}
		},
		inherit: true
	},
	safeguard: {
		effect: {
			duration: 5,
			durationCallBack: function (target, source, effect) {
				if (source && source.ability === 'persistent') {
					return 7;
				}
				return 5;
			},
			onSetStatus: function (status, target, source, effect) {
				if (source && source !== target && source.ability !== 'infiltrator' || (effect && effect.id === 'toxicspikes')) {
					this.debug('interrupting setStatus');
					return false;
				}
			},
			onTryConfusion: function (target, source, effect) {
				if (source && source !== target && source.ability !== 'infiltrator') {
					this.debug('interrupting addVolatile');
					return false;
				}
			},
			onTryHit: function (target, source, move) {
				if (move && move.id === 'yawn') {
					this.debug('blocking yawn');
					return false;
				}
			},
			onStart: function (side) {
				this.add('-sidestart', side, 'Safeguard');
			},
			onResidualOrder: 21,
			onResidualSubOrder: 2,
			onEnd: function (side) {
				this.add('-sideend', side, 'Safeguard');
			}
		},
		inherit: true
	},
	sandattack: {
		name: "Sand Attack",
		inherit: true
	},
	sandtomb: {
		accuracy: 70,
		basePower: 15,
		inherit: true
	},
	scaryface: {
		accuracy: 90,
		inherit: true
	},
	selfdestruct: {
		basePower: 400,
		inherit: true
	},
	sketch: {
		onHit: function (target, source) {
			var disallowedMoves = {
				chatter: 1,
				sketch: 1,
				struggle: 1
			};
			if (source.transformed || !target.lastMove || disallowedMoves[target.lastMove] || source.moves.indexOf(target.lastMove) !== -1) return false;
			var moveslot = source.moves.indexOf('sketch');
			if (moveslot === -1) return false;
			var move = Tools.getMove(target.lastMove);
			var sketchedMove = {
				move: move.name,
				id: move.id,
				pp: move.pp,
				maxpp: move.pp,
				target: move.target,
				disabled: false,
				used: false
			};
			source.moveset[moveslot] = sketchedMove;
			source.baseMoveset[moveslot] = sketchedMove;
			source.moves[moveslot] = toId(move.name);
			this.add('-activate', source, 'move: Sketch', move.name);
		},
		inherit: true
	},
	skillswap: {
		onHit: function (target, source) {
			var targetAbility = target.ability;
			var sourceAbility = source.ability;
			if (!target.setAbility(sourceAbility) || !source.setAbility(targetAbility)) {
				target.ability = targetAbility;
				source.ability = sourceAbility;
				return false;
			}
			this.add('-activate', source, 'move: Skill Swap');
		},
		desc: "The user trades its Ability with one adjacent target. Fails if either the user or the target's Ability is Illusion, Multitype, or Wonder Guard, or if both have the same Ability. Ignores a target's Substitute.",
		onTryHit: function (target, source) {
			var bannedAbilities = {
				illusion: 1,
				multitype: 1,
				wonderguard: 1
			};
			if (bannedAbilities[target.ability] || bannedAbilities[source.ability]) {
				return false;
			}
		},
		inherit: true
	},
	skullbash: {
		basePower: 100,
		pp: 15,
		onTry: function (attacker, defender, move) {
			if (attacker.removeVolatile(move.id)) {
				return;
			}
			this.add('-prepare', attacker, move.name, defender);
			attacker.addVolatile(move.id, defender);
			if (!this.runEvent('ChargeMove', attacker, defender, move)) {
				this.add('-anim', attacker, move.name, defender);
				attacker.removeVolatile(move.id);
				return;
			}
			return null;
		},
		effect: {
			duration: 2,
			onLockMove: "skullbash",
			onStart: function (pokemon) {
				this.boost({
					def: 1
				}, pokemon, pokemon, this.getMove('skullbash'));
			}
		},
		inherit: true
	},
	skyattack: {
		onTry: function (attacker, defender, move) {
			if (attacker.removeVolatile(move.id)) {
				return;
			}
			this.add('-prepare', attacker, move.name, defender);
			if (!this.runEvent('ChargeMove', attacker, defender, move)) {
				this.add('-anim', attacker, move.name, defender);
				return;
			}
			attacker.addVolatile(move.id, defender);
			return null;
		},
		inherit: true
	},
	sleeppowder: {
		isPowder: null,
		onTryHit: function () {},
		inherit: true
	},
	sleeptalk: {
		onTryHit: function (pokemon) {
			if (pokemon.status !== 'slp') return false;
		},
		onHit: function (pokemon) {
			var moves = [];
			for (var i = 0; i < pokemon.moveset.length; i++) {
				var move = pokemon.moveset[i].id;
				var NoSleepTalk = {
					assist: 1,
					bide: 1,
					chatter: 1,
					copycat: 1,
					focuspunch: 1,
					mefirst: 1,
					metronome: 1,
					mimic: 1,
					mirrormove: 1,
					naturepower: 1,
					sketch: 1,
					sleeptalk: 1,
					uproar: 1
				};
				if (move && !(NoSleepTalk[move] || this.getMove(move).isTwoTurnMove)) {
					moves.push(move);
				}
			}
			var move = '';
			if (moves.length) move = moves[this.random(moves.length)];
			if (!move) {
				return false;
			}
			this.useMove(move, pokemon);
		},
		inherit: true
	},
	smog: {
		basePower: 20,
		inherit: true
	},
	snatch: {
		effect: {
			duration: 1,
			onStart: function (pokemon) {
				this.add('-singleturn', pokemon, 'Snatch');
			},
			onAnyTryMove: function (source, target, move) {
				if (move && move.isSnatchable && move.sourceEffect !== 'snatch') {
					var snatchUser = this.effectData.source;
					snatchUser.removeVolatile('snatch');
					this.add('-activate', snatchUser, 'Snatch', '[of] ' + source);
					this.useMove(move.id, snatchUser);
					return null;
				}
			}
		},
		inherit: true
	},
	snore: {
		basePower: 40,
		onTryHit: function (target, source) {
			if (source.status !== 'slp') return false;
		},
		inherit: true
	},
	solarbeam: {
		onTry: function (attacker, defender, move) {
			if (attacker.removeVolatile(move.id)) {
				return;
			}
			this.add('-prepare', attacker, move.name, defender);
			if (this.isWeather('sunnyday') || !this.runEvent('ChargeMove', attacker, defender, move)) {
				this.add('-anim', attacker, move.name, defender);
				return;
			}
			attacker.addVolatile(move.id, defender);
			return null;
		},
		onBasePower: function (bpMod, pokemon, target) {
			if (this.isWeather(['raindance', 'sandstorm', 'hail'])) {
				this.debug('weakened by weather');
				return this.chain(bpMod, 0.5);
			}
		},
		inherit: true
	},
	spiderweb: {
		onHit: function (target) {
			target.addVolatile('trapped');
		},
		inherit: true
	},
	spikes: {
		isBounceable: false,
		effect: {
			onStart: function (side) {
				this.add('-sidestart', side, 'Spikes');
				this.effectData.layers = 1;
			},
			onRestart: function (side) {
				if (this.effectData.layers >= 3) return false;
				this.add('-sidestart', side, 'Spikes');
				this.effectData.layers++;
			},
			onSwitchIn: function (pokemon) {
				var side = pokemon.side;
				if (!pokemon.runImmunity('Ground')) return;
				var damageAmounts = [0, 3, 4, 6]; // 1/8, 1/6, 1/4
				var damage = this.damage(damageAmounts[this.effectData.layers] * pokemon.maxhp / 24);
			}
		},
		inherit: true
	},
	spitup: {
		basePowerCallback: function (pokemon) {
			if (!pokemon.volatiles['stockpile'] || !pokemon.volatiles['stockpile'].layers) return false;
			return pokemon.volatiles['stockpile'].layers * 100;
		},
		onTry: function (pokemon) {
			if (!pokemon.volatiles['stockpile']) {
				return false;
			}
		},
		onAfterMove: function (pokemon) {
			pokemon.removeVolatile('stockpile');
		},
		inherit: true
	},
	spite: {
		isBounceable: false,
		onHit: function (target) {
			var roll = this.random(2, 6);
			if (target.deductPP(target.lastMove, roll)) {
				this.add("-activate", target, 'move: Spite', target.lastMove, roll);
				return;
			}
			return false;
		},
		inherit: true
	},
	splash: {
		onTryHit: function (target, source) {
			this.add('-nothing');
			return null;
		},
		inherit: true
	},
	spore: {
		onTryHit: function () {},
		inherit: true
	},
	stockpile: {
		pp: 10,
		boosts: false,
		onTryHit: function (pokemon) {
			if (pokemon.volatiles['stockpile'] && pokemon.volatiles['stockpile'].layers >= 3) return false;
		},
		effect: {
			onStart: function (target) {
				this.effectData.layers = 1;
				this.add('-start', target, 'stockpile' + this.effectData.layers);
				this.boost({
					def: 1,
					spd: 1
				}, target, target, this.getMove('stockpile'));
			},
			onRestart: function (target) {
				if (this.effectData.layers >= 3) return false;
				this.effectData.layers++;
				this.add('-start', target, 'stockpile' + this.effectData.layers);
				this.boost({
					def: 1,
					spd: 1
				}, target, target, this.getMove('stockpile'));
			},
			onEnd: function (target) {
				var layers = this.effectData.layers * -1;
				this.effectData.layers = 0;
				this.boost({
					def: layers,
					spd: layers
				}, target, target, this.getMove('stockpile'));
				this.add('-end', target, 'Stockpile');
			}
		},
		inherit: true
	},
	stringshot: {
		desc: "Lowers all adjacent foes' Speed by 1 stage. Pokemon protected by Magic Coat or the Ability Magic Bounce are unaffected and instead use this move themselves.",
		shortDesc: "Lowers the foe(s) Speed by 1.",
		boosts: {
			spe: -1
		},
		inherit: true
	},
	struggle: {
		beforeMoveCallback: function (pokemon) {
			this.add('-message', pokemon.name + ' has no moves left! (placeholder)');
		},
		onModifyMove: function (move) {
			move.type = '???';
		},
		recoil: [1, 2],
		self: {
			onHit: function (source) {
				this.directDamage(source.maxhp / 4, source, source, 'strugglerecoil');
			}
		},
		inherit: true
	},
	stunspore: {
		onTryHit: function () {},
		inherit: true
	},
	substitute: {
		onTryHit: function (target) {
			if (target.volatiles['substitute']) {
				this.add('-fail', target, 'move: Substitute');
				return null;
			}
			if (target.hp <= target.maxhp / 4 || target.maxhp === 1) { // Shedinja clause
				this.add('-fail', target, 'move: Substitute', '[weak]');
				return null;
			}
		},
		onHit: function (target) {
			this.directDamage(target.maxhp / 4);
		},
		effect: {
			onStart: function (target) {
				this.add('-start', target, 'Substitute');
				this.effectData.hp = Math.floor(target.maxhp / 4);
				delete target.volatiles['partiallytrapped'];
			},
			onTryPrimaryHitPriority: -1,
			onTryPrimaryHit: function (target, source, move) {
				if (target === source) {
					this.debug('sub bypass: self hit');
					return;
				}
				if (move.category === 'Status') {
					if (move.notSubBlocked) {
						return;
					}
					var SubBlocked = {
						block: 1,
						embargo: 1,
						entrainment: 1,
						gastroacid: 1,
						healblock: 1,
						healpulse: 1,
						leechseed: 1,
						lockon: 1,
						meanlook: 1,
						mindreader: 1,
						nightmare: 1,
						painsplit: 1,
						psychoshift: 1,
						simplebeam: 1,
						skydrop: 1,
						soak: 1,
						spiderweb: 1,
						switcheroo: 1,
						trick: 1,
						worryseed: 1,
						yawn: 1
					};
					if (move.status || move.boosts || move.volatileStatus === 'confusion' || SubBlocked[move.id]) {
						return false;
					}
					return;
				}
				var damage = this.getDamage(source, target, move);
				if (!damage) {
					return null;
				}
				damage = this.runEvent('SubDamage', target, source, move, damage);
				if (!damage) {
					return damage;
				}
				if (damage > target.volatiles['substitute'].hp) {
					damage = target.volatiles['substitute'].hp;
				}
				target.volatiles['substitute'].hp -= damage;
				source.lastDamage = damage;
				if (target.volatiles['substitute'].hp <= 0) {
					target.removeVolatile('substitute');
				}
				else {
					this.add('-activate', target, 'Substitute', '[damage]');
				}
				if (move.recoil) {
					this.damage(Math.round(damage * move.recoil[0] / move.recoil[1]), source, target, 'recoil');
				}
				if (move.drain) {
					this.heal(Math.ceil(damage * move.drain[0] / move.drain[1]), source, target, 'drain');
				}
				this.runEvent('AfterSubDamage', target, source, move, damage);
				return 0; // hit
			},
			onEnd: function (target) {
				this.add('-end', target, 'Substitute');
			}
		},
		inherit: true
	},
	superfang: {
		damageCallback: function (pokemon, target) {
			return target.hp / 2;
		},
		inherit: true
	},
	surf: {
		basePower: 95,
		inherit: true
	},
	swallow: {
		onTryHit: function (pokemon) {
			if (!pokemon.volatiles['stockpile'] || !pokemon.volatiles['stockpile'].layers) return false;
		},
		onHit: function (pokemon) {
			var healAmount = [0.25, 0.5, 1];
			this.heal(this.modify(pokemon.maxhp, healAmount[(pokemon.volatiles['stockpile'].layers - 1)]));
			pokemon.removeVolatile('stockpile');
		},
		inherit: true
	},
	sweetkiss: {
		type: "Normal",
		inherit: true
	},
	sweetscent: {
		desc: "Lowers all adjacent foes' evasion by 1 stage. Pokemon protected by Magic Coat or the Ability Magic Bounce are unaffected and instead use this move themselves. (Field: Can be used to attract wild Pokemon while standing in grass. Fails if the weather is not clear.)",
		shortDesc: "Lowers the foe(s) evasion by 1.",
		boosts: {
			evasion: -1
		},
		inherit: true
	},
	swordsdance: {
		pp: 30,
		inherit: true
	},
	synthesis: {
		onHit: function (pokemon) {
			if (this.isWeather('sunnyday')) this.heal(this.modify(pokemon.maxhp, 0.667));
			else if (this.isWeather(['raindance', 'sandstorm', 'hail'])) this.heal(this.modify(pokemon.maxhp, 0.25));
			else this.heal(this.modify(pokemon.maxhp, 0.5));
		},
		inherit: true
	},
	tackle: {
		accuracy: 95,
		basePower: 35,
		inherit: true
	},
	tailglow: {
		boosts: {
			spa: 2
		},
		inherit: true
	},
	taunt: {
		isBounceable: false,
		effect: {
			duration: 2,
			onStart: function (target) {
				this.add('-start', target, 'move: Taunt');
			},
			onResidualOrder: 12,
			onEnd: function (target) {
				this.add('-end', target, 'move: Taunt');
			},
			onModifyPokemon: function (pokemon) {
				var moves = pokemon.moveset;
				for (var i = 0; i < moves.length; i++) {
					if (this.getMove(moves[i].move).category === 'Status') {
						moves[i].disabled = true;
					}
				}
			},
			onBeforeMove: function (attacker, defender, move) {
				if (move.category === 'Status') {
					this.add('cant', attacker, 'move: Taunt', move);
					return false;
				}
			}
		},
		inherit: true
	},
	thief: {
		basePower: 40,
		onHit: function (target, source) {
			if (source.item) {
				return;
			}
			var yourItem = target.takeItem(source);
			if (!yourItem) {
				return;
			}
			if (!source.setItem(yourItem)) {
				target.item = yourItem.id; // bypass setItem so we don't break choicelock or anything
				return;
			}
			this.add('-item', source, yourItem, '[from] move: Thief', '[of] ' + target);
		},
		inherit: true
	},
	thrash: {
		basePower: 90,
		pp: 20,
		inherit: true
	},
	thunder: {
		basePower: 120,
		onModifyMove: function (move) {
			if (this.isWeather('raindance')) move.accuracy = true;
			else if (this.isWeather('sunnyday')) move.accuracy = 50;
		},
		inherit: true
	},
	thunderpunch: {
		name: "Thunder Punch",
		inherit: true
	},
	thundershock: {
		name: "ThunderShock",
		inherit: true
	},
	thunderbolt: {
		basePower: 95,
		inherit: true
	},
	tickle: {
		notSubBlocked: true,
		inherit: true
	},
	torment: {
		isBounceable: false,
		effect: {
			onStart: function (pokemon) {
				this.add('-start', pokemon, 'Torment');
			},
			onEnd: function (pokemon) {
				this.add('-end', pokemon, 'Torment');
			},
			onModifyPokemon: function (pokemon) {
				if (pokemon.lastMove !== 'struggle') pokemon.disabledMoves[pokemon.lastMove] = true;
			}
		},
		inherit: true
	},
	toxic: {
		accuracy: 85,
		inherit: true
	},
	transform: {
		onHit: function (target, pokemon) {
			if (!pokemon.transformInto(target, pokemon)) {
				return false;
			}
			this.add('-transform', pokemon, target);
		},
		inherit: true
	},
	triattack: {
		secondary: {
			chance: 20,
			onHit: function (target, source) {
				var result = this.random(3);
				if (result === 0) {
					target.trySetStatus('brn', source);
				}
				else if (result === 1) {
					target.trySetStatus('par', source);
				}
				else {
					target.trySetStatus('frz', source);
				}
			}
		},
		inherit: true
	},
	trick: {
		onHit: function (target, source) {
			var yourItem = target.takeItem(source);
			var myItem = source.takeItem();
			if (target.item || source.item || (!yourItem && !myItem)) {
				if (yourItem) target.item = yourItem;
				if (myItem) source.item = myItem;
				return false;
			}
			this.add('-activate', source, 'move: Trick', '[of] ' + target);
			if (myItem) {
				target.setItem(myItem);
				this.add('-item', target, myItem, '[from] move: Trick');
			}
			if (yourItem) {
				source.setItem(yourItem);
				this.add('-item', source, yourItem, '[from] move: Trick');
			}
		},
		inherit: true
	},
	triplekick: {
		basePowerCallback: function (pokemon) {
			pokemon.addVolatile('triplekick');
			return 10 * pokemon.volatiles['triplekick'].hit;
		},
		effect: {
			duration: 1,
			onStart: function () {
				this.effectData.hit = 1;
			},
			onRestart: function () {
				this.effectData.hit++;
			}
		},
		inherit: true
	},
	uproar: {
		basePower: 50,
		onTryHit: function (target) {
			for (var i = 0; i < target.side.active.length; i++) {
				var allyActive = target.side.active[i];
				if (allyActive && allyActive.status === 'slp') allyActive.cureStatus();
				var foeActive = target.side.foe.active[i];
				if (foeActive && foeActive.status === 'slp') foeActive.cureStatus();
			}
		},
		effect: {
			duration: 3,
			onResidual: function (target) {
				this.add('-start', target, 'Uproar', '[upkeep]');
			},
			onStart: function (target) {
				this.add('-start', target, 'Uproar');
			},
			onEnd: function (target) {
				this.add('-end', target, 'Uproar');
			},
			onLockMove: "uproar",
			onAnySetStatus: function (status, pokemon) {
				if (status.id === 'slp') {
					if (pokemon === this.effectData.target) {
						this.add('-fail', pokemon, 'slp', '[from] Uproar', '[msg]');
					}
					else {
						this.add('-fail', pokemon, 'slp', '[from] Uproar');
					}
					return null;
				}
			},
			onAnyTryHit: function (target, source, move) {
				if (move && move.id === 'yawn') {
					return false;
				}
			}
		},
		inherit: true
	},
	vinewhip: {
		pp: 10,
		basePower: 35,
		inherit: true
	},
	volttackle: {
		recoil: [1, 3],
		secondary: false,
		inherit: true
	},
	waterpulse: {
		isPulseMove: null,
		inherit: true
	},
	watersport: {
		onTryHitField: function (target, source) {
			if (source.volatiles['watersport']) return false;
		},
		effect: {
			noCopy: true,
			onStart: function (pokemon) {
				this.add("-start", pokemon, 'move: Water Sport');
			},
			onBasePowerModifier: 1,
			onAnyBasePower: function (bpMod, user, target, move) {
				if (move.type === 'Fire') return this.chain(bpMod, [0x548, 0x1000]); // The Water Sport modifier is slightly higher than the usual 0.33 modifier (0x547)
			}
		},
		inherit: true
	},
	waterspout: {
		basePowerCallback: function (pokemon) {
			return 150 * pokemon.hp / pokemon.maxhp;
		},
		inherit: true
	},
	waterfall: {
		secondary: false,
		inherit: true
	},
	weatherball: {
		basePowerCallback: function () {
			if (this.weather) return 100;
			return 50;
		},
		onModifyMove: function (move) {
			switch (this.effectiveWeather()) {
			case 'sunnyday':
				move.type = 'Fire';
				break;
			case 'raindance':
				move.type = 'Water';
				break;
			case 'sandstorm':
				move.type = 'Rock';
				break;
			case 'hail':
				move.type = 'Ice';
				break;
			}
		},
		inherit: true
	},
	whirlpool: {
		accuracy: 70,
		basePower: 15,
		inherit: true
	},
	whirlwind: {
		isBounceable: false,
		accuracy: 100,
		isNotProtectable: null,
		inherit: true
	},
	willowisp: {
		accuracy: 75,
		inherit: true
	},
	wish: {
		effect: {
			duration: 2,
			onResidualOrder: 2,
			onEnd: function (side) {
				var target = side.active[this.effectData.sourcePosition];
				if (!target.fainted) {
					var source = this.effectData.source;
					var damage = this.heal(target.maxhp / 2, target, target);
					if (damage) this.add('-heal', target, target.getHealth, '[from] move: Wish', '[wisher] ' + source.name);
				}
			}
		},
		inherit: true
	},
	wrap: {
		accuracy: 85,
		inherit: true
	},
	yawn: {
		onTryHit: function (target) {
			if (target.status || !target.runImmunity('slp')) {
				return false;
			}
		},
		effect: {
			noCopy: true,
			duration: 2,
			onStart: function (target, source) {
				this.add('-start', target, 'move: Yawn', '[of] ' + source);
			},
			onEnd: function (target) {
				target.trySetStatus('slp');
			}
		},
		inherit: true
	},
	zapcannon: {
		basePower: 100,
		inherit: true
	},
	highjumpkick: {
		onMoveFail: function (target, source, move) {
			this.damage(source.maxhp / 2, source, source, 'highjumpkick');
		},
		inherit: true
	},
	smellingsalts: {
		basePowerCallback: function (pokemon, target) {
			if (target.status === 'par') return 120;
			return 60;
		},
		onHit: function (target) {
			if (target.status === 'par') target.cureStatus();
		},
		inherit: true
	}
};
