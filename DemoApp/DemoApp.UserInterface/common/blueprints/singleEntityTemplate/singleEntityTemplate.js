/* SIMATIC IT Unified Architecture Foundation V3.0 | Copyright (C) Siemens AG 2019. All Rights Reserved. */
(function () {
    'use strict';
    var ctrl = "common.layout.modelDriven.template.SECtrl";
    angular.module('siemens.simaticit.common.services.modelDriven')
        /**
          * @ngdoc controller
          * @name common.layout.modelDriven.template.SECtrl
          * @module siemens.simaticit.common.services.modelDriven
          * @access public
          * @description
          * The controller for the MD single entity template
          *
          */
        .controller(ctrl, ['$state', '$rootScope', '$translate', '$timeout', 'common.base', 'common.services.modelDriven.service', 'common.services.modelDriven.runtimeService',
            '$stateParams', 'common.services.modelDriven.contextService', 'common.services.swac.SwacUiModuleManager',
            function ($state, $rootScope, $translate, $timeout, base, md, mdrt, $stateParams, mdContextSrv, swacMgr) {
                var self = this, detailName = "", stateId = $state.$current.toString(), masterName = "";
                self.isInitComplete = false;
                //reset sidepanel state
                mdContextSrv.setPropertyPanelState(false, null);

                md.getManifest().then(function (manifest) { // Assuming manifest has already been retrieved.
                    var screen = manifest.states.filter(function (s) { return s.id === stateId; })[0];
                    self.isDrillDownState = screen.type === "drill-down" ? true : false;
                    if (screen.type === "drill-down" && screen.referenceState) {
                        screen = manifest.states.filter(function (s) { return s.id === screen.referenceState; })[0]
                    }

                    self.mdView = { "params": {} };
                    self.screenTitle = $translate.instant(screen.header) || screen.title;
                    if (swacMgr.enabled) {
                        swacMgr.contextServicePromise.promise.then(function (service) {
                            service.updateCtx('location.titles', { headerTitle: self.screenTitle });
                        });
                    }
                    self.mdViewCtrl = new mdrt.ModelViewCtrl(screen, self.mdView, $stateParams);

                    //Reoder contents to simplify layout management
                    self.newObj = {
                        actions: self.mdViewCtrl.commandBars[0]
                    };
                    //Create newObj.master for html template bind
                    for (detailName in self.mdView.contents) {
                        if (self.mdView.contents[detailName].master) {
                            if (self.mdView.contents[detailName].multiplicity === "many") {
                                self.newObj.master = self.mdView.contents[detailName];
                                self.mdViewCtrl.setActiveContent(detailName);
                                break;
                            }
                        }
                    }
                    if (!self.newObj.master) { //master not specified
                        for (detailName in self.mdView.contents) { //use first valid content
                            if (self.mdView.contents[detailName].multiplicity === "many") {
                                self.newObj.master = self.mdView.contents[detailName];
                                self.mdViewCtrl.setActiveContent(detailName);
                                break;
                            }
                        }
                    }
                    if (self.newObj.master) {
                        masterName = self.newObj.master.id;
                        var stateInfo = self.mdViewCtrl.getStateInfo(stateId);
                        if (stateInfo && stateInfo.selectionId) {
                            self.mdView.params[masterName] = stateInfo.selectionId;
                        }

                        if (self.mdViewCtrl[masterName]) {
                            self.mdViewCtrl[masterName].onContentSelection = function () {  //content selection
                                if (!self.isDrillDownState) {
                                    self.mdViewCtrl.setStateInfo(stateId, null, null);
                                }
                                self.mdViewCtrl.commandBars[0].refresh(); //reevaluate command expression
                            };
                            self.mdViewCtrl[masterName].onTileOpenClick = function (tileContent, destScreen, drillDownParams) {
                                //set the state info for current screen
                                self.mdViewCtrl.setStateInfo(stateId, tileContent.Id, null);
                                //set the state info for destination screen
                                var destScreenId = stateId + '.' + destScreen;
                                self.mdViewCtrl.setStateInfo(destScreenId, tileContent.Id, null);
                                $state.go(destScreenId, drillDownParams);
                            };
                        }
                        // Initialization function
                        var init = function () {
                            self.mdViewCtrl.commandBars[0].refresh();
                            self.mdViewCtrl[masterName].refresh();
                        };
                        init();
                    }
                    $timeout(function () {
                        self.isInitComplete = true;
                    }, 50);
                });
            }]);
}());
