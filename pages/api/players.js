export default function handler(req, res) {

  const players = [

    // 🇫🇷 FRANCE
    { id: 1, name: "N'Golo Kante", team: "France", position: "Midfielder" },
    { id: 2, name: "Manu Kone", team: "France", position: "Midfielder" },
    { id: 3, name: "Adrien Rabiot", team: "France", position: "Midfielder" },
    { id: 4, name: "Aurelien Tchouameni", team: "France", position: "Midfielder" },
    { id: 5, name: "Warren Zaire-Emery", team: "France", position: "Midfielder" },
    { id: 6, name: "Maghnes Akliouche", team: "France", position: "Forward" },
    { id: 7, name: "Bradley Barcola", team: "France", position: "Forward" },
    { id: 8, name: "Rayan Cherki", team: "France", position: "Forward" },
    { id: 9, name: "Ousmane Dembele", team: "France", position: "Forward" },
    { id: 10, name: "Desire Doue", team: "France", position: "Forward" },
    { id: 11, name: "Jean-Philippe Mateta", team: "France", position: "Forward" },
    { id: 12, name: "Kylian Mbappe", team: "France", position: "Forward" },
    { id: 13, name: "Michael Olise", team: "France", position: "Forward" },
    { id: 14, name: "Marcus Thuram", team: "France", position: "Forward" },

    // 🏴 ENGLAND
    { id: 15, name: "Elliot Anderson", team: "England", position: "Midfielder" },
    { id: 16, name: "Jude Bellingham", team: "England", position: "Midfielder" },
    { id: 17, name: "Eberechi Eze", team: "England", position: "Midfielder" },
    { id: 18, name: "Jordan Henderson", team: "England", position: "Midfielder" },
    { id: 19, name: "Kobbie Mainoo", team: "England", position: "Midfielder" },
    { id: 20, name: "Declan Rice", team: "England", position: "Midfielder" },
    { id: 21, name: "Morgan Rogers", team: "England", position: "Midfielder" },
    { id: 22, name: "Anthony Gordon", team: "England", position: "Forward" },
    { id: 23, name: "Harry Kane", team: "England", position: "Forward" },
    { id: 24, name: "Noni Madueke", team: "England", position: "Forward" },
    { id: 25, name: "Marcus Rashford", team: "England", position: "Forward" },
    { id: 26, name: "Bukayo Saka", team: "England", position: "Forward" },
    { id: 27, name: "Ivan Toney", team: "England", position: "Forward" },
    { id: 28, name: "Ollie Watkins", team: "England", position: "Forward" },

    // 🇪🇸 SPAIN
    { id: 29, name: "Rodrigo Hernandez", team: "Spain", position: "Midfielder" },
    { id: 30, name: "Martin Zubimendi", team: "Spain", position: "Midfielder" },
    { id: 31, name: "Pedri Gonzalez", team: "Spain", position: "Midfielder" },
    { id: 32, name: "Fabian Ruiz", team: "Spain", position: "Midfielder" },
    { id: 33, name: "Mikel Merino", team: "Spain", position: "Midfielder" },
    { id: 34, name: "Pablo Paez Gavi", team: "Spain", position: "Midfielder" },
    { id: 35, name: "Alex Baena", team: "Spain", position: "Midfielder" },
    { id: 36, name: "Mikel Oyarzabal", team: "Spain", position: "Forward" },
    { id: 37, name: "Lamine Yamal", team: "Spain", position: "Forward" },
    { id: 38, name: "Ferran Torres", team: "Spain", position: "Forward" },
    { id: 39, name: "Borja Iglesias", team: "Spain", position: "Forward" },
    { id: 40, name: "Dani Olmo", team: "Spain", position: "Forward" },
    { id: 41, name: "Victor Munoz", team: "Spain", position: "Forward" },
    { id: 42, name: "Nico Williams", team: "Spain", position: "Forward" },
    { id: 43, name: "Yeremy Pino", team: "Spain", position: "Forward" },

    // 🇦🇷 ARGENTINA
    { id: 44, name: "Leandro Paredes", team: "Argentina", position: "Midfielder" },
    { id: 45, name: "Alexis Mac Allister", team: "Argentina", position: "Midfielder" },
    { id: 46, name: "Rodrigo De Paul", team: "Argentina", position: "Midfielder" },
    { id: 47, name: "Giovani Lo Celso", team: "Argentina", position: "Midfielder" },
    { id: 48, name: "Exequiel Palacios", team: "Argentina", position: "Midfielder" },
    { id: 49, name: "Enzo Fernandez", team: "Argentina", position: "Midfielder" },
    { id: 50, name: "Valentin Barco", team: "Argentina", position: "Midfielder" },
    { id: 51, name: "Lionel Messi", team: "Argentina", position: "Forward" },
    { id: 52, name: "Julian Alvarez", team: "Argentina", position: "Forward" },
    { id: 53, name: "Lautaro Martinez", team: "Argentina", position: "Forward" },
    { id: 54, name: "Thiago Almada", team: "Argentina", position: "Forward" },
    { id: 55, name: "Nicolas Paz", team: "Argentina", position: "Forward" },
    { id: 56, name: "Nicolas Gonzalez", team: "Argentina", position: "Forward" },
    { id: 57, name: "Giuliano Simeone", team: "Argentina", position: "Forward" },
    { id: 58, name: "Jose Manuel Lopez", team: "Argentina", position: "Forward" },

    // 🇧🇷 BRAZIL
    { id: 59, name: "Bruno Guimaraes", team: "Brazil", position: "Midfielder" },
    { id: 60, name: "Casemiro", team: "Brazil", position: "Midfielder" },
    { id: 61, name: "Danilo Santos", team: "Brazil", position: "Midfielder" },
    { id: 62, name: "Fabinho", team: "Brazil", position: "Midfielder" },
    { id: 63, name: "Lucas Paqueta", team: "Brazil", position: "Midfielder" },
    { id: 64, name: "Endrick", team: "Brazil", position: "Forward" },
    { id: 65, name: "Gabriel Martinelli", team: "Brazil", position: "Forward" },
    { id: 66, name: "Igor Thiago", team: "Brazil", position: "Forward" },
    { id: 67, name: "Luiz Henrique", team: "Brazil", position: "Forward" },
    { id: 68, name: "Matheus Cunha", team: "Brazil", position: "Forward" },
    { id: 69, name: "Neymar Junior", team: "Brazil", position: "Forward" },
    { id: 70, name: "Raphinha", team: "Brazil", position: "Forward" },
    { id: 71, name: "Rayan", team: "Brazil", position: "Forward" },
    { id: 72, name: "Vinicius Junior", team: "Brazil", position: "Forward" },
    { id: 73, name: "Raul Jimenez", team: "Mexico", position: "Forward" }

  ];

  res.status(200).json({ players });
}