const teams = [
    {
        id: "FC_Domo",
        name: "FC Domo",
        logo: "eFotball league/FC_Barcelona_old_logo.png",
        description: "Es el equipo con la hinchada mas fiel",
        rival: { name: "Alianza Meneses", history: "Jugados: 0 | Ganados: 0 | Perdidos: 0", logo: "eFotball league/images-removebg-preview.png" },
        championships: [
            { name: "Copa 1102", result: "FC Domo 2 - 0 Inter Gerrard ", note: "Penal al centro en semis" },
            { name: "Copa 1102", result: "FC Domo x -  A x", note: "-" }
        ],
        runnerUps: [
            { name: "Copa 1102", result: "FC Domo - X ", note: "-" }
        ],
        thirdPlaces: [
            { name: "Copa 1102", note: "-" }
        ]
    },
    {
        id: "FC_Mirezra",
        name: "FC Mirezra",
        logo: "eFotball league/real-madrid-c-f-old-logo-png_seeklogo-116420.png",
        description: "Siempre se clasifica, nunca gana, junto con el Deportivo Murillo son los equipos mas faciles de vencer.",
        rival: { name: "Deportivo Murillo", history: "Jugados: 4 | Ganados: 1 |Perdidos: 3", logo: "eFotball league/River_Plate_1931.png" },
        championships: [],
        runnerUps: [],
        thirdPlaces: []
    },
    {
        id: "Deportivo_Murillo",
        name: "Deportivo Murillo",
        logo: "eFotball league/River_Plate_1931.png",
        description: "Equipo de media tabla, celebra un tercer lugar como una copa, su mayor logro es llegar a extra tiempo con 7 atras.",
        rival: { name: "FC Mirezra", history: "Jugados: 4 | Ganados: 3 |Perdidos: 1", logo: "eFotball league/real-madrid-c-f-old-logo-png_seeklogo-116420.png" },
        championships: [],
        runnerUps: [],
        thirdPlaces: [
            { name: "Copa 1102", result: "Deportivo Virsa 3 - United Andres 0", note: "Victoria por DNF" }
        ]
    },
    {
        id: "United_Andres",
        name: "United Andres",
        logo: "eFotball league/png-transparent-red-logo-icon-old-trafford-manchester-united-f-c-premier-league-logo-decal-paper-cut-doll-miscellaneous-text-sport-thumbnail-removebg-preview.png",
        description: "Es uno de los equipos mas fuertes del torneo, siempre candidato a ganar la copa, pero la mala suerte siempre esta con ellos, es el equipo con mas finales perdidas.",
        rival: { name: "Cristian FC", history: "Jugados: 0 | Ganados: 0 | Perdidos: 0", logo: "eFotball league/Escudo_Club_Deportivo_Municipal_1938-1939.png" },
        championships: [
            { name: "Copa 1102", result: "United Andres x - X 0", note: "-" }
        ],
        runnerUps: [],
        thirdPlaces: []
    },
    {
        id: "Inter_Gerrard",
        name: "Inter Gerrard",
        logo: "eFotball league/Escudo_de_Atlético_Municipal_(luego,_Atlético_Nacional),_1947-1950.png",
        description: "Rara vez se clasifica, pero cuando lo hace tiembla el torneo, en su primera participacion llego a la final y la perdio.",
        rival: { name: "N/A", history: "Jugados: 0 | Ganados: 0" },
        championships: [],
        runnerUps: [
            { name: "Copa 1102", result: "Inter Gerrard 0 - 2 FC Domo ", note: "Penal al centro en semis" }
        ],
        thirdPlaces: []
    },
    {
        id: "america_de_huertas",
        name: "America de Huertas",
        logo: "eFotball league/america-de-cali-adc-escudo-80s-logo-png_seeklogo-366705-removebg-preview.png",
        description: "Siempre dificil, nunca se sabe si juega o no, si no fuera por eso seria de los mas laureados del torneo.",
        rival: { name: "N/A", history: "Jugados: 0 | Ganados: 0" },
        championships: [],
        runnerUps: [],
        thirdPlaces: []
    },
    {
        id: "Cristian_FC",
        name: "Cristian FC",
        logo: "eFotball league/Escudo_Club_Deportivo_Municipal_1938-1939.png",
        description: "El mas campeon, lleno de historia, sin embargo AC Cagua lo tiene de hijo.",
        rival: { name: "United Andres", history: "Jugados: 0 | Ganados: 0 | Perdidos: 0", logo: "eFotball league/png-transparent-red-logo-icon-old-trafford-manchester-united-f-c-premier-league-logo-decal-paper-cut-doll-miscellaneous-text-sport-thumbnail-removebg-preview.png" },
        championships: [
            { name: "Copa 1102", result: "Cristian FC x - X 0", note: "-" },
            { name: "Copa 1102", result: "Cristian FC x - X 0", note: "-" },
            { name: "Copa 1102", result: "Cristian FC x - X 0", note: "-" },
        ],
        runnerUps: [
            { name: "Copa 1102", result: "Cristian FC 1 - 2 AC Cagua", note: "Batacazo" }
        ],
        thirdPlaces: []
    },
    {
        id: "AC_cagua",
        name: "AC Cagua",
        logo: "eFotball league/escudos_j39o-removebg-preview.png",
        description: "Equipo de culto, siempre da la cara, tecnico y dificil, si tuviera buenos patrocinadores seria otro equipo.",
        rival: { name: "N/A", history: "Jugados: 0 | Ganados: 0" },
        championships: [
            { name: "Copa 1102", result: "AC Cagua 2 - 1 Cristian FC", note: "-" }
        ],
        runnerUps: [
            { name: "Copa 1102", result: "AC Cagua 1 - 2 Alianza Meneses", note: "-" }
        ],
        thirdPlaces: []
    },
    {
        id: "Alianza_Meneses",
        name: "Alianza Meneses",
        logo: "eFotball league/images-removebg-preview.png",
        description: "El jogo bonito hecho equipo, vistozo y divertido de ver, siempre es favorito.",
        rival: { name: "FC Domo", history: "Jugados: 0 | Ganados: 0 | Perdidos: 0", logo: "eFotball league/FC_Barcelona_old_logo.png" },
        championships: [
            { name: "Copa 1102", result: "Alianza Meneses 2 - 1 AC Cagua ", note: "Penal al centro en semis" },
            { name: "Copa 1102", result: "Alianza Meneses x - 0 X ", note: "-" }
        ],
        runnerUps: [],
        thirdPlaces: []
    },
];
