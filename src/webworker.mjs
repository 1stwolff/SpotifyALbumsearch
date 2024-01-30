const workerCode = `
onmessage = function (e) {
  const { type, payload } = e.data;

  if (type === 'addToPlaylist') {
    
    const result = simulateTimeConsumingTask(payload);
    postMessage(result);
  }
};

function simulateTimeConsumingTask(payload) {
  
 
  const details = fetchAlbumDetails(payload);
  return { ...payload, details };
}

function fetchAlbumDetails(album) {
  
  return { details: 'Sample details' };
}
`;

const blob = new Blob([workerCode], { type: 'application/javascript' });
const worker = new Worker(URL.createObjectURL(blob));

export default worker;
