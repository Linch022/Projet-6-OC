document.querySelector('#portfolio .admin-works-button').addEventListener("click", () => {
    displayModal();
})

function displayModal() {
    const modal = document.getElementById("modal-gallery-container");
    const overlay = document.getElementById("modal-overlay");
    const galleryModal = document.querySelector("#modal-gallery-container .modal-gallery");
    modal.classList.add("modal-open");
    overlay.classList.add("modal-open")
    modal.ariaHidden = false;
    for (i = 0 ; i < worksData.length; i++) {
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