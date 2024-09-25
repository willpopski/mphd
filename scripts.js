// ./scripts.js

document.addEventListener('DOMContentLoaded', () => {
  fetch('images.json')
    .then(response => {
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
      }
      return response.json();
    })
    .then(imageUrls => {
      if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
        throw new Error('images.json is not a valid array or is empty.');
      }
      const body = document.getElementById('body');

      imageUrls.forEach(url => {
        const link = document.createElement('a');
        link.href = url;

        const img = document.createElement('img');
        img.setAttribute('loading', 'lazy');
        img.setAttribute('src', url);
        img.alt = 'Wallpaper Image';

        link.appendChild(img);
        body.appendChild(link);
      });

    })
    .catch(error => {
      console.error('Error loading images:', error);
      const errorMessage = document.createElement('p');
      errorMessage.textContent = 'Failed to load images. Please try again later.' + error.message;
      errorMessage.style.color = 'red';
      document.body.appendChild(errorMessage);
    });
});
