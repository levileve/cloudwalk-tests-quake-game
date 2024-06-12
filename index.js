const fs = require("fs");
const util = require("util");

(async function () {
  try {
    const read_file = util.promisify(fs.readFile);

    const game_logs = await read_file("./qgames.log", "utf-8");

    const game_1 = {
      total_kills: 0,
      world_kills: 0,
      players_kills: 0,
      players: [],
      kills: {},
      kills_by_means: {},
    };

    const has_events_kills = game_logs.match(/(?<=Kill:\s).*/g);

    if (has_events_kills && has_events_kills.length) {
      has_events_kills.forEach((event_kill) => {
        const actors_event = event_kill
          .split(/\d*\s\d*\s\d*:\s|\skilled\s|\sby\s(?=MOD_.*)/g)
          .slice(1);

        if (!actors_event || !actors_event.length) {
          return;
        }

        const kills_by_means = actors_event.pop();

        const has_mean = game_1.kills_by_means[kills_by_means];
        game_1.kills_by_means[kills_by_means] = has_mean ? has_mean + 1 : 1;

        const has_total_kills = game_1.total_kills;
        game_1.total_kills = has_total_kills ? game_1.total_kills + 1 : 1;

        const killer = actors_event[0];

        if (killer !== "<world>") {
          const hasKiller = game_1.kills[killer];
          game_1.kills[killer] = hasKiller ? game_1.kills[killer] + 1 : 1;

          const has_players = game_1.players_kills;
          game_1.players_kills = has_players ? game_1.players_kills + 1 : 1;
        } else {
          const dead = actors_event[1];

          const hasWorldKills = game_1.world_kills;
          game_1.world_kills = hasWorldKills ? game_1.world_kills + 1 : 1;

          const hasDead = game_1.kills[dead];
          game_1.kills[dead] = hasDead ? game_1.kills[dead] - 1 : 0;
        }
      });

      game_1.players = Object.keys(game_1.kills);
    }

    console.log("\n", "game_1: ", game_1, "\n");
  } catch (error) {
    console.log("\n", "error: ", error, "\n");
  }
})();
