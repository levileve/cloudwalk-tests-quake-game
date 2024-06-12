const fs = require("fs");
const util = require("util");

const setDataValue = (data, value = 1) => {
  const has_data = !!data;

  if (has_data) {
    return data + value;
  }

  return value > 0 ? value : 0;
};

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
        game_1.kills_by_means[kills_by_means] = setDataValue(game_1.kills_by_means[kills_by_means]);

        game_1.total_kills = setDataValue(game_1.total_kills);

        const killer = actors_event[0];

        if (killer !== "<world>") {
          game_1.kills[killer] = setDataValue(game_1.kills[killer]);

          game_1.players_kills = setDataValue(game_1.players_kills);
        } else {
          const dead = actors_event[1];

          game_1.world_kills = setDataValue(game_1.world_kills);

          game_1.kills[dead] = setDataValue(game_1.kills[dead], -1);
        }
      });

      game_1.players = Object.keys(game_1.kills);
    }

    console.log("\n", "game_1: ", game_1, "\n");
  } catch (error) {
    console.log("\n", "error: ", error, "\n");
  }
})();
