const WORKSAPI = "http://localhost:5678/api/works";
const CATEGORIESAPI = "http://localhost:5678/api/categories";
let userToken = window.sessionStorage.getItem("token");
const adminOption = document.querySelectorAll(".admin-option");
let inputs = [];
const photoInput = document.getElementById("photo-input");
let worksData = [];
let categoriesData = [];

// Variable qui contient un objet Set qui permettra de filter les Works
const filters = new Set();

// Fonction de Fetch pour les appels API avec une méthode de base en GET et la possibilité de passer les autres méthodes en paramètre
async function fetchData(url, method, headers, body) {
  try {
    const options = {
      method,
      headers,
    };
    if (body) {
      options.body = body;
    }
    const response = await fetch(url, options);
    if (!response.ok) {
      console.error(`Erreur HTTP : ${response.status} ${response.statusText}`);
      return null;
    }
    try {
      const data = await response.json();
      return data;
    } catch (error) {
      return response;
    }
  } catch (error) {
    console.error("Une erreur s'est produite :", error);
    throw error;
  }
}

//Permet de vérifier si un utilisateur est connecté au lancement de la page
function isLog() {
  if (userToken) {
    adminOption.forEach((e) => e.classList.add("admin-mode"));
  }
}
isLog();

// Permet de déconnecter l'utilisateur au clique sur le bouton logout
document.getElementById("logout-button").addEventListener("click", () => {
  window.sessionStorage.removeItem("token");
  userToken = null;
  adminOption.forEach((e) => e.classList.remove("admin-mode"));
});

// Fonction qui permet de créer un filtres
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

// Fonction appelée avec l'event listener sur les filtres pour filtrer la gallerie
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

// Récupères les données de l'api catégories puis lance la fonction pour créer un filtre
async function displayCategories() {
  const baseFilter = { name: "Tous", id: 0 };
  createFilter(baseFilter);
  categoriesData.map((item) => {
    createFilter(item);
  });
}

//Fonction permettant l'injection des works dans le html
function displayGallery() {
  // Boucle pour la création des items dans la galerie
  for (let i = 0; i < worksData.length; i++) {
    const element = document.querySelector(
      `.gallery [data-workID="${worksData[i].id}"]`
    );
    if (filters.has(worksData[i].categoryId)) {
      element ? null : createGalleryElement(worksData[i]);
    } else {
      element ? element.remove() : null;
    }
  }
}
// Création d'un élément pour la galerie
function createGalleryElement(data) {
  const galleryContainer = document.querySelector("#portfolio .gallery");

  const figure = document.createElement("figure");
  const img = document.createElement("img");
  const figCaption = document.createElement("figcaption");

  img.src = data.imageUrl;
  img.alt = data.title;
  figCaption.textContent = data.title;
  figure.setAttribute("data-workID", data.id);
  figure.appendChild(img);
  figure.appendChild(figCaption);
  galleryContainer.appendChild(figure);
}

// Lance les fonctions d'appel à l'api puis d'affichage des éléments de la gallerie
async function initGallery() {
  categoriesData = await fetchData(CATEGORIESAPI);
  worksData = await fetchData(WORKSAPI);
  displayCategories();
  displayGallery();
}
initGallery();

// EventListener pour lancer la fonction d'affichage de la modale
document
  .querySelector("#portfolio .admin-works-button")
  .addEventListener("click", () => {
    displayModal();
  });

//Fonction permettant l'affichage de la modale
function displayModal() {
  const modal = document.getElementById("modal");
  const galleryModal = document.querySelector(
    "#modal-gallery-container .modal-gallery"
  );
  modal.classList.add("modal-open");
  document.getElementById("modal-overlay").classList.add("modal-open");
  modal.ariaHidden = false;
  // Boucle pour la création des items dans la gallerie
  for (let i = 0; i < worksData.length; i++) {
    const element = document.querySelector(
      `#modal [data-workID="${worksData[i].id}"]`
    );
    element ? null : createElementModal(worksData[i]);
  }
  // Boucle pour la création des éléments de l'input select
  const isCreate = document.querySelector("#photo-category option");
  if (isCreate === null) {
    const select = document.createElement("select");
    select.id = "photo-category";
    select.setAttribute("name", "categories");
    select.classList.add("upload-inputs");
    select.required = true;
    for (let j = 0; j < categoriesData.length; j++) {
      const option = document.createElement("option");
      option.value = categoriesData[j].name;
      option.textContent = categoriesData[j].name;
      option.setAttribute("data-id", categoriesData[j].id);
      select.appendChild(option);
    }
    const label = document.getElementById("categories-label");
    label.setAttribute("for", "photo-category");
    label.appendChild(select);
    inputs = document.querySelectorAll(".upload-inputs");
    inputs.forEach((e) => {
      e.addEventListener("change", checkInputs);
    });
  }
}
// Création d'un élément pour la galerie de la modale
function createElementModal(data) {
  const galleryModal = document.querySelector(
    "#modal-gallery-container .modal-gallery"
  );
  const figure = document.createElement("figure");
  const img = document.createElement("img");
  const button = document.createElement("button");
  const icone = document.createElement("i");
  icone.classList.add("fa-solid", "fa-trash-can");
  figure.setAttribute("data-workID", data.id);
  button.setAttribute("title", `Supprimer le projet : ${data.title}`);
  // Event Listener sur la poubelle qui permet de supprimer un Works
  button.addEventListener("click", () => {
    fetchData(`${WORKSAPI}/${data.id}`, "DELETE", {
      Authorization: `Bearer ${userToken}`,
      "Content-Type": "application/json",
    });
    worksData = worksData.filter((work) => work.id !== data.id);
    const attribut = document.querySelectorAll(`[data-workID="${data.id}"`);

    attribut.forEach((element) => element.remove());
  });
  img.src = data.imageUrl;
  button.appendChild(icone);
  figure.appendChild(button);
  figure.appendChild(img);
  galleryModal.appendChild(figure);
}

// Permet de vérifier si l'image uploadée dans le formulaire est conforme puis ajoute une miniature
photoInput.addEventListener("change", (e) => {
  // const preview = document.getElementById("image-preview");
  const preview = document.createElement("img");
  preview.id = "image-preview";
  preview.alt = "Aperçu de l'image ajoutée";
  const file = e.target.files[0];
  const maxSize = 4 * 1024 * 1024;
  const filesTypes = ["image/jpeg", "image/png"];

  if (filesTypes.includes(file.type) && file.size < maxSize) {
    const imageURL = URL.createObjectURL(file);
    preview.src = imageURL;
    preview.classList.add("image-loaded");
    document
      .getElementById("photo-upload-button")
      .classList.add("image-loaded");
    document.querySelector(".photo-upload-container").appendChild(preview);
  } else {
    alert("L'image n'est pas du bon type ou trop grosse");
  }
});

// Permet de fermer la modale
document.querySelectorAll(".close-modal").forEach((e) => {
  e.addEventListener("click", () => {
    const modal = document.getElementById("modal");
    modal.ariaHidden = true;
    document.querySelectorAll(".modal-open").forEach((item) => {
      item.classList.remove("modal-open");
    });
  });
});

// Les events Listeners pour passer d'une modale à l'autre
document.getElementById("open-upload-modal").addEventListener("click", () => {
  document
    .getElementById("modal-gallery-container")
    .classList.add("upload-open");
  document.getElementById("modal-photo-upload").classList.add("upload-open");
});

document.getElementById("modal-back-btn").addEventListener("click", () => {
  document
    .getElementById("modal-gallery-container")
    .classList.remove("upload-open");
  document.getElementById("modal-photo-upload").classList.remove("upload-open");
});

// Permet de vérifier que les inputs soient bien remplis dans le formualaire puis d'enlever le disable du bouton submit
function checkInputs() {
  const allFilled = Array.from(inputs).every((input) => input.value);
  document.getElementById("submit-upload").disabled = !allFilled;
  if (document.querySelector(".add-status")) {
    document.querySelector(".add-status").classList.remove("add-status");
  }
}

// Envoi les données du formulaire au backend
document
  .getElementById("photo-upload-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", inputs[1].value);
    formData.append("image", inputs[0].files[0]);
    formData.append(
      "category",
      inputs[2].selectedOptions[0].getAttribute("data-id")
    );
    const result = await fetchData(
      WORKSAPI,
      "POST",
      {
        Authorization: `Bearer ${userToken}`,
      },
      formData
    );
    // Si l'envoi fonctionne relance l'affichage des galleries et affiche un message à l'utilisateur pour lui confirmer l'envoi
    if (result) {
      worksData.push(result);
      createGalleryElement(result);
      createElementModal(result);
      document.getElementById("add-success").classList.add("add-status");
      const preview = document.getElementById("image-preview");
      preview.src = "";
      preview.classList.remove("image-loaded");
      document
        .getElementById("photo-upload-button")
        .classList.remove("image-loaded");
      inputs.forEach((item) => {
        item.value = "";
      });
    } else {
      // Affiche un message à l'utilisateur si l'envoi ne fonctionne pas
      document.getElementById("add-echec").classList.add("add-status");
    }
  });
