
function logout() {
    window.location.href = "/logout"
}

function createLogoutOnFailureHandler(handleLogout) {
    return function() {
        logout(handleLogout, true);
    }
}

export {logout, createLogoutOnFailureHandler};
