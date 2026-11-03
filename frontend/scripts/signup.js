const API_URL = "http://localhost:8080";

async function signup(event) {
  event.preventDefault();

  const usernameInput = document.getElementById("username").value;
  const passwordInput = document.getElementById("password").value;

  try {
    const response = await fetch(`${API_URL}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        username: usernameInput,
        password: passwordInput
      })
    });

    if (response.ok) {
      alert("Cadastro realizado com sucesso!");
      window.location.href = "/login.html";
    } else {
      alert("Erro ao realizar cadastro. Tente novamente.");
    }
  } catch (error) {
    console.error("Erro ao fazer cadastro:", error);
    alert("Ocorreu um erro ao fazer cadastro. Por favor, tente novamente.");
  }
}