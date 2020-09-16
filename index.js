require('dotenv').config()
const express = require("express")
const app = express()
const PORT = process.env.PORT || 3001;
const SpotifyWebApi = require('spotify-web-api-node');

app.use(express.static('public'))
app.set("view engine", "ejs")

app.listen(PORT, () => {
    console.log("server listening at http://localhost:3001")
})

//hiding api key with denenv
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
});

//access token
spotifyApi
    .clientCredentialsGrant()
    .then(data => spotifyApi.setAccessToken(data.body['access_token']))
    .catch(error => console.log('Something went wrong when retrieving an access token', error));


//routes
app.get("/", (req, res) => {
    res.status(200).render("index")
})
app.get("/artist-search", (req, res) => {
    spotifyApi
        .searchArtists(req.query.search)
        .then(data => {
            const spotifyData = data.body.artists.items;
            console.log('The received data from the API: ', spotifyData);

            //test json data
            // res.json(data.body)

            //show results
            res.render("artist-results", { spotifyData });
        })
        .catch(err => console.log('The error while searching artists occurred: ', err));
})

app.get('/albums/:artistId', (req, res, next) => {
    spotifyApi
        .getArtistAlbums(req.params.artistId)
        .then(function (data) {
            const albumList = data.body.items
            res.render('albums', { albumList });
        }, function (err) {
            console.error(err);
        });
});

app.get('/tracks/:trackId', (req, res, next) => {
    spotifyApi
        .getAlbumTracks(req.params.trackId)
        .then(function (data) {
            const trackList = data.body.items;
            res.render("tracks", { trackList })
        }, function (err) {
            console.error(err);
        });
});


app.use((req, res) => {
    res.status(404)
    res.sendFile("./views/404.ejs")
})