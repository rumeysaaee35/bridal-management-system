function requireRole(allowedRoles = []) {
  const userStr = localStorage.getItem("user");

  if (!userStr) {
    alert("Bu sayfaya erişmek için giriş yapmalısın");
    window.location.href = "index.html";
    return;
  }

  const user = JSON.parse(userStr);

  if (!allowedRoles.includes(user.role)) {
    alert("Bu sayfaya erişim yetkin yok");
    window.location.href = "index.html";
    return;
  }
}
