import * as Notiflix from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";


const form = document.querySelector(".search-form");
const gallery = document.querySelector(".gallery");
const loadMoreBtn = document.querySelector(".load-more-button")

function getRandomHexColor() {
  return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, 0)}`;
}


let page = 1;
let searchIMG = "";

form.addEventListener("submit", handleSubmit);

async function handleSubmit(event){
  event.preventDefault();

  form.style.backgroundColor = getRandomHexColor();
  const formData= new FormData(event.currentTarget);
  searchIMG = formData.get("searchQuery").trim(); //gets data from the proper name, and formats the entered value;
  page = 1;
  if (searchIMG === ""){
    return Notiflix.Notify.failure("The search bar cannot be empty.");
  }

  await fetchImages();
};

var lightbox = new SimpleLightbox('.gallery a', { 
  captionsData: "alt",
  captionPosition: "bottom",
  captionDelay: 250
});

loadMoreBtn.addEventListener ("click", handleClick);
async function handleClick(event) {
    page +=1
    Notiflix.Notify.info("Added 40 more results. Take a look!");
    await fetchImages();
}

async function fetchImages() {
    const BASE_URL = "https://pixabay.com/api";
    const API_KEY = "40968906-c17bbb7f7323ac5f27427753d";
    
    const params = new URLSearchParams({
      key: API_KEY,
      q: searchIMG,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      per_page: 40,
      page: page,
    });
    
    
    const URL = `${BASE_URL}/?${params}`;

    try {
        const resp = await fetch(URL);
        const data = await resp.json();

        if (data.hits.length === 0) {
            Notiflix.Notify.failure("Sorry, there are no images matching your search query. Please try again.");
        } 
        else {
          createImgsMarkUp(data.hits);
          if (page === 1 && data.hits.length > 1){
            Notiflix.Notify.success(`"Hooray! We found ${data.totalHits} images."`)
          }
          else{
            Notiflix.Notify.success(`"Hooray! We found ${data.totalHits} image."`)
          };
          

          if (data.totalHits <= page * 40) {
            loadMoreBtn.style.display = 'none';
            Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
          } 
          else{
            loadMoreBtn.style.display = 'block';
          }
          lightbox.refresh();
        }
      } catch (error) {
        Notiflix.Notify.failure("An unexpected error occurred, please try again.");
      }
    };


function createImgsMarkUp(images) {
      const results = images.map(image => 
        `
        <div class="photo-card">
          <a href="${image.largeImageURL}">
            <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
          </a>
          <div class="info">
            <p class="info-item"><b>Likes:</b> ${image.likes}</p>
            <p class="info-item"><b>Views:</b> ${image.views}</p>
            <p class="info-item"><b>Comments:</b> ${image.comments}</p>
            <p class="info-item"><b>Downloads:</b> ${image.downloads}</p>
          </div>
        </div>
      `).join('');

      if (page === 1) {
        gallery.innerHTML = results;
      } else {
        gallery.innerHTML += results; }
        lightbox.refresh();
};



