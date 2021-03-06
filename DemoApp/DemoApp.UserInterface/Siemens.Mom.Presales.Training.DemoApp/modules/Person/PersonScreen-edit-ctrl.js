﻿(function () {
    'use strict';
    angular.module('Siemens.Mom.Presales.Training.DemoApp.Person').config(EditScreenStateConfig);

    EditScreenController.$inject = ['Siemens.Mom.Presales.Training.DemoApp.Person.PersonScreen.service', '$state', '$stateParams', 'common.base', '$filter', '$scope'];
    function EditScreenController(dataService, $state, $stateParams, common, $filter, $scope) {
        var self = this;
        var sidePanelManager, backendService, propertyGridHandler;

        activate();
        function activate() {
            init();
            registerEvents();

            sidePanelManager.setTitle('Edit');
            sidePanelManager.open('e');
        }

        function init() {
            sidePanelManager = common.services.sidePanel.service;
            backendService = common.services.runtime.backendService;

            //Initialize Model Data
            // TODO: Put here the properties of the entity managed by the service
            self.currentItem = angular.copy($stateParams.selectedItem);
            self.validInputs = false;

            //Expose Model Methods
            self.save = save;
            self.cancel = cancel;

            self.sexOptions = [{label:'Man', value:0},{label:'Woman',value:1},{label:'Man/Woman',value:2}]
            self.IsActive=[{label:"Active", checked: self.currentItem.IsActive}]
            self.ChangeBirthday = changebirthday;
        }

        function changebirthday(oldValue,newValue){
            var curDate = new Date();
            var selectedDate = new Date(newValue);
            var newdate = curDate.getTime() - selectedDate.getTime();
            self.currentItem.Age = Math.ceil(newdate/1000/60/60/24/365);
        }

        function registerEvents() {
            $scope.$on('sit-property-grid.validity-changed', onPropertyGridValidityChange);
        }

        function save() {
            self.currentItem.IsActive = self.IsActive[0].checked;
            dataService.update(self.currentItem).then(onSaveSuccess, backendService.backendError);
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

    EditScreenStateConfig.$inject = ['$stateProvider'];
    function EditScreenStateConfig($stateProvider) {
        var screenStateName = 'home.Siemens_Mom_Presales_Training_DemoApp_Person_PersonScreen';
        var moduleFolder = 'Siemens.Mom.Presales.Training.DemoApp/modules/Person';

        var state = {
            name: screenStateName + '.edit',
            url: '/edit/:id',
            views: {
                'property-area-container@': {
                    templateUrl: moduleFolder + '/PersonScreen-edit.html',
                    controller: EditScreenController,
                    controllerAs: 'vm'
                }
            },
            data: {
                title: 'Edit'
            },
            params: {
                selectedItem: null,
            }
        };
        $stateProvider.state(state);
    }
}());
