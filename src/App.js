import React, { useState, useEffect } from 'react';
import { Container, InputGroup, FormControl, Button, Row, Card } from 'react-bootstrap';
import worker from './webworker.mjs';

// hide my client secret and id for spotify setup in my .env hidden with .gitignore
const clientId = process.env.REACT_APP_CLIENT_ID;
const clientSecret = process.env.REACT_APP_CLIENT_SECRET;


// for my webworker
const playlistWorker = worker;

// set up my states 
function App() {
 const [searchInput, setSearchInput] = useState("");
 const [accessToken, setAccessToken] = useState("");
 const [albums, setAlbums] = useState([]);
 const [playlist, setPlaylist] = useState([]);

// fetch from spotify api accessToken
 useEffect(() => {
   var authParameters = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials&client_id=' + clientId + '&client_secret=' + clientSecret
  };
  


   fetch('https://accounts.spotify.com/api/token', authParameters)
     .then(result => result.json())
     .then(data => setAccessToken(data.access_token));
 }, []);


 // Handles messages from the web worker
 playlistWorker.onmessage = function (e) {
   const result = e.data;
   setPlaylist((prevPlaylist) => [...prevPlaylist, result]);
 };


 // Add album to the playlist using the web worker
 const addToPlaylist = (album) => {
   // Communicate with the web worker
   playlistWorker.postMessage({ type: 'addToPlaylist', payload: album });
 };


  // Search from spotify api
async function search() {
 console.log("Search for " + searchInput);


 var searchParameters = {
   method: 'GET',
   headers: {
     'Content-Type': 'application/json',
     'Authorization': 'Bearer ' + accessToken
   }
 };


 try {
   const [artistID] = await Promise.all([
     fetch('https://api.spotify.com/v1/search?q=' + searchInput + '&type=artist', searchParameters)
       .then(response => response.json())
       .then(data => data.artists.items[0]?.id)
   ]);


   console.log("Artist ID is " + artistID);


   if (artistID) {
     // Get request with Artist ID to grab all the albums from that artist
     const returnedAlbums = await fetch('https://api.spotify.com/v1/artists/' + artistID + '/albums' + '?include_groups=album&market=US&limit=50', searchParameters)
       .then(response => response.json())
       .then(data => {
         console.log(data);
         setAlbums(data.items);
       });
   }
 } catch (error) {
   console.error('Error during parallel API requests:', error);
 }
}



// user interface
 return (
   <div className="App">
     <Container>
       <InputGroup className="mb-3" size="lg">
         <FormControl
           id="searchInput"
           placeholder='Search for Artist'
           type="input"
           onKeyPress={event => {
             if (event.key === "Enter") {
               search();
             }
           }}
           onChange={event => setSearchInput(event.target.value)}
         />
         <Button onClick={search}>
           Search
         </Button>
       </InputGroup>
     </Container>
     {/* My albums go here */}
     <Container>
       <Row xs={1} sm={2} md={3} lg={4} className='mx-2'>
         {albums.map((album, i) => (
           <Card key={i} style={{ backgroundColor: 'green' }}>
             <Card.Img src={album.images[0]?.url} />
             <Card.Body>
               <Card.Title>{album.name}</Card.Title>
               <Button onClick={() => addToPlaylist(album)}>Add to Playlist</Button>
             </Card.Body>
           </Card>
         ))}
       </Row>
     </Container>
     {/* playlits */}
     <Container>
       <h2>Playlist</h2>
       <ul>
         {playlist.map((item, index) => (
           <li key={index}>{item.name} - {item.details && item.details.details ? item.details.details : 'No details'}</li>
         ))}
       </ul>
     </Container>
   </div>
 );
}


export default App;
