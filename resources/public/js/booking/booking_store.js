(function (GLOBAL) {
    function getDaysForFirstDay(firstDay) {
        return [
            firstDay.clone(),
            firstDay.clone().day(2),
            firstDay.clone().day(3),
            firstDay.clone().day(4),
            firstDay.clone().day(5),
            firstDay.clone().day(6),
            firstDay.clone().day(7)
        ].map(function (day) {
            return {label: day.format("ddd"), inst: day};
        });
    }

    function bookingStoreFactory(initialData) {
        var fromDateTimeFieldGetter;
        var toDateTimeFieldGetter;
        var validationError;
        var bookingAppInst;
        var bookableRoom = initialData.bookableRoom;
        var days = getDaysForFirstDay(moment().day("Monday"));

        return {
            getDays: function () {
                return days;
            },

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
            },

            getBookableRoom: function () {
                return bookableRoom;
            }
        };
    }

    GLOBAL.BOOKING_STORE_FACTORY = bookingStoreFactory;
}(this));
