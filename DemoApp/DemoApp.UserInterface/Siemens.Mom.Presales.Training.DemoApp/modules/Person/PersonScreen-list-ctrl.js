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
            //initGridData();

            testReadingFunctionHandler();
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
            self.filter='';
            self.selectedRows = [];
            self.readfunctionValue = [];

            //Expose Model Methods
            self.addButtonHandler = addButtonHandler;
            self.editButtonHandler = editButtonHandler;
            self.selectButtonHandler = selectButtonHandler;
            self.deleteButtonHandler = deleteButtonHandler;
        }

        //测试ReadingFunction的取值
        function testReadingFunctionHandler() {			
            backendService.read(
            {
                appName: "DemoApp",
                functionName: "GetPersons",
                params: {
                            FirstName:'hengde'
                        },
                options: ""
            })
            .then(function (data){
                backendService.result = data;
                self.readfunctionValue = data.value;
            }, backendService.backendError);
        }
        

        function initGridOptions() {
            self.viewerOptions = {
                userPrefId:"PersonitemlistID",
                containerID: 'PersonitemlistID',
                selectionMode: 'multi',
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
                    field: 'FirstName',
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
                    showSelectionCheckbox: true,
                    groupsCollapsedByDefault: false,
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
                onPageChangedCallback: onPageChangedCallback,
                enablePaging: true,
                pagingOptions: {
                    pageSizes: [5, 10, 25, 50, 100],
                    pageSize: 10,
                    currentPage: 1
                },
                enableResponsiveBehaviour: true,
                serverDataOptions: {
                    dataService: getDataService(),
                    appName: 'DemoApp',
                    dataEntity: 'Person',
                    optionsString: ''
                }
            }
        }

        function onPageChangedCallback(pageNumber) {
            self.viewerOptions.pagingOptions.currentPage = pageNumber;
            if (self.onPageChanged) self.onPageChanged({ pageNumber: pageNumber });
        }

        function getDataService() {
            return {
                findAll: findAll
            };

            function findAll(opt) {
                var options = opt.options;
                return dataService.findAll(options);
            }
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
            if (self.onRowSelectionChanged) self.onRowSelectionChanged({ rows: items, row: item });
            self.selectedRows = items;

            console.log(self.readfunctionValue); //测试打印ReadingFunction的值
            console.log(self.selectedRows);
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
