const workerCode = `
onmessage = function (e) {
  const { type, payload } = e.data;

  if (type === 'addToPlaylist') {
    // Simulate a time-consuming task (replace with actual logic)
    const result = simulateTimeConsumingTask(payload);
    postMessage(result);
  }
};

function simulateTimeConsumingTask(payload) {
  // Simulate a time-consuming task (replace with actual logic)
  // For example, fetching additional details for the album
  const details = fetchAlbumDetails(payload);
  return { ...payload, details };
}

function fetchAlbumDetails(album) {
  // Simulate fetching album details (replace with actual API call)
  return { details: 'Sample details' };
}
`;

const blob = new Blob([workerCode], { type: 'application/javascript' });
const worker = new Worker(URL.createObjectURL(blob));

export default worker;
