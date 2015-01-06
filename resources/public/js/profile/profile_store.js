(function (GLOBAL) {
    function profileStoreFactory(profile) {
        var currentPage = {page: "overview"};
        var compInst;

        return {
            setCompInst: function (inst) {
                compInst = inst;
            },

            getProfile: function () {
                return profile;
            },

            getCurrentPage: function () {
                return currentPage;
            },

            setPage: function (page) {
                currentPage = page;
                compInst.forceUpdate();
            }
        }
    };

    GLOBAL.PROFILE_STORE_FACTORY = profileStoreFactory;
}(this));
