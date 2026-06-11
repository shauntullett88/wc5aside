/**
 * lib/mockPlayers.js
 * Fallback player data used when:
 *   - No API key is configured yet
 *   - API is unavailable / rate-limited
 *
 * This mirrors the exact schema of the players table so the UI works
 * identically with real or mock data.
 *
 * TO USE REAL DATA: Set API_FOOTBALL_KEY in .env.local and call /api/admin/seed
 */

export const MOCK_PLAYERS = [
  // ── Brazil ──────────────────────────────────────────────────────────────
  { id: 1,  name: 'Vinicius Jr.',    team: 'Brazil',      team_id: 10, position: 'Forward',    goals: 0, photo_url: null },
  { id: 2,  name: 'Rodrygo',        team: 'Brazil',      team_id: 10, position: 'Forward',    goals: 0, photo_url: null },
  { id: 3,  name: 'Lucas Paquetá',  team: 'Brazil',      team_id: 10, position: 'Midfielder', goals: 0, photo_url: null },
  { id: 4,  name: 'Bruno Guimarães',team: 'Brazil',      team_id: 10, position: 'Midfielder', goals: 0, photo_url: null },
  { id: 5,  name: 'Endrick',        team: 'Brazil',      team_id: 10, position: 'Forward',    goals: 0, photo_url: null },

  // ── France ──────────────────────────────────────────────────────────────
  { id: 6,  name: 'Kylian Mbappé',  team: 'France',      team_id: 26, position: 'Forward',    goals: 0, photo_url: null },
  { id: 7,  name: 'Antoine Griezmann',team:'France',     team_id: 26, position: 'Forward',    goals: 0, photo_url: null },
  { id: 8,  name: 'Ousmane Dembélé',team: 'France',     team_id: 26, position: 'Forward',    goals: 0, photo_url: null },
  { id: 9,  name: 'Aurélien Tchouaméni',team:'France',  team_id: 26, position: 'Midfielder', goals: 0, photo_url: null },
  { id: 10, name: 'Eduardo Camavinga',team:'France',     team_id: 26, position: 'Midfielder', goals: 0, photo_url: null },

  // ── Spain ───────────────────────────────────────────────────────────────
  { id: 11, name: 'Lamine Yamal',   team: 'Spain',       team_id: 9,  position: 'Forward',    goals: 0, photo_url: null },
  { id: 12, name: 'Álvaro Morata',  team: 'Spain',       team_id: 9,  position: 'Forward',    goals: 0, photo_url: null },
  { id: 13, name: 'Pedri',          team: 'Spain',       team_id: 9,  position: 'Midfielder', goals: 0, photo_url: null },
  { id: 14, name: 'Gavi',           team: 'Spain',       team_id: 9,  position: 'Midfielder', goals: 0, photo_url: null },
  { id: 15, name: 'Nico Williams',  team: 'Spain',       team_id: 9,  position: 'Forward',    goals: 0, photo_url: null },
  { id: 16, name: 'Dani Olmo',      team: 'Spain',       team_id: 9,  position: 'Midfielder', goals: 0, photo_url: null },

  // ── England ──────────────────────────────────────────────────────────────
  { id: 17, name: 'Harry Kane',     team: 'England',     team_id: 21, position: 'Forward',    goals: 0, photo_url: null },
  { id: 18, name: 'Jude Bellingham',team: 'England',    team_id: 21, position: 'Midfielder', goals: 0, photo_url: null },
  { id: 19, name: 'Phil Foden',     team: 'England',     team_id: 21, position: 'Midfielder', goals: 0, photo_url: null },
  { id: 20, name: 'Bukayo Saka',    team: 'England',     team_id: 21, position: 'Forward',    goals: 0, photo_url: null },
  { id: 21, name: 'Marcus Rashford',team: 'England',    team_id: 21, position: 'Forward',    goals: 0, photo_url: null },
  { id: 22, name: 'Cole Palmer',    team: 'England',     team_id: 21, position: 'Midfielder', goals: 0, photo_url: null },

  // ── Germany ──────────────────────────────────────────────────────────────
  { id: 23, name: 'Florian Wirtz',  team: 'Germany',     team_id: 13, position: 'Midfielder', goals: 0, photo_url: null },
  { id: 24, name: 'Jamal Musiala',  team: 'Germany',     team_id: 13, position: 'Midfielder', goals: 0, photo_url: null },
  { id: 25, name: 'Kai Havertz',    team: 'Germany',     team_id: 13, position: 'Forward',    goals: 0, photo_url: null },
  { id: 26, name: 'Leroy Sané',     team: 'Germany',     team_id: 13, position: 'Forward',    goals: 0, photo_url: null },
  { id: 27, name: 'Thomas Müller',  team: 'Germany',     team_id: 13, position: 'Forward',    goals: 0, photo_url: null },

  // ── Argentina ────────────────────────────────────────────────────────────
  { id: 28, name: 'Lionel Messi',   team: 'Argentina',   team_id: 12, position: 'Forward',    goals: 0, photo_url: null },
  { id: 29, name: 'Julián Álvarez', team: 'Argentina',   team_id: 12, position: 'Forward',    goals: 0, photo_url: null },
  { id: 30, name: 'Lautaro Martínez',team:'Argentina',  team_id: 12, position: 'Forward',    goals: 0, photo_url: null },
  { id: 31, name: 'Rodrigo de Paul',team: 'Argentina',   team_id: 12, position: 'Midfielder', goals: 0, photo_url: null },
  { id: 32, name: 'Alexis Mac Allister',team:'Argentina',team_id: 12, position: 'Midfielder', goals: 0, photo_url: null },

  // ── Portugal ─────────────────────────────────────────────────────────────
  { id: 33, name: 'Cristiano Ronaldo',team:'Portugal',  team_id: 18, position: 'Forward',    goals: 0, photo_url: null },
  { id: 34, name: 'Rafael Leão',    team: 'Portugal',    team_id: 18, position: 'Forward',    goals: 0, photo_url: null },
  { id: 35, name: 'Bruno Fernandes',team: 'Portugal',   team_id: 18, position: 'Midfielder', goals: 0, photo_url: null },
  { id: 36, name: 'Bernardo Silva', team: 'Portugal',    team_id: 18, position: 'Midfielder', goals: 0, photo_url: null },
  { id: 37, name: 'Vitinha',        team: 'Portugal',    team_id: 18, position: 'Midfielder', goals: 0, photo_url: null },

  // ── Netherlands ──────────────────────────────────────────────────────────
  { id: 38, name: 'Cody Gakpo',     team: 'Netherlands', team_id: 34, position: 'Forward',    goals: 0, photo_url: null },
  { id: 39, name: 'Memphis Depay',  team: 'Netherlands', team_id: 34, position: 'Forward',    goals: 0, photo_url: null },
  { id: 40, name: 'Tijjani Reijnders',team:'Netherlands',team_id: 34, position: 'Midfielder', goals: 0, photo_url: null },
  { id: 41, name: 'Xavi Simons',    team: 'Netherlands', team_id: 34, position: 'Midfielder', goals: 0, photo_url: null },

  // ── Morocco ──────────────────────────────────────────────────────────────
  { id: 42, name: 'Hakim Ziyech',   team: 'Morocco',     team_id: 768, position: 'Midfielder', goals: 0, photo_url: null },
  { id: 43, name: 'Youssef En-Nesyri',team:'Morocco',   team_id: 768, position: 'Forward',    goals: 0, photo_url: null },
  { id: 44, name: 'Sofiane Boufal', team: 'Morocco',     team_id: 768, position: 'Midfielder', goals: 0, photo_url: null },

  // ── Croatia ──────────────────────────────────────────────────────────────
  { id: 45, name: 'Luka Modrić',    team: 'Croatia',     team_id: 24, position: 'Midfielder', goals: 0, photo_url: null },
  { id: 46, name: 'Ivan Perišić',   team: 'Croatia',     team_id: 24, position: 'Midfielder', goals: 0, photo_url: null },
  { id: 47, name: 'Andrej Kramarić',team: 'Croatia',    team_id: 24, position: 'Forward',    goals: 0, photo_url: null },

  // ── USA ───────────────────────────────────────────────────────────────────
  { id: 48, name: 'Christian Pulisic',team:'USA',        team_id: 858, position: 'Forward',   goals: 0, photo_url: null },
  { id: 49, name: 'Gio Reyna',       team: 'USA',        team_id: 858, position: 'Midfielder', goals: 0, photo_url: null },
  { id: 50, name: 'Ricardo Pepi',    team: 'USA',        team_id: 858, position: 'Forward',   goals: 0, photo_url: null },

  // ── Japan ─────────────────────────────────────────────────────────────────
  { id: 51, name: 'Takumi Minamino', team: 'Japan',      team_id: 6,  position: 'Forward',    goals: 0, photo_url: null },
  { id: 52, name: 'Daichi Kamada',   team: 'Japan',      team_id: 6,  position: 'Midfielder', goals: 0, photo_url: null },
  { id: 53, name: 'Kaoru Mitoma',    team: 'Japan',      team_id: 6,  position: 'Forward',    goals: 0, photo_url: null },

  // ── Italy ─────────────────────────────────────────────────────────────────
  { id: 54, name: 'Federico Chiesa', team: 'Italy',      team_id: 29, position: 'Forward',    goals: 0, photo_url: null },
  { id: 55, name: 'Nicolò Barella',  team: 'Italy',      team_id: 29, position: 'Midfielder', goals: 0, photo_url: null },
  { id: 56, name: 'Ciro Immobile',   team: 'Italy',      team_id: 29, position: 'Forward',    goals: 0, photo_url: null },

  // ── Uruguay ───────────────────────────────────────────────────────────────
  { id: 57, name: 'Darwin Núñez',    team: 'Uruguay',    team_id: 756, position: 'Forward',   goals: 0, photo_url: null },
  { id: 58, name: 'Rodrigo Bentancur',team:'Uruguay',   team_id: 756, position: 'Midfielder', goals: 0, photo_url: null },
  { id: 59, name: 'Federico Valverde',team:'Uruguay',   team_id: 756, position: 'Midfielder', goals: 0, photo_url: null },

  // ── Mexico ────────────────────────────────────────────────────────────────
  { id: 60, name: 'Hirving Lozano',  team: 'Mexico',     team_id: 803, position: 'Forward',   goals: 0, photo_url: null },
  { id: 61, name: 'Raúl Jiménez',    team: 'Mexico',     team_id: 803, position: 'Forward',   goals: 0, photo_url: null },
  { id: 62, name: 'Edson Álvarez',   team: 'Mexico',     team_id: 803, position: 'Midfielder', goals: 0, photo_url: null },

  // ── Senegal ───────────────────────────────────────────────────────────────
  { id: 63, name: 'Sadio Mané',      team: 'Senegal',    team_id: 775, position: 'Forward',   goals: 0, photo_url: null },
  { id: 64, name: 'Ismaïla Sarr',    team: 'Senegal',    team_id: 775, position: 'Forward',   goals: 0, photo_url: null },
];

export function seedMockPlayersIntoDB(upsertFn) {
  MOCK_PLAYERS.forEach(p => upsertFn(p));
  console.log(`[MockData] Seeded ${MOCK_PLAYERS.length} fallback players into DB`);
}
