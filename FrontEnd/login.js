const logsInput = {
  email: document.getElementById("email"),
  password: document.getElementById("password"),
};
const textLogin = document.getElementById("login-text-error");
let userToken = window.sessionStorage.getItem("token");

// Renvoi l'utilisateur à l'accueil si il est déjà connecté
if (userToken) {
  window.location.href = "index.html";
}

// Test les logs rentrés par l'utilisateur et le connecte si il possède un compte
async function testLogin(user) {
  try {
    const response = await fetch("http://localhost:5678/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });

    if (!response.ok) {
      throw new Error(
        `Erreur HTTP : ${response.status} ${response.statusText}`
      );
    }
    const data = await response.json();
    window.sessionStorage.setItem("token", data.token);
    window.location.href = "index.html";
  } catch (error) {
    document.querySelector("#login-form form").classList.add("login-error");
  }
}

// Lance la fonction testLogin
document.querySelector("#login-form form").addEventListener("submit", (e) => {
  e.preventDefault();
  const user = {
    email: logsInput.email.value,
    password: logsInput.password.value,
  };
  testLogin(user);
});

Object.values(logsInput).forEach((input) => {
  input.addEventListener("click", () => {             
    document.querySelector("#login-form form").classList.remove("login-error");
  });
});
