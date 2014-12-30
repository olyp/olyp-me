(function () {
    var div = React.DOM.div;
    var a = React.DOM.a;
    var ul = React.DOM.ul;
    var li = React.DOM.li;

    var OlypNavbarClass = React.createClass({
        logoClicked: function () {
        },

        bookingClicked: function () {
        },

        invoicesClicked: function () {
        },

        myProfileClicked: function () {
        },

        render: function () {
            return div(
                null,
                div({className: "nabar-header"},
                    a({className: "navbar-brand", onClick: this.logoClicked}, "Olyp")),
                ul({className: "nav navbar-nav"},
                   li(null, a({onClick: this.bookingClicked}, "Booking")),
                   li(null, a({onClick: this.invoicesClicked}, "Invoices"))),
                ul({className: "nav navbar-nav navbar-right"},
                   li(null, a({onClick: this.myProfileClicked}, "My profile"))));
        }
    });
    var OlypNavbar = React.createFactory(OlypNavbarClass);


    React.render(OlypNavbar(), document.getElementById("navbar-target"));
}());
