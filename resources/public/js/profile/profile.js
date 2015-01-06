(function () {
    var csrfToken = document.querySelector("meta[name=csrf-token]");
    if (csrfToken) {
        var CSRF_TOKEN = csrfToken.getAttribute("content");
    } else {
        throw new Error("Unable to find CSRF token");
    }

    var http = OLYP_HTTP_FACTORY(CSRF_TOKEN);

    var apiUtils = {
        changePassword: function (payload) {
            return http("PUT", "/api/password", payload)
        }
    };

    http("GET", "/api/profile").then(
        function (profile) {
            var fluxStore = PROFILE_STORE_FACTORY(profile);
            var fluxActions = PROFILE_ACTIONS_FACTORY(fluxStore, apiUtils);

            var profileAppInst = React.render(
                PROFILE_COMPONENTS.ProfileApp({
                    fluxActions: fluxActions,
                    fluxStore: fluxStore
                }),
                document.getElementById("profile-app"));
            fluxStore.setCompInst(profileAppInst);
        },
        function (err) {
            alert("An unknown error occurred! " + JSON.stringify(err));
        }
    );
}());
