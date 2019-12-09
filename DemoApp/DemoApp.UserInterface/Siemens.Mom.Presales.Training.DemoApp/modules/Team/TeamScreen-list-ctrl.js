(function () {
    'use strict';
    angular.module('Siemens.Mom.Presales.Training.DemoApp.Team').config(ListScreenRouteConfig);

    ListScreenController.$inject = ['$q', 'common.services.runtime.SystemDataService','Siemens.Mom.Presales.Training.DemoApp.Team.TeamScreen.service', '$state', '$stateParams', '$rootScope', '$scope', 'common.base', 'common.services.logger.service','$translate','common.services.authentication'];
    function ListScreenController($q,systemDataService,dataService, $state, $stateParams, $rootScope, $scope, base, loggerService,$translate,authenticationService) {
        var self = this;
        var logger, rootstate, messageservice, backendService;

        activate();

        // Initialization function
        function activate() {
            logger = loggerService.getModuleLogger('Siemens.Mom.Presales.Training.DemoApp.Team.TeamScreen');

            init();
            initGridOptions();
            initGridData();
        }

        function init() {
            logger.logDebug('Initializing controller.......');

            rootstate = 'home.Siemens_Mom_Presales_Training_DemoApp_Team_TeamScreen';
            messageservice = base.widgets.messageOverlay.service;
            backendService = base.services.runtime.backendService;
            
            //Initialize Model Data
            self.selectedItem = null;
            self.isButtonVisible = false;
            self.viewerOptions = {};
            self.viewerData = [];

            //Expose Model Methods
            self.addButtonHandler = addButtonHandler;
            self.editButtonHandler = editButtonHandler;
            self.selectButtonHandler = selectButtonHandler;
            self.deleteButtonHandler = deleteButtonHandler;
            self.addPersonButtonHandler = addPersonButtonHandler;
            self.taddPersonButtonHandler = taddPersonButtonHandler;

            self.IsActive = getIsActiveValue();
            self.IsLeader = getIsLeaderValue();
            self.save = save;
            console.log('1111111111111111111111111111111111111111111111111');
            console.log(GetUserInfos());
        }

        function GetUserInfos() {
            var loggedUser = authenticationService.getUser();
            console.log('222222222222222222222222222222222222222222222222222');
            console.log(loggedUser);
            var def = $q.defer();
            var abc = systemDataService.findAll('User', "$filter=Name eq '" + loggedUser.unique_name + "'");
            console.log('3333333333333333333333333333333333333333333333333333');
            console.log(abc);
            abc.then(onSuccess, errorCallback);
            return def.promise;
            function onSuccess() {
                def.resolve(true);
            }

            function errorCallback(reject) {
                if (reject.data.error.errorCode === '3001') {
                    def.resolve(false); //Authorization failed for logged user. He is not assigned to AccessControlViewer or AccessControlAdmin Role and he doesn't belong to group SIT_UAF_SYSADMIN.
                    return;
                }
                def.resolve(true);
            }
        }

        function initGridOptions() {
            self.viewerOptions = {
                userPrefId: "TeamitemlistID",
                containerID: 'TeamitemlistID',
                selectionMode: 'single',
                viewOptions: 'gl',

                // TODO: Put here the properties of the entity managed by the service
                quickSearchOptions: { enabled: true, field: 'Name' },
                filterBarOptions:"sqfg",
                filterFields:[{field:'Name',displayName:'Name',type:'string'}
                ,{field:'Description',displayName:'Description',type:'string'},{field:'Number',displayName:'Number',type:'number'}
                ,{field:'IsLeader',displayName:'IsLeader',type:'boolean'}],
                sortInfo: {
                    field: 'Name',
                    direction: 'asc'
                },
                image: 'fa-cube',
                tileConfig: {
                    titleField: 'Name',
                    descriptionField: 'Description',
                    propertyFields: [
                      { field: 'Number', displayName: 'Number' },
                      { field: 'IsLeader',displayName: 'IsLeader'}]
                },
                gridConfig: {
                    // TODO: Put here the properties of the entity managed by the service
                    columnDefs: [
                        { field: 'Name', displayName: $translate.instant('Siemens.Mom.Presales.Training.DemoApp.Name') }, { field: 'Description', displayName: $translate.instant('Siemens.Mom.Presales.Training.DemoApp.Description') },{ field: 'Number', displayName: $translate.instant('Siemens.Mom.Presales.Training.DemoApp.Number')}, { field: 'IsLeader', displayName: $translate.instant('Siemens.Mom.Presales.Training.DemoApp.IsLeader')},{ field: 'IsActive', displayName: $translate.instant('Siemens.Mom.Presales.Training.DemoApp.IsActive') }
                    ]
                },
                onSelectionChangeCallback: onGridItemSelectionChanged,
                alwaysShowPager: false,
                enablePaging:true,
                pagingOptions: {
                    pageSizes: [5, 10, 25, 50, 100],
                    pageSize: 10,
                    currentPage: 1
                }
            }
        }

        function initGridData() {
            dataService.getAll().then(function (data) {
                if ((data) && (data.succeeded)) {
                    self.viewerData = data.value;
                } else {
                    self.viewerData = [];
                }
            }, backendService.backendError);
        }

        function addButtonHandler(clickedCommand) {
            $state.go(rootstate + '.add');
        }

        function addPersonButtonHandler() {
            $('#myModalRevoke').modal('show');
            return;
        }

        function getIsActiveValue(){
            return [{
                label: "IsActive",
                checked: false
              }];
        }

        function onSaveSuccess(data) {
            //$('#myModalRevoke').modal("close");
            $('#myModalRevoke').modal('hide');
            //$(".modal-backdrop.fade").hide();
            $state.go('^', {}, { reload: true });
        }

        function getIsLeaderValue(){
            return [{
                label: "IsLeader",
                checked: false
              }];
        }

        function registerEvents() {
            $scope.$on('sit-property-grid.validity-changed', onPropertyGridValidityChange);
        }

        function save() {
            self.currentItem.IsActive = self.IsActive[0].checked;
            self.currentItem.IsLeader = self.IsLeader[0].checked;
            dataService.create(self.currentItem).then(onSaveSuccess, backendService.backendError);
        }

        function taddPersonButtonHandler(clickedCommand) {
            $state.go(rootstate + '.addPersonToTeam', { id: self.selectedItem.Id, selectedItem: self.selectedItem });
        }

        function editButtonHandler(clickedCommand) {
            // TODO: Put here the properties of the entity managed by the service
            $state.go(rootstate + '.edit', { id: self.selectedItem.Id, selectedItem: self.selectedItem });
        }

        function selectButtonHandler(clickedCommand) {
            // TODO: Put here the properties of the entity managed by the service
            $state.go(rootstate + '.select', { id: self.selectedItem.Id, selectedItem: self.selectedItem });
        }

        function deleteButtonHandler(clickedCommand) {
            var title = "Delete";
            // TODO: Put here the properties of the entity managed by the service
            var text = "Do you want to delete '" + self.selectedItem.Name + "'?";

            backendService.confirm(text, function () {
                dataService.delete(self.selectedItem).then(function () {
                    $state.go(rootstate, {}, { reload: true });
                }, backendService.backendError);
            }, title);
        }

        function onGridItemSelectionChanged(items, item) {
            if (item && item.selected == true) {
                self.selectedItem = item;
                setButtonsVisibility(true);
            } else {
                self.selectedItem = null;
                setButtonsVisibility(false);
            }
        }

        // Internal function to make item-specific buttons visible
        function setButtonsVisibility(visible) {
            self.isButtonVisible = visible;
        }
    }

    ListScreenRouteConfig.$inject = ['$stateProvider'];
    function ListScreenRouteConfig($stateProvider) {
        var moduleStateName = 'home.Siemens_Mom_Presales_Training_DemoApp_Team';
        var moduleStateUrl = 'Siemens.Mom.Presales.Training_DemoApp_Team';
        var moduleFolder = 'Siemens.Mom.Presales.Training.DemoApp/modules/Team';

        var state = {
            name: moduleStateName + '_TeamScreen',
            url: '/' + moduleStateUrl + '_TeamScreen',
            views: {
                'Canvas@': {
                    templateUrl: moduleFolder + '/TeamScreen-list.html',
                    controller: ListScreenController,
                    controllerAs: 'vm'
                }
            },
            data: {
                title: 'Siemens.Mom.Presales.Training.DemoApp.Team',
                displayBreadcrumb: false
            },
            params: {
                newItem: null
            }
        };
        $stateProvider.state(state);
    }
}());
