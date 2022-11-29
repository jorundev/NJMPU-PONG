export interface Ranking {
	rank: string;
	level: number;
	xp: number;
}

export class PongRanking {
	private readonly levels_xp: Array<number> = this.generateLevels();
	private readonly scaling = {
		default: {
			value: 2,
		},
		private: {
			win: 2,
			loose: 0,
		},
		ranked: {
			win: 4,
			loose: 1,
		},
	};
	readonly angels: Array<string> = [
		'Lilin',
		'Sandalphon',
		'Gaghiel',
		'Ireul',
		'Matarael',
		'Sachiel',
		'Zeruel',
		'Sahaquiel',
		'Israfel',
		'Shamshel',
		'Bradiel',
		'Leliel',
		'Ramiel',
		'Armisael',
		'Arael',
		'Tabris',
		'Lilith',
		'Adam',
	];

	private trimFloats(level_xp: Array<number>): Array<number> {
		for (const i in level_xp) {
			const xp = level_xp[i];
			level_xp[i] = Math.floor(xp);
		}
		return level_xp;
	}

	private generateLevels(): Array<number> {
		let level_xp: Array<number> = [];

		for (let i = 0; i < 18; i++) {
			if (i === 0) {
				level_xp.push(0);
				continue;
			}
			const xp = (level_xp[i - 1] + 100) * 1.2;
			level_xp.push(xp);
		}

		return this.trimFloats(level_xp);
	}

	getRank(xp: number): Ranking {
		let i: number = 0;

		for (const level_xp of this.levels_xp) {
			if (xp < level_xp) {
				break;
			}
			i++;
		}

		return {
			rank: this.angels[i - 1],
			level: i,
			xp: xp - this.levels_xp[i - 1],
		};
	}

	getXP(score: number, win: boolean, ranked: boolean) {
		if (ranked) {
			if (win) {
				return score * this.scaling.default.value * this.scaling.ranked.win;
			}
			return score * this.scaling.default.value * this.scaling.ranked.loose;
		}
		if (win) {
			return score * this.scaling.default.value * this.scaling.private.loose;
		}
		return score * this.scaling.default.value * this.scaling.private.loose;
	}
}