/* SIMATIC IT Unified Architecture Foundation V3.0 | Copyright (C) Siemens AG 2019. All Rights Reserved. */

(function () {
    'use strict';

    /**
     * @ngdoc module
     * @name siemens.simaticit.common.widgets.tabset
     * @description
     * This module provides functionalities related to display tabs.
     */
    angular.module('siemens.simaticit.common.widgets.tabset', ['ui.bootstrap']);

})();

(function () {
    'use strict';
    /**
    * @ngdoc directive
    * @name sitTab
    * @module siemens.simaticit.common.widgets.tabset
    * @description
    * A wrapper for the **uib-tab** directive distributed by Angular UI Bootstrap.
    *
    * Displays a tab, used within the {@link sitTabset} widget.
    *
    * **Note:** The **tab** directive (previously provided by Angular UI Bootstrap) can still be used, but it is deprecated.
    *
    * @usage
    * ```
    * <sit-tabset>
    *       <!-- ENVELOPE  -->
    *        <sit-tab heading="Subscription Filter">
    *            <div>
    *                <sit-property-grid sit-id="{{esec.pgSF.id}}"
    *                                   sit-data="esec.pgSF.data"
    *                                   sit-layout="{{esec.pgSF.layout}}"
    *                                   sit-type="{{esec.pgSF.type}}"
    *                                   sit-mode="{{esec.pgSF.mode}}"
    *                                   sit-columns="esec.pgSF.columns">
    *               </sit-property-grid>
    *            </div>
    *        </sit-tab>
    *    </sit-tabset>
    * ```
    * */



    var tab = function (require, $parse, $compile, $sce) {
        return {
            require: require,
            replace: true,
            templateUrl: 'common/widgets/navigationLink/tab.html',
            transclude: true,
            scope: {
                active: '=?',
                heading: '@',
                new: '=?',
                warning: '=?',
                onSelect: '&select', //This callback is called in contentHeadingTransclude
                //once it inserts the tab's content into the dom
                onDeselect: '&deselect'
            },
            controller: function () {
                //Empty controller so other directives can require being 'under' a tab
            },
            controllerAs: 'tab',
            link: function (scope, elm, attrs, tabsetCtrl, transclude) {

                scope.$on('tab_' + scope.$id, function (event, heading) {
                    var htmlElem = $compile(heading)(scope);
                    if (htmlElem.length > 0) {
                        scope.heading = $sce.trustAsHtml((htmlElem[0]).innerHTML);
                    }
                });

                scope.$watch(function () {
                    if (scope.headingElement) {
                        return scope.headingElement.innerHTML;
                    }
                },
                function (value) {
                    if (value) {
                        scope.heading = $sce.trustAsHtml(value);
                    }
                });

                scope.$watch('active', function (active) {
                    if (active) {
                        tabsetCtrl.select(scope);
                    }
                });

                scope.$watch('warning', function (newValue, oldValue) {
                    if (newValue !== oldValue) {
                        scope.$emit('tab-warning-changed', newValue);
                    }
                });

                scope.disabled = false;
                if (attrs.disabled) {
                    scope.$parent.$watch($parse(attrs.disabled), function (value) {
                        scope.disabled = value;
                    });
                }

                scope.select = function () {
                    if (!scope.disabled) {
                        scope.active = true;
                    }
                };

                tabsetCtrl.addTab(scope);
                scope.$on('$destroy', function () {
                    tabsetCtrl.removeTab(scope);
                });

                //We need to transclude later, once the content container is ready.
                //when this link happens, we're inside a tab heading.
                scope.$transcludeFn = transclude;
            }
        };
    }
    var tabHeadingTransclude = function (require) {
        return {
            restrict: 'A',
            require: require,
            link: function (scope, elm) {
                scope.$watch('headingElement', function updateHeadingElement(heading) {
                    if (heading) {
                        elm.html('');
                        elm.append(heading);
                        scope.$broadcast('tab_' + scope.$id, heading);
                    }
                });
            }
        };
    }


    angular.module('siemens.simaticit.common.widgets.tabset')
   .directive('tab', ['$parse', '$compile', '$sce', function ($parse, $compile, $sce) { return tab('^tabset', $parse, $compile, $sce); }])
   .directive('sitTab', ['$parse', '$compile', '$sce', function ($parse, $compile, $sce) { return tab('^sitTabset', $parse, $compile, $sce); }])

   .directive('tabHeadingTransclude', function () { return tabHeadingTransclude('^tab'); })
   .directive('sitTabHeadingTransclude', function () { return tabHeadingTransclude('^sitTab'); })
})();

(function () {
    'use strict';
    /**
    * @ngdoc directive
    * @name sitTabset
    * @module siemens.simaticit.common.widgets.tabset
    * @description
    * A wrapper for the uib-tabset directive distributed by Angular UI Bootstrap.
    *
    * It displays a tab control, using the {@link sitTab} widget to configure different tabs.
    *
    * **Note:** The **tabset** directive (previously provided by Angular UI Bootstrap) can still be used, but it is deprecated.
    *
    * @usage
    * ```
    * <sit-tabset>
    *        <!-- ENVELOPE  -->
    *        <sit-tab heading="Subscription Filter">
    *            <div>
    *                <sit-property-grid sit-id="{{esec.pgSF.id}}"
    *                                   sit-data="esec.pgSF.data"
    *                                   sit-layout="{{esec.pgSF.layout}}"
    *                                   sit-type="{{esec.pgSF.type}}"
    *                                   sit-mode="{{esec.pgSF.mode}}"
    *                                   sit-columns="esec.pgSF.columns">
    *               </sit-property-grid>
    *           </div>
    *       </sit-tab>
    *    </sit-tabset>
    * ```
    * */

    function SitTabsetController($scope, $timeout, $element, $translate) {
        var ctrl = this,
            tabs = ctrl.tabs = $scope.tabs = [];
        var destroyed;
        activate();

        function activate() {
            ctrl.showNavbar = false;
            ctrl.visibleTabs = 100;
            ctrl.displayDropdown = false;
            ctrl.maxTabWidth = 280 + "px";
            ctrl.otherTabs = $translate.instant('navigationLink.moreTabsAvailable');
        }

        function getVisibleTabs(containerWidth, element) {
            var width = containerWidth;
            element.find('ul:first').css('overflow', 'inherit');
            var tabs = element.find('ul:first >li');
            for (var index = 0; index < tabs.length; index++) {
                width = width - tabs[index].offsetWidth;
                if (width <= 0) {
                    index--;
                    break;
                }
            }
            if (index !== tabs.length && index >= 0) {
                var breakpointIndex = index;
                width = containerWidth;
                var largestDropdownTab = tabs[index].offsetWidth + 2;
                for (; index < tabs.length; index++) {
                    if (largestDropdownTab < tabs[index].offsetWidth)
                        largestDropdownTab = tabs[index].offsetWidth;
                }

                if (breakpointIndex + 1 < tabs.length - 1) {
                    width = width - largestDropdownTab;
                }
                for (index = 0; index < tabs.length; index++) {
                    var tab = tabs[index];
                    width = width - tab.offsetWidth;
                    if (width <= 0) {
                        index;
                        break;
                    }
                }
            }

            return tabs.length - index === 0 ? tabs.length : index;
        }


        function rearrangeTabs(tabs, selectedTab) {
            var k = _.indexOf(tabs, selectedTab);
            if (k >= 0) {

                tabs.sort(function (a, b) {
                    return a.$id - b.$id;
                });
                var selectedTabIndex = _.findIndex(tabs, { active: true });
                if (selectedTabIndex > ctrl.visibleTabs - 1) {
                    moveTabsArray(tabs, selectedTabIndex, ctrl.visibleTabs - 1);
                }
                $timeout(function () {
                    $scope.$broadcast('sit-layout-change', { eventSource: 'tabset' });
                });
            }
        }

        function moveTabsArray(arr, selectedIndex, visibleIndex) {
            if (visibleIndex >= arr.length) {
                var x = visibleIndex - arr.length;
                while ((x--) + 1) {
                    this.push(undefined);
                }
            }
            arr.splice(visibleIndex, 0, arr.splice(selectedIndex, 1)[0]);
        }

        ctrl.calculateVisibleTabs = function (containerWidth, element) {
            ctrl.visibleTabs = getVisibleTabs(containerWidth, element);

            if (ctrl.visibleTabs < tabs.length) {
                ctrl.displayDropdown = true;
            } else {
                ctrl.displayDropdown = false;
            }
            rearrangeTabs(tabs, ctrl.selectedTab);
            ctrl.setDropdownPosition();
        };

        ctrl.select = function (selectedTab) {
            ctrl.selectedTab = selectedTab;
            angular.forEach(tabs, function (tab) {
                if (tab.active && tab !== selectedTab) {
                    tab.active = false;
                    tab.onDeselect();
                    selectedTab.selectCalled = false;
                }
            });

            selectedTab.active = true;
            rearrangeTabs(tabs, selectedTab);
            // only call select if it has not already been called
            if (!selectedTab.selectCalled) {
                selectedTab.onSelect();
                selectedTab.selectCalled = true;
            }
        };

        ctrl.addTab = function addTab(tab) {
            tabs.push(tab);
            // we can't run the select function on the first tab
            // since that would select it twice
            if (tabs.length === 1 && tab.active !== false) {
                tab.active = true;
            } else if (tab.active) {
                ctrl.select(tab);
            } else {
                tab.active = false;
            }
        };

        ctrl.removeTab = function removeTab(tab) {
            var index = tabs.indexOf(tab);
            //Select a new tab if the tab to be removed is selected and not destroyed
            if (tab.active && tabs.length > 1 && !destroyed) {
                //If this is the last tab, select the previous tab. else, the next tab.
                var newActiveIndex = index === tabs.length - 1 ? index - 1 : index + 1;
                ctrl.select(tabs[newActiveIndex]);
            }
            tabs.splice(index, 1);
        };

        ctrl.setDropdownHeight = function () {
            var BUTTON_HEIGHT = 40;
            var FOUR_ITEM_HEIGHT = 120;
            var MIN_ITEM_COUNT = 4;
            var ONE_ITEM_HEIGHT = 30;
            var DROPDOWN_PADDING = 4;
            var tabDropdownElement, tabDropdownButtonOffset, dropdownHeight, maxHeight, listCount;
            tabDropdownElement = $element.find('ul.nav .navbar-nav-dropdown ul.dropdown-menu');
            tabDropdownButtonOffset = $element.find('ul.nav .navbar-nav-dropdown button').offset().top;
            dropdownHeight = $(window).height() - tabDropdownButtonOffset - BUTTON_HEIGHT;
            listCount = $element.find('ul.nav .navbar-nav-dropdown ul.dropdown-menu li').length - $element.find('ul.nav .navbar-nav-dropdown ul.dropdown-menu li.ng-hide').length;
            maxHeight = dropdownHeight < FOUR_ITEM_HEIGHT ? (listCount < MIN_ITEM_COUNT ? ONE_ITEM_HEIGHT * listCount + DROPDOWN_PADDING : ONE_ITEM_HEIGHT * MIN_ITEM_COUNT + DROPDOWN_PADDING) : dropdownHeight;
            tabDropdownElement.css({ 'max-height': maxHeight + 'px', 'overflow': 'auto' });
            ctrl.setDropdownPosition();
        };

        ctrl.setDropdownPosition = function () {
            var DROPDOWN_RIGHT = 19;
            var TAB_FULL_WIDTH = 269;
            var tabDropdownElement, tabDropdownOffset, dropdownWidth;
            tabDropdownElement = $element.find('ul.nav .navbar-nav-dropdown ul.dropdown-menu');
            tabDropdownOffset = $element.find('ul.nav .navbar-nav-dropdown button').offset().left;
            dropdownWidth = $(window).width() - tabDropdownOffset;
            if (dropdownWidth < TAB_FULL_WIDTH) {
                tabDropdownElement.css({ 'right': DROPDOWN_RIGHT + 'px' });
            } else {
                tabDropdownElement.css({ 'right': 'auto' });
            }
        };

        ctrl.parseTooltip = function (heading) {
            return typeof (heading) === 'string' ? heading : '';
        };

        $scope.$on('$destroy', function () {
            destroyed = true;
        });
    }

    SitTabsetController.$inject = ['$scope', '$timeout', '$element', '$translate'];

    function tabset($window, $interval, $timeout) {
        return {
            transclude: true,
            replace: true,
            scope: {
                type: '@'
            },
            controller: SitTabsetController,
            controllerAs: 'tabsetCtrl',
            templateUrl: 'uib/template/tabs/tabset.html',
            link: function (scope, element, attrs, ctrl) {

                $timeout(linkFunction);

                function linkFunction() {
                    var TIME_INTERVAL = 300;
                    var MAX_ITERAION = 7;
                    var MIN_CONTAINER_WIDTH = 20;
                    scope.vertical = angular.isDefined(attrs.vertical) ? scope.$parent.$eval(attrs.vertical) : false;
                    scope.justified = angular.isDefined(attrs.justified) ? scope.$parent.$eval(attrs.justified) : false;

                    var tabWidthInterval = $interval(triggerValidation, TIME_INTERVAL, MAX_ITERAION);

                    function triggerValidation() {
                        if (element.width() > MIN_CONTAINER_WIDTH) {
                            calcVisibleTabs();
                            $interval.cancel(tabWidthInterval);
                        }
                    }

                    function calcVisibleTabs() {
                        ctrl.calculateVisibleTabs(element.width(), element);
                    }

                    function onLayoutChange(event, data) {
                        if (data.eventSource === 'layout' || data.eventSource === 'toolbox') {
                            if (element.width() > MIN_CONTAINER_WIDTH) {
                                calcVisibleTabs();
                            }
                        }
                    }

                    angular.element($window).bind('resize', calcVisibleTabs);

                    ctrl.isTabEllipsis = function (tab) {
                        return ($('div[data-ellipsis-id="sit-nav-tab-span-' + tab.$id + '"]')[0].scrollWidth > $('div[data-ellipsis-id="sit-nav-tab-span-' + tab.$id + '"]')[0].clientWidth);
                    };

                    scope.$on('sit-layout-change', onLayoutChange);

                    scope.$on('$destroy', function () {
                        angular.element($window).unbind('resize', calcVisibleTabs);
                    });

                    scope.$watch(function () {
                        return element.find('.tab-content > .tab-pane').length;
                    }, function (newValue, oldValue) {
                        if (newValue === oldValue) {
                            return;
                        }
                        ctrl.visibleTabs = ctrl.tabs.length;
                        $timeout(function () {
                            calcVisibleTabs();
                        });
                    });
                }
            }
        }
    }

    var tabContentTransclude = function (require, headNode) {
        var _headNode = headNode;
        return {
            restrict: 'A',
            require: require,
            link: function (scope, elm, attrs) {
                var transcludeKey = 'tabContentTransclude';
                if ('sit' === _headNode) {
                    transcludeKey = 'sitTabContentTransclude';
                }
                var tab = scope.$eval(attrs[transcludeKey]);

                //Now our tab is ready to be transcluded: both the tab heading area
                //and the tab content area are loaded.  Transclude 'em both.
                tab.$transcludeFn(tab.$parent, function (contents) {
                    angular.forEach(contents, function (node) {
                        if (isTabHeading(node, _headNode)) {
                            //Let tabHeadingTransclude know.
                            tab.headingElement = node;
                        } else {
                            elm.append(node);
                        }
                    });
                });
            }
        };

        function isTabHeading(node, headNode) {

            if (headNode === 'sit') {
                return node.tagName && (
                    node.hasAttribute('sit-tab-heading') ||
                    node.hasAttribute('data-sit-tab-heading') ||
                    node.hasAttribute('x-sit-tab-heading') ||
                    node.tagName.toLowerCase() === 'sit-tab-heading' ||
                    node.tagName.toLowerCase() === 'data-sit-tab-heading' ||
                    node.tagName.toLowerCase() === 'x-sit-tab-heading'
                );
            }
            return node.tagName && (
                node.hasAttribute('tab-heading') ||
                node.hasAttribute('data-tab-heading') ||
                node.hasAttribute('x-tab-heading') ||
                node.tagName.toLowerCase() === 'tab-heading' ||
                node.tagName.toLowerCase() === 'data-tab-heading' ||
                node.tagName.toLowerCase() === 'x-tab-heading'
            );
        }
    }

    angular.module('siemens.simaticit.common.widgets.tabset')
        .directive('tabset', ['$window', '$interval', '$timeout', tabset]).directive('tabContentTransclude', function () {
            return tabContentTransclude('^tabset');
        })

        .directive('sitTabset', ['$window', '$interval', '$timeout', tabset]).directive('sitTabContentTransclude', function () {
            return tabContentTransclude('^sitTabset', 'sit');
        });
})();
