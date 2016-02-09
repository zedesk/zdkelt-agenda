var ZdkeltAgenda = {
    is: "zdkelt-agenda",
    properties: {
        /**
        * the initial date for which the agenda is shown
        */
        initDate: {
            type: String,
            observer: '_computeDate',
            reflectToAttribute: true
        },
        /**
        * The showed view
        *
        * available value are "week" or "month"
        */
        view: {
            type: String,
            value: "week"
        },
        /**
        * locale of the agenda
        *
        * By default use the browser preferences
        */
        i18n: {
            type: String,
            value: function() {
                return window.navigator.userLanguage || window.navigator.language;
            },
            observer: "_populate"
        },
        /**
         * Internal date of the agenda
         **/
        _date: {
            type: String,
            observer: "_populate"
        },
        _weekDays: {
            type: Array
        },
        _weeks: {
            type: Array
        },
        _events: {
            type: Array,
            value: []
        },
        /**
        * show the grid hour
        */
        showHour: {
            type: Boolean,
            value: false
        },
        /**
        * size in pixel of an hour
        */
        hourSize: {
            type: Number,
            value: 60
        },
        /**
        * value of the default hour to display
        */
        hour: {
            type: String,
            value: "07:30"
        },
        /**
        * value of the default scrollTop
        */
        _hour: {
            type: Number
        },
        _hours: {
            type: Array,
            value: ["01:00","02:00","03:00","04:00","05:00","06:00",
                    "07:00","08:00","09:00","10:00","11:00","12:00",
                    "13:00","14:00","15:00","16:00","17:00","18:00",
                    "19:00","20:00","21:00","22:00","23:00","24:00"]
        }
    },
    observers: [
        '_hourScroll(hour, hourSize)'
    ],
    _calculateEvents(date) {
        var events = [];
        if( !this._events ) return [];
        this._events.map( function(event) {
            if (moment(event.startDate).format("YYYY-MM-DD") === date.format("YYYY-MM-DD") ) {
                events.push( event );
            }
        });
        return events;
    },
    _calculateWeek(date) {
        var _days = [];
        var d, disabled;
        var fDay = moment(date).startOf("week");

        moment.locale(this.i18n);
        for (d = 0; d < 7; d++) {
            disabled = (this.minDate && fDay.format("YYYY-MM-DD") < moment(this.minDate).format("YYYY-MM-DD")) ||
                (this.maxDate && fDay.format("YYYY-MM-DD") > moment(this.maxDate).format("YYYY-MM-DD"));
            _days.push({
                date: fDay.format(),
                events: this._calculateEvents(fDay),
                class: "day" +
                    (disabled ? " disabled" : "") +
                    ([0, 6].indexOf(fDay.day()) !== -1 && !disabled ? " we" : "") +
                    (fDay.month() !== moment(this._date).month() ? " nm" : "") +
                    (fDay.format("YYYY-MM-DD") === moment().format("YYYY-MM-DD") ? " today" : "") +
                    (this.value && fDay.format("YYYY-MM-DD") === this.value ? " select" : "")
            });
            fDay.add(1, 'd');
        }
        return {
            days: _days,
            firstDayOfWeek: _days[0].date,
            lastDayOfWeek: _days[6].date
        };
    },
    _hourScroll: function(hour, hourSize) {
        var tmp = hour.split(":");
        this._hour = tmp[0] * hourSize + (tmp[1]? tmp[1]/60 * hourSize : 0);
    },
    /**
     * render the calendar
     */
    _populate: function() {
        var _days = [],
            fDay, w, d, week;

        if (!this._date) {
            this._date = moment().format("YYYY-MM-DD");
        }

        this.set('_week', this._calculateWeek(moment(this._date).startOf("week")));

        setTimeout( (function() {
            var hour =
            document.querySelector("#events").scrollTop = this._hour;
        }).bind(this), 100);

        // console.log("initDate", this._week);
    },
    _populateMonth: function() {
        var _days,
            fDay, w, d, month = [];

        if (!this._date) {
            this._date = moment().format("YYYY-MM-DD");
        }

        moment.locale(this.i18n);
        fDay = moment(this._date).startOf('month').startOf('Week');

        for (w = 0; w < 6; w++) {
            month.push( this._calculateWeek(fDay) );
            fDay.add(1,'w');
        }
        this.set('_month', month);
    },
    _nextWeek: function() {
        this._date = moment(this._date).add(1, "w").format("YYYY-MM-DD");
        this._populate();
    },
    _prevWeek: function() {
        this._date = moment(this._date).subtract(1, "w").format("YYYY-MM-DD");
        this._populate();
    },
    _currentWeek: function() {
        this._date = moment().format("YYYY-MM-DD");
        this._populate();
    },
    _nextMonth: function() {
        this._date = moment(this._date).add(1, "M").format("YYYY-MM-DD");
        this._populateMonth();
    },
    _prevMonth: function() {
        this._date = moment(this._date).subtract(1, "M").format("YYYY-MM-DD");
        this._populateMonth();
    },
    _currentMonth: function() {
        this._date = moment().format("YYYY-MM-DD");
        this._populateMonth();
    },
    /**
     * set the internal `_date`
     */
    _computeDate: function() {
        console.log("test");
        if (moment(this.initDate).isValid()) {
            this._date = moment(this.initDate, "YYYY-MM-DD").format("YYYY-MM-DD");
            this.initDate = moment(this.initDate, "YYYY-MM-DD").format("YYYY-MM-DD");
        } else {
            this._date = this._date ? this._date : moment().format("YYYY-MM-DD");
        }
    },
    _changeView: function(evt) {
        switch( (evt && evt.target.selected) || this.view ) {
            case 'month':
                this._populateMonth();
            case 'week':
            default:
                this._populate();
        }
    },
    addEvent: function(event) {
        this._events.push( event );
    },
    removeEvent: function(id) {

    },
    clearEvents: function() {
        this._events = [];
    },
    showDetail: function(evt) {
        console.log(evt.model.event);
    },
    weekEventsHeight: function() {
        return "height:"+(24 * this.hourSize)+"px";
    },
    weekEventPos: function(event) {
        var startDate = moment(event.startDate);
        var stopDate = moment(event.stopDate);
        var top = (startDate.hours()+startDate.minutes()/60) * this.hourSize;
        var height = stopDate.diff(startDate) / 1000 / 3600 * this.hourSize;
        return "height:"+height+"px; top:"+top+"px;";
    },
    hourPos: function(hour) {
        var tmp = hour.split(":");
        var top = (parseInt(tmp[0],10)-1) * this.hourSize;
        return "top:"+top+"px;height:"+this.hourSize+"px"
    },
    dayMonthEventLength: function(events) {
        return (events.length > 4);
    },
    seeMore: function(evt) {
        var drop = evt.target.parentNode.querySelector('iron-dropdown');
        drop.style.width = evt.target.parentNode.offsetWidth + "px";
        drop.toggle();
    }
};

Polymer(ZdkeltAgenda);
