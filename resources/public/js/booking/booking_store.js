(function (GLOBAL) {
    var fromDateTimeFieldGetter;
    var toDateTimeFieldGetter;
    var validationError;
    var bookingAppInst;

    function bookingStoreFactory() {
        return {
            setBookingAppInst: function (inst) {
                bookingAppInst = inst;
            },

            setFromDateTimeFieldGetter: function (getter) {
                fromDateTimeFieldGetter = getter;
            },

            setToDateTimeFieldGetter: function (getter) {
                toDateTimeFieldGetter = getter;
            },

            getFromToDates: function () {
                return [fromDateTimeFieldGetter(), toDateTimeFieldGetter()];
            },

            setValidationError: function (msg) {
                validationError = msg;
                bookingAppInst.forceUpdate();
            },

            clearValidationError: function () {
                validationError = null;
                bookingAppInst.forceUpdate();
            },

            getValidationError: function () {
                return validationError;
            }
        };
    }

    GLOBAL.BOOKING_STORE_FACTORY = bookingStoreFactory;
}(this));
