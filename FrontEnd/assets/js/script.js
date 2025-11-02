const url = "http://localhost:5678/api";
const editionBanner = document.getElementById("edition-banner");
const modalButton = document.getElementById("portfolio-edit");
const logout = document.getElementById("login");
const portfolioTitle = document.getElementById("portfolio-title");
const filterZone = document.getElementById("categories-picture");
const token = localStorage.getItem("token");

const modal = document.getElementById("modal");
const openModalButton = document.getElementById("portfolio-edit");
const closeModalButton = modal.querySelectorAll(".fa-xmark");
const backToModalStep1 = modal.querySelectorAll(".fa-arrow-left");
const modalStep1 = modal.querySelector(".step-1");
const goToModalStep2 = document.getElementById("go-to-add-picture");
const modalStep2 = modal.querySelector(".step-2");
let uploadInput = document.getElementById("add-picture-input");
const previewContainer = document.getElementById("preview-container");
const initialPreviewHTML = previewContainer.innerHTML;
const newWorkForm = document.querySelector(".newWork-form");
const newWorkTitle = document.getElementById("newWorkTitle");
const newWorkCategory = document.getElementById("newWorkCategory");
const validateModalStep2 = document.getElementById("validateNewWork");

/***************************************************************/
// INDEX

// Obtenir les catégories depuis l'API
async function getCategories() {
  try {
    const response = await fetch(`${url}/categories`);
    const data = await response.json();

    const filters = document.getElementById("categories-picture");

    // Bouton "Tous"
    const all = document.createElement("button");
    all.value = 0;
    all.innerText = "Tous";
    all.className = "filter-button pointer";
    filters.appendChild(all);

    // Boutons de catégorie
    data.forEach((item) => {
      const category = document.createElement("button");
      category.value = item.id;
      category.innerText = item.name;
      category.className = "filter-button pointer";
      filters.appendChild(category);
    });

    // Écouteur de clic sur les boutons de filtres
    filters.addEventListener("click", async function (e) {
      if (e.target.tagName === "BUTTON") {
        const categoryId = parseInt(e.target.value);
        await getWorks(categoryId);
      }
    });
  } catch (error) {
    console.log(error);
  }
}

// Afficher les travaux de l'API dans la galerie
async function getWorks(categoryId = 0) {
  try {
    const response = await fetch(`${url}/works`);
    const data = await response.json();

    const gallery = document.querySelector(".gallery");
    gallery.innerHTML = "";

    let filterData;
    if (categoryId === 0) {
      filterData = data;
    } else {
      filterData = data.filter((work) => work.category.id === categoryId);
    }

    filterData.forEach((item) => {
      const figure = document.createElement("figure");
      const img = document.createElement("img");
      img.src = item.imageUrl;
      img.alt = item.title;
      const figcaption = document.createElement("figcaption");
      figcaption.innerText = item.title;

      figure.appendChild(img);
      figure.appendChild(figcaption);
      gallery.appendChild(figure);
    });
  } catch (error) {
    console.log(error);
  }
}

// MODAL

// Fermer la modale
function closeModal() {
  modal.close();
  modal.style.display = "none";
  showStep1();
  resetUpload();
}

// Réinitialiser la modale
function resetModal() {
  newWorkTitle.value = "";
  newWorkCategory.innerHTML = "";
  validateModalStep2.disabled = true;
  validateModalStep2.classList.remove("pointer", "hover");
  validateModalStep2.classList.add("disabled");
}

// Naviguer dans la modale (step1 <-> step2)
function showStep1() {
  modalStep1.style.display = "flex";
  modalStep2.style.display = "none";
}
function showStep2() {
  modalStep1.style.display = "none";
  modalStep2.style.display = "flex";
}

// Afficher la galerie photo dans la modale (step 1)
async function displayWorksForModal(categoryId = 0) {
  try {
    const response = await fetch(`${url}/works`);
    const data = await response.json();
    let filterData =
      categoryId === 0
        ? data
        : data.filter((work) => work.category.id === categoryId);
    const modalGallery = modal.querySelector(".gallery");

    modalGallery.innerHTML = "";

    filterData.forEach((item) => {
      const figure = document.createElement("figure");
      figure.id = "figure-modal";

      const img = document.createElement("img");
      img.src = item.imageUrl;
      img.alt = item.title;
      img.id = "img-modal";

      const deleteContainer = document.createElement("div");
      deleteContainer.id = "trashContainer";

      const trashIcon = document.createElement("i");
      trashIcon.className = "fa-solid fa-trash-can pointer";
      deleteContainer.appendChild(trashIcon);

      deleteContainer.addEventListener("click", async (e) => {
        e.stopPropagation();
        const deleteResponse = await fetch(`${url}/works/${item.id}`, {
          method: "DELETE",
          headers: {
            Authorization: "Bearer " + token,
            Accept: "application/json",
          },
        });
        if (deleteResponse.ok) {
          figure.remove();
          await getCategories();
          await getWorks();
          await displayWorksForModal();
        } else {
          alert("Erreur");
        }
      });
      figure.appendChild(img);
      figure.appendChild(deleteContainer);
      modalGallery.appendChild(figure);
    });
  } catch (error) {
    console.log(error);
  }
}

// Vérifier et afficher le preview photo
function uploadInputChangeHandler() {
  const file = uploadInput.files[0];
  if (file) {
    const maxSize = 4 * 1024 * 1024;
    const allowedTypes = ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      alert("Format du fichier invalide");
      resetUpload();
      return;
    } else if (file.size > maxSize) {
      alert("Le fichier est trop lourd");
      resetUpload();
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      previewContainer.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
    };
    reader.readAsDataURL(file);
    displayCategoriesForModal();
    checkValidation();
  } else {
    resetUpload();
  }
}

// Fonction : réinitialiser le chargeur photo
function resetUpload() {
  // Réinitialise le previewContainer et le bouton valider
  previewContainer.innerHTML = initialPreviewHTML;
  validateModalStep2.disabled = true;
  validateModalStep2.classList.add("disabled");
  validateModalStep2.classList.remove("pointer", "hover");
  // Resélectionne le nouvel input + écouteurs
  uploadInput = document.getElementById("add-picture-input");
  uploadInput.addEventListener("change", uploadInputChangeHandler);
  uploadInput.addEventListener("change", checkValidation);
  // Reset le formulaire
  newWorkTitle.value = "";
  newWorkCategory.innerHTML = "";
  // Vérifie si le formulaire est valide
  checkValidation();
}

// Afficher les catégories (select/option) dans la modale (step 2)
async function displayCategoriesForModal() {
  try {
    const response = await fetch(`${url}/categories`);
    const data = await response.json();
    const select = document.getElementById("newWorkCategory");
    select.innerHTML = "";

    const emptyOption = document.createElement("option");
    emptyOption.value = "";
    emptyOption.textContent = "";
    emptyOption.selected = true;
    emptyOption.disabled = true;
    select.appendChild(emptyOption);

    data.forEach((item) => {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = item.name;
      select.appendChild(option);
    });
    checkValidation();
  } catch (error) {
    console.log(error);
  }
}

// Déverrouillage du bouton d'envoi de la modale
function checkValidation() {
  if (
    uploadInput.files.length > 0 &&
    newWorkTitle.value.trim() !== "" &&
    newWorkCategory.value !== ""
  ) {
    validateModalStep2.disabled = false;
    validateModalStep2.classList.add("pointer", "hover");
    validateModalStep2.classList.remove("disabled");
  } else {
    validateModalStep2.disabled = true;
    validateModalStep2.classList.remove("pointer", "hover");
    validateModalStep2.classList.add("disabled");
  }
}

// Envoyer nouvelle photo + infos vers l'API
async function uploadImage(file) {
  const formData = new FormData();
  formData.append("image", file);
  const response = await fetch(`${url}/works`, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
    },
    body: formData,
  });
  if (response.ok) {
    const data = await response.json();
    return data.imageUrl;
  } else {
    throw new Error(
      "Échec de l'opération, vous n'avez pas l'autorisation pour cette action."
    );
  }
}

/***************************************************************/
// Events

// Connexion/déconnexion
logout.addEventListener("click", () => {
  if (token) {
    localStorage.removeItem("token");
    location.href = "index.html";
  } else {
    location.href = "login.html";
  }
});

// Edition mode vs. user mode
if (token) {
  logout.textContent = "logout";
  logout.style.fontWeight = "normal";
  editionBanner.style.display = "flex";
  modalButton.style.display = "flex";
  portfolioTitle.style.marginBottom = "50px";
  filterZone.style.display = "none";
} else {
  logout.textContent = "login";
  logout.style.fontWeight = "normal";
}

// Redirection vers la page login (clic login/logout)
if (!token) {
  logout.addEventListener("click", () => {
    location.href = "login.html";
  });
}

// Ouverture de la modale
openModalButton.addEventListener("click", async () => {
  if (typeof modal.showModal === "function") {
    modal.showModal();
    modal.style.display = "flex";
    showStep1();
    await displayWorksForModal();
  }
});

// Fermeture de la modale (bouton)
closeModalButton.forEach((icon) => {
  icon.addEventListener("click", () => {
    closeModal();
    resetModal();
  });
});

// Fermeture de la modale (overlay)
modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeModal();
    resetModal();
  }
});

// Passage step1-->step2
goToModalStep2.addEventListener("click", () => {
  showStep2();
  validateModalStep2.disabled = true;
});

// Retour step2-->step1
backToModalStep1.forEach((icon) => {
  icon.addEventListener("click", () => {
    showStep1();
    resetUpload();
    resetModal();
  });
});

// Charge et affiche nouvelle photo dans la modale (step 2)
uploadInput.addEventListener("change", uploadInputChangeHandler);

// Change l'affichage du bouton de confirmation de la step 2 selon la saisie utilisateur
newWorkTitle.addEventListener("input", checkValidation);
newWorkCategory.addEventListener("change", checkValidation);

// Transmet les données de la modale à l'API + affichage
newWorkForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  validateModalStep2.disabled = true;

  const file = uploadInput.files[0];
  const title = document.getElementById("newWorkTitle").value.trim();
  const categoryId = document.getElementById("newWorkCategory").value;

  if (!file || !title || !categoryId) {
    alert("Remplir tous les champs et sélectionner une photo");
    return;
  }

  const formData = new FormData();
  formData.append("image", file);
  formData.append("title", title);
  formData.append("category", categoryId);

  try {
    const response = await fetch(`${url}/works`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (response.ok) {
      closeModal();
      resetModal();
      await getWorks();
      await displayWorksForModal();
    } else {
      const errorData = await response.json();
      alert(
        `Erreur lors de l'ajout : ${errorData.message || response.statusText}`
      );
    }
  } catch (error) {
    alert(`Erreur réseau : ${error.message}`);
  }
});

// Affichage des filtres et des travaux en page index
getCategories();
getWorks();
