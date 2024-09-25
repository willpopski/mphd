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
      // const carousel = document.getElementById('carousel');

      imageUrls.forEach(url => {
        const slide = document.createElement('div');
        slide.classList.add('swiper-slide');

        const link = document.createElement('a');
        link.href = url;

        const img = document.createElement('img');
        img.setAttribute('loading', 'lazy');
        img.setAttribute('src', url);
        img.alt = 'Carousel Image';

        // Lazy Load Preloader
        const preloader = document.createElement('div');
        preloader.classList.add('swiper-lazy-preloader');

        link.appendChild(img);
        // slide.appendChild(link);
        // slide.appendChild(preloader);
        // carousel.appendChild(slide);
        body.appendChild(link);
      });

      // Initialize Swiper
      // const swiper = new Swiper('.swiper-container', {
      //   loop: true,
      //   lazyPreloadPrevNext: 1, // Number of slides to preload on either side of the active slide
      //   navigation: {
      //     nextEl: '.swiper-button-next',
      //     prevEl: '.swiper-button-prev',
      //   },
      //   breakpoints: {
      //     640: {
      //       slidesPerView: 1,
      //       spaceBetween: 10,
      //     },
      //     768: {
      //       slidesPerView: 2,
      //       spaceBetween: 20,
      //     },
      //     1024: {
      //       slidesPerView: 3,
      //       spaceBetween: 30,
      //     },
      //   },
      // });

      // // Since slides are added dynamically, update Swiper
      // swiper.update();
    })
    .catch(error => {
      console.error('Error loading images:', error);
      const errorMessage = document.createElement('p');
      errorMessage.textContent = 'Failed to load images. Please try again later.';
      errorMessage.style.color = 'red';
      document.body.appendChild(errorMessage);
    });
});
