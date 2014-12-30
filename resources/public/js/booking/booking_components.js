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

    function formatHour(hour) {
        if (hour < 10) {
            return "0" + hour + ":00";
        } else {
            return hour + ":00";
        }
    }

    var CalendarGridClass = React.createClass({
        prevWeekButtonClicked: function () {
        },

        nextWeekButtonClicked: function () {
        },

        render: function () {
            var hours = [];
            for (var i = 0; i < 24; i++) {
                hours.push(i);
            }

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
                        return div(
                            {key: "day-" + day.label, className: "calendar-grid-column"},
                            div(
                                {className: "calendar-grid-day-header"},
                                day.label, " ", day.inst.format("DD.MM")),
                            hours.map(function (hour) {
                                return div(
                                    {key: "hour-" + hour, className: "calendar-grid-hour-cell"},
                                    "-");
                            }));
                    })));
        }
    });
    var CalendarGrid = React.createFactory(CalendarGridClass);

    var BookingAppClass = React.createClass({
        mixin: [FluxRootComponentMixin],

        render: function () {
            var monday = moment().day("Monday");
            var days = [
                {label: "Mon", inst: monday.clone()},
                {label: "Tue", inst: monday.clone().day(2)},
                {label: "Wed", inst: monday.clone().day(3)},
                {label: "Thu", inst: monday.clone().day(4)},
                {label: "Fri", inst: monday.clone().day(5)},
                {label: "Sat", inst: monday.clone().day(6)},
                {label: "Sun", inst: monday.clone().day(7)}
            ];

            return div(
                {className: "row"},
                React.DOM.div({className: "calendar-grid-title"}, "Booking of \"", this.props.fluxStore.getBookableRoom().name + "\""),
                div({className: "col-md-3 col-md-push-9"}, BookingForm({fluxActions: this.props.fluxActions, validationError: this.props.fluxStore.getValidationError()})),
                div({className: "col-md-9 col-md-pull-3"}, CalendarGrid({days: days})));
        }
    });
    var BookingApp = React.createFactory(BookingAppClass);

    GLOBAL.BOOKING_COMPONENTS = {
        BookingApp: BookingApp
    };
}(this));
