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

    function bookingStoreFactory(reservableRoom, currentUserId) {
        var fromDateTimeFieldGetter;
        var toDateTimeFieldGetter;
        var validationError;
        var bookingAppInst;
        var day = moment().tz("Europe/Oslo").startOf("week").startOf("day").isoWeekday(1);
        var days = getDaysForFirstDay(day);
        var reservations = [];

        return {
            getCurrentUserId: function () {
                return currentUserId;
            },

            changeWeek: function (step) {
                day = day.clone().add(step * 7, "days").startOf("day");
                days = getDaysForFirstDay(day);
                reservations = [];
                bookingAppInst.forceUpdate();
            },

            getDay: function () {
                return day;
            },

            getDays: function () {
                return days;
            },

            setReservationsForDay: function (reservationsDay, newReservations) {
                if (reservationsDay.isSame(day)) {
                    reservations = newReservations.map(function (reservation) {
                        return {
                            id: reservation.id,
                            from: moment(reservation.from).tz("Europe/Oslo"),
                            to: moment(reservation.to).tz("Europe/Oslo"),
                            booking: reservation.booking,
                            reservableRoom: reservation["reservable_room"]
                        }
                    });;
                    reservations.sort(function (a, b) {
                        return a.from.valueOf() - b.from.valueOf();
                    });
                    bookingAppInst.forceUpdate();
                }
            },

            getReservations: function () {
                return reservations;
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

            getReservableRoom: function () {
                return reservableRoom;
            }
        };
    }

    GLOBAL.BOOKING_STORE_FACTORY = bookingStoreFactory;
}(this));
