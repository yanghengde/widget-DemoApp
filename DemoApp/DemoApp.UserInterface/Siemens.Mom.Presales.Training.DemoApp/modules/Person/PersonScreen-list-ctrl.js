(function () {
    'use strict';
    angular.module('Siemens.Mom.Presales.Training.DemoApp.Person').config(ListScreenRouteConfig);

    ListScreenController.$inject = ['Siemens.Mom.Presales.Training.DemoApp.Person.PersonScreen.service', '$state', '$stateParams', '$rootScope', '$scope', 'common.base', 'common.services.logger.service'];
    function ListScreenController(dataService, $state, $stateParams, $rootScope, $scope, base, loggerService) {
        var self = this;
        var logger, rootstate, messageservice, backendService;

        activate();

        // Initialization function
        function activate() {
            logger = loggerService.getModuleLogger('Siemens.Mom.Presales.Training.DemoApp.Person.PersonScreen');

            init();
            initGridOptions();
            initGridData();
        }

        function init() {
            logger.logDebug('Initializing controller.......');

            rootstate = 'home.Siemens_Mom_Presales_Training_DemoApp_Person_PersonScreen';
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
        }

        function initGridOptions() {
            self.viewerOptions = {
                userPrefId:"PersonitemlistID",
                containerID: 'PersonitemlistID',
                selectionMode: 'single',
                viewOptions: 'gl',

                // TODO: Put here the properties of the entity managed by the service
                quickSearchOptions: { enabled: true, field: 'FirstName' },
                filterBarOptions:"sqfg",
                filterFields:[
                    {field:'FirstName',displayName:'FirstName',type:'string'},
                    {field:'LastName',displayName:'LastName',type:'string'},
                    {field:'Birthday',displayName:'Birthday',type:'date'},
                    {field:'Age',displayName:'Age',type:'number'}],
                sortInfo: {
                    field: 'First',
                    direction: 'asc'
                },
                image: 'fa-car',//image: 'fa-cube',
                tileConfig: {
                    titleField:'FirstName',
                    descriptionField: 'LastName',
                    propertyFields: [
                      { field: 'LastName', displayName: 'LastName' },
                      { field: 'Birthday',displayName: 'Birthday'}]
                },
                gridConfig: {
                    // TODO: Put here the properties of the entity managed by the service
                    columnDefs: [
                        {field: 'FirstName', displayName: 'FirstName'},
                        {field: 'LastName', displayName: 'LastName'},
                        {field: 'Sex', displayName: 'Sex',cellTemplate: '<div class="ngCellText" ng-class="col.colIndex()"><span>{{row.entity.Sex === 0 ? "男" : row.entity.Sex === 1 ? "女" : "其它"}} <\span></div>'},
                        {field: 'Age', displayName: 'Age'},
                        {field: 'Birthday', displayName: 'Birthday',cellFilter: 'date:\'yyyy-MM-dd\'', resizable: true,sortable: true,width : 100},
                        {field: 'IsActive', displayName: 'IsActive'}
                    ]
                },
                onSelectionChangeCallback: onGridItemSelectionChanged, 
                alwaysShowPager: false,
                enablePaging: true,
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
            var text = "Do you want to delete '" + self.selectedItem.Id + "'?";

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
        var moduleStateName = 'home.Siemens_Mom_Presales_Training_DemoApp_Person';
        var moduleStateUrl = 'Siemens.Mom.Presales.Training_DemoApp_Person';
        var moduleFolder = 'Siemens.Mom.Presales.Training.DemoApp/modules/Person';

        var state = {
            name: moduleStateName + '_PersonScreen',
            url: '/' + moduleStateUrl + '_PersonScreen',
            views: {
                'Canvas@': {
                    templateUrl: moduleFolder + '/PersonScreen-list.html',
                    controller: ListScreenController,
                    controllerAs: 'vm'
                }
            },
            data: {
                title: 'PersonScreen'
            }
        };
        $stateProvider.state(state);
    }
}());
