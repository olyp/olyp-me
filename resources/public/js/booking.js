(function () {
    var fluxStore = BOOKING_STORE_FACTORY();
    var fluxActions = BOOKING_ACTIONS_FACTORY(fluxStore);

    React.render(
        BOOKING_COMPONENTS.BookingApp({
            fluxActions: fluxActions,
            fluxStore: fluxStore
        }),
        document.getElementById("booking-app"));
}());
