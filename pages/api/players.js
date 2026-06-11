export default function handler(req, res) {

  const players = [
    { id: 1, name: "Raul Jimenez", team: "Mexico", position: "Forward" },
    { id: 2, name: "Santiago Gimenez", team: "Mexico", position: "Forward" },
    { id: 3, name: "Bukayo Saka", team: "England", position: "Midfielder" },
    { id: 4, name: "Phil Foden", team: "England", position: "Midfielder" },
    { id: 5, name: "Kylian Mbappe", team: "France", position: "Forward" },
    { id: 6, name: "Lionel Messi", team: "Argentina", position: "Forward" },
    { id: 7, name: "Rodri", team: "Spain", position: "Midfielder" }
  ];

  res.status(200).json({ players });
}