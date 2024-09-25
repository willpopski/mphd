// ./scripts.js

document.addEventListener('DOMContentLoaded', () => {
    fetch('images.json')
      .then(response => response.json())
      .then(imageUrls => {
        const carousel = document.getElementById('carousel');
  
        imageUrls.forEach(url => {
          const slide = document.createElement('div');
          slide.classList.add('swiper-slide');
  
          const link = document.createElement('a');
          link.href = url;
          link.download = ''; // This attribute suggests downloading
  
          const img = document.createElement('img');
          img.dataset.src = url; // For lazy loading
          img.alt = 'Carousel Image';
          img.classList.add('swiper-lazy');
  
          // Lazy Load Preloader
          const preloader = document.createElement('div');
          preloader.classList.add('swiper-lazy-preloader');
  
          link.appendChild(img);
          slide.appendChild(link);
          slide.appendChild(preloader);
          carousel.appendChild(slide);
        });
  
        // Initialize Swiper
        const swiper = new Swiper('.swiper-container', {
          loop: true,
          lazy: {
            loadPrevNext: true,
          },
          pagination: {
            el: '.swiper-pagination',
            clickable: true,
          },
          navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          },
          breakpoints: {
            640: {
              slidesPerView: 1,
              spaceBetween: 10,
            },
            768: {
              slidesPerView: 2,
              spaceBetween: 20,
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 30,
            },
          },
        });
      })
      .catch(error => console.error('Error loading images:', error));
  });
  