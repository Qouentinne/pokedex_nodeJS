const restify = require('restify');
const corsMiddleware = require('restify-cors-middleware2');
const server = restify.createServer();
const fs = require('fs');

const cors = corsMiddleware({
    origins: ['*'], // Allow all origins
    allowHeaders: ['X-App-Version'],
    exposeHeaders: []
  });

server.pre(cors.preflight);
server.use(cors.actual);
server.use(restify.plugins.queryParser());


const base_img_url = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';

function getPokemonData() {
    const payload = JSON.parse(fs.readFileSync('./pokemon_data.json'));
    const pokemon_data = payload.pokemons;
    return pokemon_data
}

function getAllPokemonsSummary() {
    let pokemons = {amount: 0, data : []};
    const pokemon_data = getPokemonData()
    for (const pkmn in pokemon_data) {
        const pkmn_data = {
            name: pkmn,
            id: pokemon_data[pkmn].id,
            img_url: base_img_url + pokemon_data[pkmn].id + '.png'
        }
        pokemons.data.push(pkmn_data);
    }
    pokemons.amount = pokemons.data.length;

    return pokemons
}

function apiGetAllSummary(req, res, next) {
    res.send(getAllPokemonsSummary());
}

function apiGetPokemonsSummary(req, res, next) {
    const {page, limit} = req.query
    pokemons = getAllPokemonsSummary()
    pokemons.data=pokemons.data.slice((page - 1)*limit, (page*limit)-1)
    pokemons.amount = pokemons.data.length   
}

function apiGetByID(req, res, next) {
    const pokemon_data = getPokemonData()
    const id = req.params.id;
    const pokemonArray = Object.values(pokemon_data);
    pkmn = pokemonArray.filter(pkmn => pkmn.id == id);
    if (pkmn.length == 0) {
        res.send(404, {message: "Pokemon not found"});
    } else {
        res.send(pkmn[0]);
    }
}

server.get('/pokemons', apiGetAllSummary)
server.get('/pokemon/:id', apiGetByID)


server.listen(5638, function () {
    console.log("server is listening on port 5638");
});


