/* SIMATIC IT Unified Architecture Foundation V3.0 | Copyright (C) Siemens AG 2019. All Rights Reserved. */
(function () {
    'use strict';
    /**
    * @ngdoc module
    * @name siemens.simaticit.common.widgets.dateTimePicker
    *
    * @description
    * This module provides functionalities related to displaying date-time pickers.
    */
    angular.module('siemens.simaticit.common.widgets.dateTimePicker', [
        //any dependencies?
    ]);

})();

(function () {
    'use strict';

    var app = angular.module('siemens.simaticit.common.widgets.dateTimePicker');

    DateTimePickerController.$inject = ['$scope', '$timeout', '$translate'];
    function DateTimePickerController($scope, $timeout, $translate) {

        var vm = this;
        var timer;
        var INPUT_MARGIN = 10;

        function activate() {
            init();
            initButtonLabel();
            initMethods();
        }

        function init() {
            vm.isOpen = false;
            vm.isCollapsed = true;

            if (!vm.value) {
                vm.value = '';
            }

            // if value is passed as a string it will be converted to a date object
            if (!(vm.value instanceof Date) && vm.value !== '') {
                vm.value = new Date(vm.value);
            }

            if (vm.value.toString() === 'Invalid Date') {
                vm.value = '';
            }

            if (!vm.format) {
                vm.format = 'medium';
            }

            if (vm.showButtonBar === undefined) {
                vm.showButtonBar = true;
            }
            if (vm.showWeeks === undefined) {
                vm.showWeeks = false;
            }

            if (vm.showMeridian === undefined) {
                vm.showMeridian = true;
            }
            if (vm.showSeconds === undefined) {
                vm.showSeconds = false;
            }

            vm.dateOptions = {
                showWeeks: vm.showWeeks
            };
        }

        function initButtonLabel() {
            vm.buttonLabel = $translate.instant('dateTimePicker.today');
            vm.clearLabel = $translate.instant('dateTimePicker.clear');
            vm.closeLabel = $translate.instant('dateTimePicker.close');
        }

        function initMethods() {
            vm.clear = clear;
            vm.clicked = clicked;
            vm.close = close;
            vm.keydownPressed = keydownPressed;
            vm.switchDateTimePicker = switchDateTimePicker;
            vm.today = today;
            vm.setDropdownPosition = setDropdownPosition;
        }

        function focusElement() {
            timer = $timeout(function () {
                if (vm.isCollapsed) {
                    vm.buttonLabel = $translate.instant('dateTimePicker.today');
                    $(vm.element).find('.uib-datepicker div[uib-daypicker]').focus();
                } else {
                    vm.buttonLabel = $translate.instant('dateTimePicker.now');
                    $(vm.element).find('table.uib-timepicker td.uib-time.hours>input')[0].focus();
                }
            }, 0);
        }

        function setDropdownPosition() {
            if (vm.element.parents('ng-form[name=filterForm]').length > 0) {
                var inputFiledHeight = vm.element.find('ng-form[name=dateTimePickerForm] div.property-grid-input-group:last-child input.property-grid-control').outerHeight();
                var dropdownStyle = {
                    'top': vm.element.offset().top + inputFiledHeight + INPUT_MARGIN,
                    'left': vm.element.offset().left + INPUT_MARGIN,
                    'position': 'fixed'
                };
                vm.element.find('ng-form[name=dateTimePickerForm] div.dropdown-menu').css(dropdownStyle);
            }
        }

        function clicked() {
            vm.isOpen = !vm.isOpen;
            vm.element.find('ng-form div.property-grid-input-group input.property-grid-control').focus();
            if (typeof (vm.ngFocus) === "function") {
                vm.ngFocus();
            }
            if (vm.isOpen) {
                if (!vm.value) {
                    vm.value = new Date();
                }
                focusElement();
                setDropdownPosition();
            }
        }

        function keydownPressed(event) {
            var downKey = 40;
            var popupElement = $(vm.element).find('div[uib-datepicker-popup-wrap]');
            if (event.which === downKey) {
                // removing datepicker-popup-wrap to avoid keydown shortcut conflict
                if (popupElement) {
                    $(vm.element).find('ul.uib-datepicker-popup').remove();
                    popupElement.remove();
                }
                clicked();
            }
        }

        function switchDateTimePicker() {
            var width = $(vm.element).find('.dropdown-menu').children('#datepicker').width();
            $(vm.element).find('#timepicker').width(width);
            vm.isCollapsed = !vm.isCollapsed;
            focusElement();
        }

        function today() {
            if (vm.isCollapsed || !vm.value) {
                vm.value = new Date();
            } else {
                //Change Time
                var currentDate = new Date(vm.value);
                var date = new Date();
                currentDate.setHours(date.getHours());
                currentDate.setMinutes(date.getMinutes());
                currentDate.setSeconds(date.getSeconds());
                currentDate.setMilliseconds(date.getMilliseconds());
                vm.value = currentDate;
            }
        }

        function clear() {
            vm.value = null;
        }

        function close() {
            vm.isOpen = false;
            if (typeof (vm.ngBlur) === "function") {
                vm.ngBlur();
            }
        }

        activate();

        $scope.$on('$destroy', function () {
            if (timer) {
                $timeout.cancel(timer);
            }
        });
    }


    /**
    * @ngdoc directive
    * @name sitDateTimePicker
    * @module siemens.simaticit.common.widgets.dateTimePicker
    * @description
    * Displays a date-time picker control.
    *
    * @usage
    * As an element:
    * ```
    * <sit-date-time-picker
                sit-value="value"
                sit-format="format"
                sit-show-button-bar="showButtonBar"
                sit-show-weeks="showWeeks"
                sit-show-meridian="showMeridian"
                sit-readonly="readOnly"
                sit-validation="validation"
                sit-change="change"
                ng-readonly="ngReadonly"
                ng-blur="ngBlur"
                ng-disabled="ngDisabled"
                ng-focus="ngFocus"
                sit-show-seconds="showSeconds">
    * </sit-date-time-picker>
    * ```
    * @restrict E
    *
    * @param {String} sit-value Value of the date-picker widget
    * @param {String} [sit-format = 'medium'] _(Optional)_ The format in which the selected date is displayed on the widget.
    * Possible values are: fullDate, longDate, mediumDate, shortDate, medium, short.
    * @param {Boolean} [sit-show-button-bar = true] _(Optional)_ A boolean value which specifies whether to Show/Hide the [Today, Clear] buttons at the bottom.
    * @param {Boolean} [sit-show-weeks = false] _(Optional)_ A boolean value which specifies whether to display week numbers.
    * @param {Boolean} [sit-show-meridian = false] _(Optional)_ A boolean value which specifies whether or not to show time meridian.
    * @param {ValidationModel} sit-validation _(Optional)_ See {@link ValidationModel}.
    * @param {String} sit-change _(Optional)_ An expression to evaluate on change of value.
    * @param {String} sit-read-only _(Optional)_ Specifies if the property is editable.
    * @param {String} ng-blur _(Optional)_ An expression to evaluate on blur event.
    * @param {String} ng-focus _(Optional)_ An expression to evaluate on focus event.
    * @param {Boolean} ng-disabled _(Optional)_ If this expression is truthy, the element will be disabled.
    * @param {Boolean} ng-readonly _(Optional)_ If this expression is truthy, the element will be set as read-only.
    * @param  {Boolean} [sit-show-seconds = false] _(Optional)_ A boolean which specifies whether or not to show the input field for seconds in the time picker.
    * Default value is false.
    *
    * @example
    * The following example shows how to configure a date-time picker widget:
    * ```
    *  {
    *     value: "12/12/10 12:00 AM",
    *     format:"short", // 'short' and 'medium' formats are best suited for date-time picker widget
    *     showButtonBar: false,
    *     showWeeks: true,
    *     showMeridian: true,
    *     readOnly: false,
    *     ngReadonly: false,
    *     ngDisabled: false,
    *     validation: {
    *           reqired:true,
    *           custom:function(oldValue, newValue, ngModel){
    *               //do something
    *           },
    *     },
    *     change: function(oldValue, newValue, ngModel){
    *               //do something
    *     },
    *     ngBlur: function(){
    *        //do something
    *     },
    *     ngFocus: function(){
    *        //do something
    *     },
    *     showSeconds : true
    *
    *  }
    * ```
    *
    */
    app.directive('sitDateTimePicker', ['$document', '$window', function ($document, $window) {
        return {
            scope: {},
            restrict: 'E',
            bindToController: {
                'readOnly': '=?sitReadOnly',
                'value': '=sitValue',
                'validation': '=?sitValidation',
                'format': '=?sitFormat',
                'showButtonBar': '=?sitShowButtonBar',
                'showWeeks': '=?sitShowWeeks',
                'showMeridian': '=?sitShowMeridian',
                'sitChange': '=?',
                'ngDisabled': '=?',
                'ngReadonly': '=?',
                'ngBlur': '&?',
                'ngFocus': '&?',
                'showSeconds': '=?sitShowSeconds'
            },

            templateUrl: 'common/widgets/dateTimePicker/date-time-picker.html',

            controller: DateTimePickerController,

            controllerAs: 'dateTimePickerCtrl',

            link: function (scope, element, attrs, ctrl) {
                var isEventsAttached = false;
                ctrl.element = element;

                function setDropdownPosition() {
                    if (ctrl.isOpen) {
                        ctrl.setDropdownPosition()
                    }
                }

                function closeOnFilterScroll() {
                    if (ctrl.isOpen) {
                        ctrl.close();
                    }
                }

                function documentClickBind(event) {

                    if (element.find('div.property-grid-input-group').length > 0 && ctrl.isOpen === true) {
                        var offsetX = element.find('div.property-grid-input-group').children('.dropdown-menu').offset().left;
                        var offsetY = element.find('div.property-grid-input-group').children('.dropdown-menu').offset().top;
                        var width = element.find('div.property-grid-input-group').children('.dropdown-menu').width();
                        var height = element.find('div.property-grid-input-group').children('.dropdown-menu').height();

                        if (ctrl.isOpen && !element.find(event.target).length) {
                            if ((event.clientX <= offsetX) || (event.clientX >= offsetX + width) || (event.clientY <= offsetY) || (event.clientY >= offsetY + height)) {
                                scope.$apply(function () {
                                    ctrl.isOpen = false;
                                    if (typeof (ctrl.ngBlur) === "function") {
                                        ctrl.ngBlur();
                                    }
                                });
                            }
                        }
                    }

                    $(element).find('.uib-datepicker .btn').on('click', onDatePickerButtonClick);
                }

                function onDatePickerButtonClick() {
                    $(element).find('.uib-datepicker').children('table').focus();
                }

                var listener = scope.$watch(function () {
                    return element.length;
                }, function (newValue) {
                    if (newValue === 1) {
                        $document.bind('click', documentClickBind);
                        listener();
                    }
                });

                function keydownEvent(event) {
                    var target = element.find('div.uib-button-bar>button')[0];
                    var focusingElement = element.find('.date-time-icon-btn')[0];
                    var key = { tab: 9, esc: 27 };

                    if (ctrl.isOpen) {
                        if (event.which === key['esc']) {
                            scope.$apply(function () {
                                ctrl.close();
                            });
                        }
                        if (event.which === key['tab']) {
                            if (ctrl.isCollapsed && target === event.target) {
                                focusingElement.focus();
                                event.preventDefault();
                            } else if (!ctrl.isCollapsed && target === event.target) {
                                focusingElement.focus();
                                event.preventDefault();
                            }
                        }
                    }
                }

                element.on('keydown', keydownEvent);
                //attach event to date-time-picker when used in sit-filter
                if (element.parents('ng-form[name=filterForm]').length > 0) {
                    isEventsAttached = true;
                    angular.element($window).bind('resize', setDropdownPosition);
                    angular.element($document.find('.canvas-ui-view')).bind('scroll', setDropdownPosition);
                    angular.element(angular.element($document.find('sit-filter')).parent()).bind('scroll', closeOnFilterScroll);
                }

                //un-register events and un-bind watchers on scope destroy
                scope.$on('$destroy', function () {
                    element.off('keydown', keydownEvent);
                    $(element).find('.uib-datepicker .btn').off('click', onDatePickerButtonClick);
                    $document.unbind('click', documentClickBind);
                    if (isEventsAttached) {
                        angular.element($window).bind('resize', setDropdownPosition);
                        angular.element($document.find('.canvas-ui-view')).bind('scroll', setDropdownPosition);
                        angular.element(angular.element($document.find('sit-filter')).parent()).bind('scroll', closeOnFilterScroll);
                    }
                });
            }
        };
    }]);
})();

