
const API_URL_RANDOM = 'https://api.thedogapi.com/v1/images/search?limit=10';
const API_URL_FAVORITES = 'https://api.thedogapi.com/v1/favourites';
const API_URL_UPLOAD = 'https://api.thedogapi.com/v1/images/upload'
const API_KEY = 'live_QE0tGmVqoD8nlkTaJ3ogpizspfY8kXNMaf1s5LBSEwBnwfKVGfd2lfcXk10JLEBZ'

const api = axios.create({
  baseURL: 'https://api.thedogapi.com/v1',
});
api.defaults.headers.common['x-api-key'] = API_KEY;

const containerRandom = document.querySelector('#container-random');
const containerFavorites = document.querySelector('#container-favorites');
const buttonRandom = document.querySelector('.button-random-image');
const buttonUpload = document.getElementById('btn-uploading');
const spanError = document.getElementById('error');
buttonRandom.addEventListener('click', loadRandomImages);
buttonUpload.addEventListener('click', uploadImage);


// Funcion para hacer peticion a la API y convertir la respuesta en un archivo JSON
// tambien renderiza las imagenes que queramos mostrar
async function loadRandomImages() {
  const {data, status} = await api.get('/images/search?limit=10');
  const imagesToShow = 3;
  
  // Vamos a comprobar que no haya error en la peticion
  if (status !== 200) {
    spanError.innerText = 'Hubo un error';
  } else {
    // Con este metodo map vamos a crear el codigo HTML para cada imagen ya con su URL y la pondremos en un 
    //arreglo, despues con slice y join elegimos solo las imagenes que queramos y las volvemos un string
    let view = data.map(item => {
      return `<div><article>
      <img class="random-image" src="${item.url}" alt="Imagent aleatoria de un gatito">
      </article>
      <button class="button-add-favorites">Agregar a favoritos</button></div>`
      }).slice(0, imagesToShow).join('');

    //Metemos el codigo HTML dentro del contener que va a tener las imagenes
    containerRandom.innerHTML = view;
    
    const addFavorite = document.querySelectorAll('.button-add-favorites');
    addFavorite.forEach((item, index) => item.addEventListener('click', () => addImageToFavorites(data[index].id)))
  }
};

async function loadFavoriteImages() {
  const {data, status} = await api.get('/favourites');

  if (status !== 200) {
    // const data = await response.text();
    spanError.innerText = `Hubo un error ${status}: ${data}`;
  } else {
    let view = data.map(item => {
      return `<div><article>
      <img class="random-image" src="${item.image.url}" alt="Imagent aleatoria de un gatito">
      </article>
      <button class="button-remove-favorite">Quitar de favoritos</button></div>`
      }).slice(-3).join('');
    containerFavorites.innerHTML = view;
    
    //LOS FAVORITOS SE AGREGAN DEL LADO IZQUIERDO, HAY QUE TRATAR QUE SE AGREGUEN DEL LADO DERECHO, SE PUEDE
    //HACER USANDO EL METODO MAP EN LUGAR DE DATA EN UN ARRAY CON LOS ULTIMOS TRES FAVORITOS VOLTEADOS

    const buttonDelete = document.querySelectorAll('.button-remove-favorite');
    const lastThreeFavorites = Array.from(data).slice(-3);
    buttonDelete.forEach((item, index) => item.addEventListener('click', () => {
      deleteImage(lastThreeFavorites[index].id)
    }));
  }
}

async function addImageToFavorites(id) {
  const favorites = await fetchFavorites();
  if (favorites.some(item => item.image_id === id)) {
    return alert('Ya existe');
  };

  const {data, status} = await api.post('/favourites', {
    image_id: id,
  });


  if (status !== 200) {
    spanError.innerText = `Hubo un error ${status}: ${data}`;
  } else {
    console.log(data);
    loadFavoriteImages();
  }
}

async function deleteImage(id) {
  const response = await api.delete(`/favourites/${id}`);

  loadFavoriteImages();
}

async function uploadImage() {
  const form = document.getElementById('uploadingForm');
  const formData = new FormData(form);
  
  console.log(formData.get('file'));
  
  // const response = await fetch(API_URL_UPLOAD, {
  //   method: 'POST',
  //   headers: {
  //     'x-api-key': API_KEY,
  //   },
  //   body: formData,
  // })
  // const data = await response.json();
  const {data, status} = await api.post('/images/upload', formData);

  const id = await data.id;
  addImageToFavorites(id);
  getMyUploads();
  
}


async function getMyUploads() {
  const {data, status} = await api.get('/images?limit=10')
  console.log(data)

  if (status !== 200) {
    spanError.innerText = `Hubo un error ${status}: ${data}`;
  }
}

async function fetchFavorites() {
  const {data, status} = await api.get('/favourites')

  return data;
}

async function deleteUp(id) {
  const {data, status} = await api.delete(`/images/${id}`)
}
loadRandomImages();
loadFavoriteImages();