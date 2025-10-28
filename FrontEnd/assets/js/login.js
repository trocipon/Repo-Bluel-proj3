const url = "http://localhost:5678/api/users/login"; 

const form = {
  email: document.querySelector("#email"),
  password: document.querySelector("#password"),
  valid: document.querySelector("#valid")
};
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/; 

// Envoi des informations saisies par l'utilisateur à l'API
async function userLogin(email, password) {                   
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,
      password: password,
    }),
  });
  return response.json();
}

// Event de vérification des <input> (email et password) transmis à l'API
form.valid.addEventListener("click", (e) => {
  e.preventDefault();                                                   // Désactivation du comportement par défaut du navigateur
  if (!email.checkValidity() && !emailRegex.test(email.value)) {
    alert("Veuillez entrer une adresse e-mail valide")
  }if (!password.checkValidity() && !passwordRegex.test(password.value)) {
    alert("Veuillez entrer un mot de passe valide");
  } else {
    // Appel function (userLogin)
    userLogin(form.email.value, form.password.value)
    .then((data) => {
      if (!data.userId) {
        alert("Erreur dans l'identifiant ou le mot de passe");
      } else {
        // Generation du token + stockage dans le localStorage
        localStorage.setItem("token", data.token)
        // Retour sur la page principal du portfolio
        window.location.href = "index.html";
      }
    
    })
    .catch((error) => {
      console.error("Error:", error);
    });
  }   
});
