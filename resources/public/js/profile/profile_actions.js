(function (GLOBAL) {
    function profileActionsFactory(fluxStore, apiUtils) {
        return {
            gotoChangePassword: function () {
                fluxStore.setPage({page: "changePassword"});
            },

            gotoOverview: function () {
                fluxStore.setPage({page: "overview"});
            },

            changePassword: function (payload) {
                apiUtils.changePassword(payload).then(
                    function () {
                        alert("Your password has been changed");
                        fluxStore.setPage({page: "overview"});
                    },
                    function (e) {
                        alert("An unknown error occurred: " + JSON.stringify(e));
                    }
                )
            }
        }
    }

    GLOBAL.PROFILE_ACTIONS_FACTORY = profileActionsFactory;
}(this));
