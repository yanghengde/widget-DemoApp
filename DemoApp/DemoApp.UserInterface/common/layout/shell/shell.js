/* SIMATIC IT Unified Architecture Foundation V3.0 | Copyright (C) Siemens AG 2019. All Rights Reserved. */
/**
 * Created by Administrator on 17/11/2014.
 */

(function () {
    'use strict';

    var myapp = angular.module('siemens.simaticit.common.services.layout');
    /*Layout Controller*/
    var layoutCtrlName = 'layoutController';

    function layoutController($rootScope, $state, $translate, common, CONFIG, APPCONFIG, swacComponentManager, $window) {
        var lc = this;
        lc.hide = true;
        lc.title = '';
        lc.mode = '';
        lc.isBreadcrumbShown = true;
        //the breadcrumb will not be shown in the swac.html and swac-debug.html pages.
        //Similarly,the side-panel top, left positions should be different in swac.html,swac-debug.html.
        //The line below decides whether swacComponentManager is enabled or not.
        lc.swacEnabled = swacComponentManager.enabled === true ? true : false;
        lc.propertyAreaTypes = common.sidePanelManager.getTypesList();
        lc.currentPAreaType = lc.propertyAreaTypes.property;
        lc.config = angular.extend({}, APPCONFIG, CONFIG);
        lc.editTypeClassName = 'rt-editType';

        var propertyType = 'property-area-container propertyType';
        var editType = 'property-area-container ' + lc.editTypeClassName;

        lc.typeClass = propertyType;

        //FIX ANIMATION PROBLEM WHEN SWITCH CLASS
        if (lc.hide) { lc.typeClass += ' property-area-hide'; }

        lc.openClose = function (p, type) {
            if (type) {
                if (typeof type === 'string') {
                    lc.mode = type;
                    lc.layoutSize = type === 'e' ? 'large' : 'small';
                } else if (typeof type === 'object') {
                    lc.mode = type.mode;
                    lc.layoutSize = 'small'
                    if (type.mode && type.mode === 'e') {
                        lc.layoutSize = ['small', 'large'].indexOf(type.size) === -1 ? 'large' : type.size;
                    }
                }
            } else {
                lc.mode = '';
            }

            if (p === null || p === undefined) {
                lc.hide = !lc.hide;
            }
            else {
                lc.hide = p;
            }

            switch (lc.mode) {
                case lc.propertyAreaTypes.edit:
                    lc.currentPAreaType = lc.propertyAreaTypes.edit;
                    lc.typeClass = editType;
                    if (lc.hide) { lc.typeClass += ' property-area-hide'; }
                    break;
                case lc.propertyAreaTypes.property:
                    lc.currentPAreaType = lc.propertyAreaTypes.property;
                    lc.typeClass = propertyType;
                    if (lc.hide) { lc.typeClass += ' property-area-hide'; }
                    $rootScope.$broadcast('sit-layout-change', { eventSource: 'nonModal' });
                    break;
                default:
                    lc.currentPAreaType = lc.propertyAreaTypes.property;
                    lc.typeClass = propertyType;
                    if (lc.hide) { lc.typeClass += ' property-area-hide'; }
                    $rootScope.$broadcast('sit-layout-change', { eventSource: 'nonModal' });
                    break;
            }

            if ($("body[swac]").length === 0 && !p) {
                //  Reducing the height of Side panel by 26px when Header bar Present in non-appolo screens
                $(".propertyType, .rt-editType, .eng-editType, .custom-editType").attr("style", "height: calc(100vh - 26px)");
            }

            return lc.hide;

        };

        lc.setTitle = function (value) {
            if (typeof value === 'string') {
                lc.title = value;
                if (value.length > 255) {
                    common.logger.logWarning('SidePanelManager ->  setTitle(value) method - value max length: 255', value, 'siemens.simaticit.common.services.layout');
                }
            } else {
                common.logger.logWarning('SidePanelManager ->  setTitle(value) method - value must be a string ', value, 'siemens.simaticit.common.services.layout');
            }
        };


        lc.isGridsterEnabled = false;
        lc.isLargeScreen = true;

        $rootScope.$on('siemens.simaticit.common.widgets.component.gridster-loaded', function (event, args) {
            lc.isGridsterEnabled = args;
        });


        $rootScope.$on('siemens.simaticit.common.runtime.app.gridster-options-loaded', function (event, args) {
            lc.commandBarData = setCommandbar(args.dragResize);
            lc.isLargeScreen = args.isLargeScreen;
        });

        function setCommandbar(isDraggableResizable) {
            return {
                'barType': 'Action',
                'bar': [

                    {
                        "type": "toggle",
                        "label": $translate.instant('common.gridster.dragresize'),
                        "name": "gridsterDragResize",
                        "tooltip": $translate.instant('common.gridster.dragresizeTitle'),
                        "visibility": isDraggableResizable,
                        "image": "fa fa-arrows-alt",
                        'onClickCallback': _toggleDragResize
                    }


                ]
            };
        }

        lc.commandBarData = setCommandbar(false);

        function _toggleDragResize(command) {
            $rootScope.$broadcast('siemens.simaticit.common.services.layout.shell.gridster-resizable-draggable-changed', command.selected);
        }


        common.sidePanelManager.register(lc.openClose, lc.setTitle);

        function breadcrumbVisibility() {
            var stateChain = Object.keys($state.$current.includes);
            var currentState = $state.current;
            if (currentState.data && currentState.data.hasOwnProperty('displayBreadcrumb') && typeof currentState.data.displayBreadcrumb === "boolean") {
                lc.isBreadcrumbShown = currentState.data.displayBreadcrumb === true;
            } else {
                lc.isBreadcrumbShown = getParentBCValue(stateChain);
            }
        }

        function getParentBCValue(stateChain) {
            var isBreadcrumbShown = true;
            var i = stateChain.length - 2;
            for (i ; i >= 0; i--) {
                if (stateChain[i]) {
                    var state = $state.get(stateChain[i]);
                    if (state.data && state.data.hasOwnProperty('displayBreadcrumb') && typeof state.data.displayBreadcrumb === "boolean") {
                        isBreadcrumbShown = state.data.displayBreadcrumb === true;
                        break;
                    }
                }
            }
            return isBreadcrumbShown;
        }

        angular.element($window).on('resize', function () {
            $rootScope.$broadcast('sit-layout-change', { eventSource: 'layout' });
        });

        $rootScope.$on('$viewContentLoaded', breadcrumbVisibility);
    }


    myapp.controller(layoutCtrlName, ['$rootScope', '$state', '$translate', 'common', 'CONFIG', 'APPCONFIG', 'common.services.component.swacComponentManager', '$window',
        layoutController]);
})();
