const worksAPI = "http://localhost:5678/api/works";
const categoriesAPI = "http://localhost:5678/api/categories";
let userToken = window.sessionStorage.getItem("token");
const adminOption = document.querySelectorAll(".admin-option");
let worksData;
let categoriesData;

const filters = new Set();

async function fetchData(url) {
  const response = await fetch(url);
  return await response.json();
}

function isLog() {
  if (userToken) {
    adminOption.forEach((e) => e.classList.add("admin-mode"));
  }
}
isLog();

document.getElementById("logout-button").addEventListener("click", () => {
  window.sessionStorage.removeItem("token");
  userToken = null;
  adminOption.forEach((e) => e.classList.remove("admin-mode"));
});

async function displayCategories() {
  categoriesData = await fetchData(categoriesAPI);
  const baseFilter = { name: "Tous", id: 0 };
  createFilter(baseFilter);
  categoriesData.map((item) => {
    createFilter(item);
  });
  console.log(filters);
}

displayCategories();

function createFilter(filter) {
  filters.add(filter.id);
  const li = document.createElement("li");
  const button = document.createElement("button");
  button.textContent = filter.name;
  button.id = `categoryId-${filter.id}`;
  button.classList =
    filter.id === 0 ? "filter-button active-filter" : "filter-button";
  button.addEventListener("click", () => {
    changeFilter(button, filter.id);
  });
  li.appendChild(button);
  document.getElementById("filters-container").appendChild(li);
}

function changeFilter(button, filterId) {
  document
    .querySelector("#portfolio .active-filter")
    .classList.remove("active-filter");
  button.classList.add("active-filter");
  filters.clear();
  if (filterId === 0) {
    filters.add(0);
    categoriesData.forEach((item) => {
      filters.add(item.id);
    });
  } else {
    filters.add(filterId);
  }
  displayGallery();
}

//Fonction permettant l'injection des works dans le html
async function displayGallery() {
  const galleryContainer = document.querySelector("#portfolio .gallery");
  worksData = await fetchData(worksAPI);
  galleryContainer.replaceChildren();
  for (let i = 0; i < worksData.length; i++) {
    if (filters.has(worksData[i].categoryId)) {
      const imageUrl = worksData[i].imageUrl;
      const title = worksData[i].title;

      const figure = document.createElement("figure");
      const img = document.createElement("img");
      const figCaption = document.createElement("figcaption");

      img.src = imageUrl;
      img.alt = title;
      figCaption.textContent = title;

      figure.appendChild(img);
      figure.appendChild(figCaption);
      galleryContainer.appendChild(figure);
    }
  }
}
displayGallery();

document
  .querySelector("#portfolio .admin-works-button")
  .addEventListener("click", () => {
    displayModal();
  });

function displayModal() {
  const modal = document.getElementById("modal");
  const overlay = document.getElementById("modal-overlay");
  const galleryModal = document.querySelector(
    "#modal-gallery-container .modal-gallery"
  );
  modal.classList.add("modal-open");
  overlay.classList.add("modal-open");
  modal.ariaHidden = false;
  for (i = 0; i < worksData.length; i++) {
    const imageUrl = worksData[i].imageUrl;
    const figure = document.createElement("figure");
    const img = document.createElement("img");
    const icone = document.createElement("i");
    icone.classList.add("fa-solid", "fa-trash-can");
    img.src = imageUrl;
    figure.appendChild(icone);
    figure.appendChild(img);
    galleryModal.appendChild(figure);
  }
}

const photoInput = document.getElementById("photo-input");

photoInput.addEventListener("change", (e) => {
  console.log(e.target.files[0]);
  const preview = document.getElementById("image-preview");
  const file = e.target.files[0];

  if (file) {
    const imageURL = URL.createObjectURL(file);
    preview.src = imageURL;
    preview.classList.add("image-loaded");
    document
      .getElementById("photo-upload-button")
      .classList.add("image-loaded");
  }
});

document.querySelectorAll(".close-modal").forEach((element) => {
  element.addEventListener("click", () => {
    document.querySelectorAll(".modal-open").forEach((item) => {
      item.classList.remove("modal-open");
    });
  });
});

document.getElementById("open-upload-modal").addEventListener("click", () => {
  document.getElementById("modal-gallery-container").classList.add("upload-open");
  document.getElementById("modal-photo-upload").classList.add("upload-open");
});

document.getElementById("modal-back-btn").addEventListener("click", () => {
  document.getElementById("modal-gallery-container").classList.remove("upload-open");
  document.getElementById("modal-photo-upload").classList.remove("upload-open");
})