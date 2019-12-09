(function () {
    'use strict';
    angular.module('Siemens.Mom.Presales.Training.DemoApp.Team').config(AddPersonToTeamConfig);
        
        AddPersonToTeamController.$inject=['Siemens.Mom.Presales.Training.DemoApp.Team.TeamScreen.service','Siemens.Mom.Presales.Training.DemoApp.Person.PersonScreen.service', '$q', '$state', '$stateParams', '$rootScope', '$scope', 'common.base', 'common.services.logger.service', '$translate', 'common.services.modelDriven.runtimeService', 'prEventDispatcherService'];
         function AddPersonToTeamController(dataService, personService,$q, $state, $stateParams, $rootScope, $scope, base, loggerService, $translate, mdRuntimeSvc, eventDispatcherService) {
            var self = this;
            var logger, backendService;
            var sidePanelManager = base.services.sidePanel.service;
            self.onCustomActionComplete = null;
            self.validInputs = true;
            self.cancel = cancel;
            self.title = $translate.instant('Siemens.Mom.Presales.Training.DemoApp.addToTeamTitle');

            var initObj = mdRuntimeSvc.initCustomAction(); //gets the callback function
            self.onCustomActionComplete = initObj && initObj.onExit ? initObj.onExit : null;
            sidePanelManager.setTitle($translate.instant('Siemens.Mom.Presales.Training.DemoApp.addToTeamTitle'));
            sidePanelManager.open('e'); //show the panel

            self.closeButton = {
                showClose: true,
                tooltip: $translate.instant("Siemens.Mom.Presales.Training.DemoApp.Cancel"),
                onClick: self.cancel
            };

            activate();

            // Initialization function
            function activate() {
                logger = loggerService.getModuleLogger('Siemens.Mom.Presales.Training.DemoApp.Team');

                init();
            }

            function init() {
                backendService = base.services.runtime.backendService;

                //Expose Model Methods
                self.addPersonButtonHandler = addPersonButtonHandler;
                self.removeButtonHandler = removeButtonHandler;
                self.removeSingleElement = removeSingleElement;

                //Initialize Model Data
                self.selectedItem = [];
                self.isButtonVisible = false;
                self.viewerOptions = {};
                self.viewerData = [];
                self.PersonsData = [];
                self.currentItem = angular.copy($stateParams.selectedItem);
                self.currentGroupId =  self.currentItem.Id;
                // self.currentGroupNId = $stateParams.personGroup.NId;

                initGridData();
                initGridOptions();
                initEntityPickerOptions();
                setActionButtons();


            }

            function setActionButtons() {
                self.actionButtons = [
                                    {
                                        label: $translate.instant("Siemens.Mom.Presales.Training.DemoApp.Cancel"),
                                        tooltip: $translate.instant("Siemens.Mom.Presales.Training.DemoApp.Cancel"),
                                        onClick: self.cancel,
                                        enabled: true,
                                        visible: true
                                    }
                ];
            };

            function cancel() {
                sidePanelManager.close();
                $state.go('^', {}, { reload: false });
            }

            function initGridOptions() {
                self.viewerOptions = {
                    containerID: 'itemlist',
                    multiSelect: true,
                    selectionMode: 'multi',
                    viewOptions: '',
                    viewMode: 'g',
                    showRowHighlight: true,
                    quickSearchOptions: {
                        enabled: true,
                        field: 'FirstName',
                        filterText: ''
                    },
                    sortInfo: {
                        field: 'FirstName',
                        direction: 'asc',
                        fields: [
                            { field: 'FirstName', displayName: $translate.instant('Siemens.Mom.Presales.Training.DemoApp.Pserson.FirstName') },
                            { field: 'LastName', displayName: $translate.instant('Siemens.Mom.Presales.Training.DemoApp.Pserson.LastName') }
                        ]
                    },
                    image: 'svg cmdUser24',
                    gridConfig: {
                        showSelectionCheckbox: true,
                        columnDefs: [
                            {field: 'FirstName', displayName: 'FirstName'},
                            {field: 'LastName', displayName: 'LastName'},
                            {field: 'Sex', displayName: 'Sex',cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()"><span>{{row.entity.Sex === 0 ? "男" : row.entity.Sex === 1 ? "女" : "其它"}} <\span></div>'},
                            {field: 'Age', displayName: 'Age'},
                            {field: 'Birthday', displayName: 'Birthday',cellFilter: 'date:\'yyyy-MM-dd\'', resizable: true,sortable: true,width : 100},
                            {field: 'IsActive', displayName: 'IsActive'}
                        ]
                    },
                    onSelectionChangeCallback: onGridItemSelectionChanged
                }
            }

            function initEntityPickerOptions() {
                self.entityPickerConfig = {
                    disableEP: false,
                    id: "entityPickerId",
                    datasource: function (searchString) {
                        return getPersonGridData({ options: "$top=50&$filter=startswith(NId, '" + replaceSpecialCharacters(searchString) + "') eq true and (Teams/all(w: w/Id ne " + self.currentGroupId + "))&$expand=Teams" }).then(function (data) {
                            return data;
                        });
                    },
                    limit: 5,
                    waitTime: 500,
                    placeholder: $translate.instant('SIT.PRGR.entityPickerPlaceHolder'),
                    attributetodisplay: "FirstName",
                    entityValue: "",
                    editable: true,
                    required: false,
                    icvOptions: getEntityPickerGridOptions()
                }

                function getEntityPickerGridOptions() {
                    return {
                        gridConfig: {
                            columnDefs: [
                                {field: 'FirstName', displayName: 'FirstName'},
                                {field: 'LastName', displayName: 'LastName'},
                                {field: 'Sex', displayName: 'Sex',cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()"><span>{{row.entity.Sex === 0 ? "男" : row.entity.Sex === 1 ? "女" : "其它"}} <\span></div>'},
                                {field: 'Age', displayName: 'Age'},
                                {field: 'Birthday', displayName: 'Birthday',cellFilter: 'date:\'yyyy-MM-dd\'', resizable: true,sortable: true,width : 100},
                                {field: 'IsActive', displayName: 'IsActive'}
                            ]
                        },
                        quickSearchOptions: {
                            enabled: true,
                            field: 'FirstName',
                            filterText: ''
                        },
                        sortInfo: {
                            field: 'FirstName',
                            direction: 'asc',
                            fields: [
                                { field: 'FirstName', displayName: $translate.instant('SIT.PRGR.personGroup.id') }
                            ]
                        },
                        pagingOptions: {
                            pageSizes: [5, 10, 25, 50, 100],
                            pageSize: 10,
                            currentPage: 1
                        },
                        selectStyle: 'alternate',
                        selectionMode: 'single',
                        viewMode: 'g',//g: Shows data in a grid.
                        viewOptions: '',//UI elements to be shown in the viewbar
                        serverDataOptions: {
                            dataService: personService,
                            dataEntity: 'Person',
                            optionsString: "",
                            appName: 'DemoApp',
                            onBeforeDataLoadCallBack: function (data) {
                                var top = data.pageSize;
                                var skip = data.pageSize * (data.currentPage - 1);
                                var fixedOption = '(Teams/Id ne ' + self.currentGroupId + ')&$expand=Teams';
                                var filter = (data.searchText) ? ("$filter=contains(" + data.searchField + ",'" + data.searchText + "')" + " and " + fixedOption) : ("$filter=" + fixedOption);
                                return '$top=' + top + '&$skip=' + skip + '&$count=true' + '&' + filter;
                            }
                        }
                    };
                }
            }

            function onSelectionChangeCallback() {
                self.selectedPersons = self.viewerOptions.selectedItem.Id;
            }

            function initGridData() {
                var params = {
                    options: "$filter=(Teams/Id eq " + self.currentGroupId + ")&$expand=Teams"
                    //options: "$filter=(Teams/any(w: w/Id eq " + self.currentGroupId + "))&$expand=Teams",
                };
                personService.findAll(params).then(function (data) {
                    if ((data) && (data.succeeded)) {
                        self.viewerData = data.value;
                    } else {
                        self.viewerData = [];
                    }
                }, backendService.backendError);
            }

            function getPersonGridData(options) {
                var defer = $q.defer();
                personService.findAll(options).then(function (data) {
                    defer.resolve(data.value);
                }, function (error) {
                    defer.reject(error);
                })
                return defer.promise;
            }

            function addPersonButtonHandler(clickedCommand) {
                if (self.entityPickerConfig.entityValue != null && self.entityPickerConfig.entityValue.Id != null) {
                    dataService.assign(self.currentGroupId, [self.entityPickerConfig.entityValue.Id]).then(function () {
                        initGridData();
                        self.entityPickerConfig.entityValue = null;
                    }, backendService.backendError);
                } else {
                    if (self.entityPickerConfig.entityValue == null || self.entityPickerConfig.entityValue === "") {
                        backendService.genericError($translate.instant('SIT.PRGR.personIsNotSelected'), $translate.instant('SIT.PR.common.error'));
                    }
                    else {
                        var personIdValue = self.entityPickerConfig.entityValue;
                        backendService.genericError($translate.instant('SIT.PRGR.personSelectedIsNotValid', { personId: personIdValue }),
                                       $translate.instant('SIT.PR.common.error'));
                    }
                }
            }

            function removeButtonHandler(clickedCommand) {
                var title = $translate.instant('SIT.PRGR.remove');
                var text = $translate.instant('SIT.PRGR.remove_confirmation');
                backendService.confirm(text, function () {
                    dataService.unassing(self.currentGroupId, self.selectedItem).then(function () {
                        initGridData();
                        setButtonsVisibility(false);
                    }, backendService.backendError);
                }, title);
            }

            function removeSingleElement(id) {
                var title = $translate.instant('SIT.PRGR.remove');
                var text = $translate.instant('SIT.PRGR.remove_confirmation');
                var item = [id];
                backendService.confirm(text, function () {
                    dataService.unassing(self.currentGroupId, item).then(function () {
                        initGridData();
                        setButtonsVisibility(false);
                    }, backendService.backendError);
                }, title);
            }

            function onGridItemSelectionChanged(items, item) {
                if (items.length > 0) {
                    self.selectedItem = [];
                    for (var i = 0; i < items.length; i++) self.selectedItem.push(items[i].Id);
                    setButtonsVisibility(true);
                } else {
                    self.selectedItem = [];
                    setButtonsVisibility(false);
                }
            }

            function setButtonsVisibility(visible) {
                self.isButtonVisible = visible;
            }

            function replaceSpecialCharacters(string) {
                string = string.replace(/'/g, "''");
                string = string.replace(/%/g, "%25");
                string = string.replace(/\+/g, "%2B");
                string = string.replace(/\//g, "%2F");
                string = string.replace(/\?/g, "%3F");
                string = string.replace(/#/g, "%23");
                string = string.replace(/&/g, "%26");
                return string;
            }

        }

        AddPersonToTeamConfig.$inject = ['$stateProvider'];
        function AddPersonToTeamConfig($stateProvider) {
        var screenStateName = 'home.Siemens_Mom_Presales_Training_DemoApp_Team_TeamScreen';
        var moduleFolder = 'Siemens.Mom.Presales.Training.DemoApp/modules/Team';

        var state = {
            name: screenStateName + '.addPersonToTeam',
            url: '/addPersonToTeam',
            views: {
                'property-area-container@': {
                    templateUrl: moduleFolder + '/TeamScreen-Person-Add-list.html',
                    controller: AddPersonToTeamController,
                    controllerAs: 'vm'
                }
            },
            data: {
                title: ''
            },
            params: {
                selectedItem: null,
            }
        };
        $stateProvider.state(state);
    }
}());