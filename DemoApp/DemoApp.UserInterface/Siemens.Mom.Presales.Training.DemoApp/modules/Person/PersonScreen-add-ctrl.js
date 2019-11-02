(function () {
    'use strict';
    angular.module('Siemens.Mom.Presales.Training.DemoApp.Person').config(AddScreenStateConfig);

    AddScreenController.$inject = ['Siemens.Mom.Presales.Training.DemoApp.Person.PersonScreen.service', '$state', '$stateParams', 'common.base', '$filter', '$scope'];
    function AddScreenController(dataService, $state, $stateParams, common, $filter, $scope) {
        var self = this;
        var sidePanelManager, backendService, propertyGridHandler;
        
        activate();
        function activate() {
            init();
            registerEvents();

            sidePanelManager.setTitle('Add');
            sidePanelManager.open('e');
        }

        function init() {
            sidePanelManager = common.services.sidePanel.service;
            backendService = common.services.runtime.backendService;

            //Initialize Model Data
            self.currentItem = null;
            self.validInputs = false;

            //Expose Model Methods
            self.save = save;
            self.cancel = cancel;

            self.sexOptions = [{label:'Man', value:0},{label:'Woman',value:1},{label:'Man/Woman',value:2}]
            self.IsActive=[{label:"Active", checked: false}]
            self.ChangeBirthday = changebirthday;
        }

        function changebirthday(oldValue,newValue){
            var curDate = new Date();
            var selectedDate = new Date(newValue);
            var newdate = curDate.getTime() - selectedDate.getTime();
            self.ChangeAge = Math.ceil(newdate/1000/60/60/24/365);
        }

        function registerEvents() {
            $scope.$on('sit-property-grid.validity-changed', onPropertyGridValidityChange);
        }

        function save() {
            self.currentItem.IsActive = self.IsActive[0].checked;
            self.currentItem.Age = self.ChangeAge;
            dataService.create(self.currentItem).then(onSaveSuccess, backendService.backendError);
        }

        function cancel() {
            sidePanelManager.close();
            $state.go('^');
        }

        function onSaveSuccess(data) {
            sidePanelManager.close();
            $state.go('^', {}, { reload: true });
        }

        function onPropertyGridValidityChange(event, params) {
            self.validInputs = params.validity;
        }
    }

    AddScreenStateConfig.$inject = ['$stateProvider'];
    function AddScreenStateConfig($stateProvider) {
        var screenStateName = 'home.Siemens_Mom_Presales_Training_DemoApp_Person_PersonScreen';
        var moduleFolder = 'Siemens.Mom.Presales.Training.DemoApp/modules/Person';

        var state = {
            name: screenStateName + '.add',
            url: '/add',
            views: {
                'property-area-container@': {
                    templateUrl: moduleFolder + '/PersonScreen-add.html',
                    controller: AddScreenController,
                    controllerAs: 'vm'
                }
            },
            data: {
                title: 'Add'
            }
        };
        $stateProvider.state(state);
    }
}());
