const API_URL = "http://localhost:8080";

async function login(event) {
  event.preventDefault();

  const usernameInput = document.getElementById("username").value;
  const passwordInput = document.getElementById("password").value;

  try{

  const response = await fetch('${API_URL}/login', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({ username, password }),
        username: usernameInput,
        password: passwordInput
  });

  if (response.ok) {
    const token = response.headers.get("Authorization");

    if(token) {
      localStorage.setItem("token", token);
     alert("Login Realizado com sucesso!");
      window.location.href = "/dashboard.html";
    }
  } else {
    alert("Usuario ou senha Invalidos!");
  }
 } catch (error) {
    console.error("Erro ao fazer login:", error);
    alert("Ocorreu um erro ao fazer login. Por favor, tente novamente.");
  }
}



