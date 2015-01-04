(function (GLOBAL) {
    var div = React.DOM.div;
    var form = React.DOM.form;
    var label = React.DOM.label;
    var input = React.DOM.input;
    var a = React.DOM.a;
    var span = React.DOM.span;

    var FluxRootComponentMixin = {
        propTypes: {
            fluxActions: React.PropTypes.object.required,
            fluxStore: React.PropTypes.object.required
        }
    };

    var FluxChildComponentMixin = {
        propTypes: {
            // fluxActions: React.PropTypes.object.required
        }
    };

    var BookingFormDateTimeFieldsClass = React.createClass({
        mixins: [FluxChildComponentMixin],

        componentDidMount: function () {
            var DATE_FORMAT = "DD.MM.YYYY";
            var TIME_FORMAT = "HH:mm";

            var container = this.getDOMNode();

            var rowWrapper = document.createElement("div");
            rowWrapper.className = "row";

            var datePickerCell = document.createElement("div");
            datePickerCell.className = "col-xs-7";
            rowWrapper.appendChild(datePickerCell);

            var timePickerCell = document.createElement("div");
            timePickerCell.className = "col-xs-5";
            rowWrapper.appendChild(timePickerCell);

            var dateInput = document.createElement("input");
            dateInput.type = "text";
            dateInput.className = "form-control";
            dateInput.value = this.props.initialDate.format("DD.MM.YYYY");
            jQuery(dateInput).datepicker({format: "dd.mm.yyyy", weekStart: 1});
            datePickerCell.appendChild(dateInput);

            var timeInput = document.createElement("input");
            timeInput.type = "text";
            timeInput.className = "form-control";
            timeInput.value = this.props.initialDate.format("HH:mm");
            timePickerCell.appendChild(timeInput);

            this.props.fluxActions.setBookingFormDateTimeFields(this.props.name, function () {
                var result = moment(dateInput.value + " " + timeInput.value, DATE_FORMAT + " " + TIME_FORMAT, true);
                if (result.isValid()) {
                    return result;
                } else {
                    return null;
                }
            });

            container.appendChild(rowWrapper);
        },

        render: function () {
            return div();
        }
    });
    var BookingFormDateTimeFields = React.createFactory(BookingFormDateTimeFieldsClass);

    var BookingFormClass = React.createClass({
        mixins: [FluxChildComponentMixin],

        onSubmit: function (e) {
            e.preventDefault();
            this.props.fluxActions.submitBookingForm();
        },

        getValidationError: function () {
            var msg = this.props.validationError;
            if (msg) {
                return div(
                    {className: "panel panel-danger"},
                    div({className: "panel-heading"},
                        React.DOM.h3({className: "panel-title"}, msg)));
            }
        },

        render: function () {
            return form(
                {onSubmit: this.onSubmit},
                this.getValidationError(),
                div({className: "form-group"},
                    label(null, "From"),
                    BookingFormDateTimeFields({fluxActions: this.props.fluxActions, name: "from", initialDate: moment().hour(14).minute(0)})),
                div({className: "form-group"},
                    label(null, "To"),
                    BookingFormDateTimeFields({fluxActions: this.props.fluxActions, name: "to", initialDate: moment().hour(15).minute(0)})),
                input({type: "submit", value: "Book now!", className: "btn btn-default"}));
        }
    });
    var BookingForm = React.createFactory(BookingFormClass);

    var CalendarGridBookingDeleteButtonClass = React.createClass({
        mixins: [FluxChildComponentMixin],

        onClick: function () {
            this.props.fluxActions.deleteBooking(this.props.reservation);
        },

        render: function () {
            return a({onClick: this.onClick, className: "calendar-grid-reservation-delete-button"}, span({className: "glyphicon glyphicon-trash"}))
        }
    });
    var CalendarGridBookingDeleteButton = React.createFactory(CalendarGridBookingDeleteButtonClass);

    function formatHour(hour) {
        if (hour < 10) {
            return "0" + hour + ":00";
        } else {
            return hour + ":00";
        }
    }

    function reservationIntersects(booking, dayStart, dayEnd) {
        return (booking.from.valueOf() <= dayEnd.valueOf()) && (dayStart.valueOf() <= booking.to.valueOf());
    }


    var HOUR_HEIGHT = 40;

    function getOffset(offset) {
        var hoursOffset = Math.floor(offset);
        if (hoursOffset === 0) {
            return 0;
        } else {
            return hoursOffset * HOUR_HEIGHT + ((offset % hoursOffset) * HOUR_HEIGHT);
        }
    }

    var CalendarGridClass = React.createClass({
        mixins: [FluxChildComponentMixin],

        prevWeekButtonClicked: function () {
            this.props.fluxActions.moveToPreviousWeek();
        },

        nextWeekButtonClicked: function () {
            this.props.fluxActions.moveToNextWeek();
        },

        getDeleteButton: function (reservation) {
            if (this.props.currentUserId === reservation.booking.user.id) {
                return CalendarGridBookingDeleteButton({fluxActions: this.props.fluxActions, reservation: reservation})
            }
        },

        render: function () {
            var hours = [];
            for (var i = 0; i < 24; i++) {
                hours.push(i);
            }

            var reservations = this.props.reservations.slice(0);

            return div(
                {className: "calendar-grid"},
                div({className: "calendar-grid-hours"},
                    div({className: "calendar-grid-hours-header"},
                        div({className: "btn-group"},
                            a({className: "btn btn-xs btn-default", onClick: this.prevWeekButtonClicked},
                              span({className: "glyphicon glyphicon-chevron-left"})),
                            a({className: "btn btn-xs btn-default", onClick: this.nextWeekButtonClicked},
                              span({className: "glyphicon glyphicon-chevron-right"})))),
                    hours.map(function (hour) {
                        return div(
                            {key: "hour-" + hour, className: "calendar-grid-hour-cell"},
                            formatHour(hour));
                    })),
                div({className: "calendar-grid-content"},
                    this.props.days.map(function (day) {
                        var dayStart = day.inst;
                        var dayEnd = day.inst.clone().endOf("day");

                        var reservationsForDay = [];
                        if (reservations.length > 0 && reservationIntersects(reservations[0], dayStart, dayEnd)) {

                            var lastIntersectingReservation;
                            for (var i = 1; i < reservations.length; i++) {
                                if (!reservationIntersects(reservations[i], dayStart, dayEnd)) {
                                    lastIntersectingReservation = i;
                                    break;
                                }
                            }

                            reservationsForDay = reservations.slice(0, lastIntersectingReservation);
                            reservations = reservations.slice(lastIntersectingReservation);
                        }

                        return div(
                            {key: "day-" + day.label, className: "calendar-grid-column"},
                            div(
                                {className: "calendar-grid-day-header"},
                                day.label, " ", day.inst.format("DD.MM")),
                            div(
                                {className: "calendar-grid-day-reservations"},
                                hours.map(function (hour) {
                                    return div(
                                        {key: "hour-" + hour, className: "calendar-grid-hour-cell"});
                                }),
                                reservationsForDay.map(function (reservation) {
                                    var dayStartHourOffset = (reservation.from.valueOf() - dayStart.valueOf()) / 1000 / 60 / 60;
                                    var reservationLengthOffset = (reservation.to.valueOf() - reservation.from.valueOf()) / 1000 / 60 / 60;
                                    var classNames = ["calendar-grid-reservation"];

                                    var topOffset = getOffset(dayStartHourOffset);
                                    var bottomOffset = topOffset + getOffset(reservationLengthOffset);

                                    if (topOffset < 0) {
                                        classNames.push("calendar-grid-reservation-overlaps-previous");
                                    }

                                    if (bottomOffset > (HOUR_HEIGHT * 24)) {
                                        classNames.push("calendar-grid-reservation-overlaps-next");
                                    }

                                    return div(
                                        {
                                            key: "reservation-" + topOffset + "-" + bottomOffset,
                                            className: classNames.join(" "),
                                            style: {
                                                top: Math.max(topOffset, 0) + "px",
                                                bottom: ((HOUR_HEIGHT * 24) - bottomOffset) + "px"
                                            }
                                        },
                                        div(null, reservation.booking.user.name),
                                        div(null, this.getDeleteButton(reservation))
                                    );
                                }.bind(this))
                            )
                        );
                    }.bind(this))));
        }
    });
    var CalendarGrid = React.createFactory(CalendarGridClass);

    var BookingAppClass = React.createClass({
        mixin: [FluxRootComponentMixin],

        render: function () {
            return div(
                {className: "row"},
                React.DOM.div({className: "calendar-grid-title"}, "Booking of \"", this.props.fluxStore.getReservableRoom().name + "\""),
                div({className: "col-md-3 col-md-push-9"}, BookingForm({fluxActions: this.props.fluxActions, validationError: this.props.fluxStore.getValidationError()})),
                div({className: "col-md-9 col-md-pull-3"}, CalendarGrid({fluxActions: this.props.fluxActions, days: this.props.fluxStore.getDays(), reservations: this.props.fluxStore.getReservations(), currentUserId: this.props.fluxStore.getCurrentUserId()})));
        }
    });
    var BookingApp = React.createFactory(BookingAppClass);

    GLOBAL.BOOKING_COMPONENTS = {
        BookingApp: BookingApp
    };
}(this));
