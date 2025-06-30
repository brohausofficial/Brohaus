export function handleLogout() {
    window.location.href = "/login"
    localStorage.removeItem("token");
}
