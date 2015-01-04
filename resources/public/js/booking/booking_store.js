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

    function bookingStoreFactory(bookableRoom, currentUserId) {
        var fromDateTimeFieldGetter;
        var toDateTimeFieldGetter;
        var validationError;
        var bookingAppInst;
        var bookableRoom = bookableRoom;
        var day = moment().tz("Europe/Oslo").startOf("week").startOf("day").isoWeekday(1);
        var days = getDaysForFirstDay(day);
        var bookings = [];

        return {
            getCurrentUserId: function () {
                return currentUserId;
            },

            changeWeek: function (step) {
                day = day.clone().add(step * 7, "days").startOf("day");
                days = getDaysForFirstDay(day);
                bookings = [];
                bookingAppInst.forceUpdate();
            },

            getDay: function () {
                return day;
            },

            getDays: function () {
                return days;
            },

            setBookingsForDay: function (bookingsDay, newBookings) {
                if (bookingsDay.isSame(day)) {
                    bookings = newBookings.map(function (booking) {
                        return {
                            id: booking.id,
                            from: moment(booking.from).tz("Europe/Oslo"),
                            to: moment(booking.to).tz("Europe/Oslo"),
                            user: booking.user,
                            bookableRoom: booking["bookable-room"]
                        }
                    });;
                    bookings.sort(function (a, b) {
                        return a.from.valueOf() - b.from.valueOf();
                    });
                    bookingAppInst.forceUpdate();
                }
            },

            getBookings: function () {
                return bookings;
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
