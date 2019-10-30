/* SIMATIC IT Unified Architecture Foundation V3.0 | Copyright (C) Siemens AG 2019. All Rights Reserved. */
(function () {
    'use strict';

    /**
     * @ngdoc module
     * @name siemens.simaticit.common.widgets.characteristicRepr
     * @description
     * This module provides functionalities related to Caracteristic Represenation (Quality Execution).
     */
    angular.module('siemens.simaticit.common.widgets.characteristicRepr', []);

})();

(function () {
    'use strict';

    angular.module('siemens.simaticit.common.widgets.characteristicRepr')
        .directive('characteristicRepr', characteristicRepr);

    characteristicRepr.$inject = ['$state', '$stateParams', '$rootScope', 'common.services.runtime.backendService'];
    characteristicReprController.$inject = ['$state', '$scope', '$translate', 'common.services.runtime.backendService', 'siemens.simaticit.common.characteristicReprService', 'common.widgets.notificationTile.globalService'];
    function characteristicRepr($state, $stateParams, $rootScope, backendService) {
        return {
            restrict: 'E',
            replace: true,
            controller: characteristicReprController,
            controllerAs: 'vm',
            templateUrl: 'common/widgets/characteristicRepr/characteristic-repr-dir.html',
            bindToController: {
                crId: '@',
                containerId: '@',
                context: '@',
                mtu: '@',
                notifyViolations:'@'
            },
            scope: {}
        };
    }

    function characteristicReprController($state, $scope, $translate, backendService, characteristicReprService, notificationTileGlobalService) {

        var vm = this;
        vm.isenabled = false;
        vm.currentStateName = $state.current.name + "";
        vm.viewerData = [];
        vm.InspectionContext = {};
        vm.Specification = {};
        vm.InspectionContext = {};
        vm.IsVisual = false;
        vm.IsAttributive = false;
        vm.IsVariable = false;
        vm.HasValue = false;
        vm.Quantity = null;
        vm.HasAttribute = false;
        if (vm.notifyViolations == undefined) {
            vm.notifyViolations = true;
        }
        vm.DisplayInfoBadge = false;
        vm.InitSample = InitSample;
        vm.SaveSample = SaveSample;
        vm.ValueChanged = ValueChanged;
        vm.SaveVisualSample = SaveVisualSample;
        vm.SetTooltipPosition = SetTooltipPosition;
        vm.FailuresToBeUpdated = [];
        vm.propertyGridId = "pgridid";
        vm.Details = $translate.instant('characteristicRepr.Details')
        vm.propertyGridData = [
           
        ];

        $scope.$watch('vm.containerId', function (newVal, oldVal) {
            getViewerData();
        });



        function GetSpecification() {
            vm.IsAttributive = false;
            vm.IsVariable = false;
            vm.HasValue = false;
            characteristicReprService.GetCharacteristicSpecification(vm.Id).then(function (data) {
                vm.Specification = data.value[0];
                vm.IsVisual = vm.Specification.CharacteristicSpecification.EntityType.indexOf('VisualCharacteristicSpecification') != -1;
                vm.IsAttributive = vm.Specification.CharacteristicSpecification.EntityType.indexOf('AttributiveCharacteristicSpecification') != -1;
                vm.IsVariable = vm.Specification.CharacteristicSpecification.EntityType.indexOf('VariableCharacteristicSpecification') != -1;
                GetInspectionContext();
                GeneratePgridData();
                vm.propertyGridId = vm.Specification.Id;
            }, backendService.error);
        }

        function GeneratePgridData() {
            vm.propertyGridData = [
                {
                    label: $translate.instant('characteristicRepr.Name'),
                    value: vm.Specification.Name
                }, {
                    label: $translate.instant('characteristicRepr.Description'),
                    value: vm.Specification.CharacteristicSpecification.Description
                },
                {
                    label: $translate.instant('characteristicRepr.NId'),
                    value: vm.Specification.CharacteristicSpecification.NId
                },
                {
                    label: $translate.instant('characteristicRepr.Revision'),
                    value: vm.Specification.CharacteristicSpecification.Revision
                },
                {
                    label: $translate.instant('characteristicRepr.Criticality'),
                    value: vm.Specification.CharacteristicSpecification.CriticalityNId
                },
                {
                    label: $translate.instant('characteristicRepr.SpecifictionName'),
                    value: vm.Specification.CharacteristicSpecification.Name
                },
                {
                    label: $translate.instant('characteristicRepr.SpecifictionDescription'),
                    value: vm.Specification.CharacteristicSpecification.Description
                },
                {
                    label: $translate.instant('characteristicRepr.EquipmentNId'),
                    value: vm.context.EquipmentNId
                },
                {
                    label: $translate.instant('characteristicRepr.MTU'),
                    value: vm.mtu
                },
                {
                    label: $translate.instant('characteristicRepr.RuntimeChrRepresentationNId'),
                    value: vm.context.RuntimeChrRepresentationNId
                },
                {
                    label: $translate.instant('characteristicRepr.MaterialNId'),
                    value: vm.context.MaterialNId
                },
                {
                    label: $translate.instant('characteristicRepr.MaterialRevision'),
                    value: vm.context.MaterialRevision
                }
                ];

            if (vm.IsVariable) {
                vm.propertyGridData.push({
                    label: $translate.instant('characteristicRepr.NominalValue'),
                    value: vm.Specification.CharacteristicSpecification.NominalValue.QuantityValue
                });
                vm.propertyGridData.push({
                    label: $translate.instant('characteristicRepr.UoM'),
                    value: vm.Specification.CharacteristicSpecification.NominalValue.UoMNId
                });
                vm.propertyGridData.push({
                    label: $translate.instant('characteristicRepr.UpperTolerance'),
                    value: vm.Specification.CharacteristicSpecification.UpperTolerance.QuantityValue
                });
                vm.propertyGridData.push({
                    label: $translate.instant('characteristicRepr.LowerTolerance'),
                    value: vm.Specification.CharacteristicSpecification.LowerTolerance.QuantityValue
                });
            }

            if (vm.IsVisual) {
                vm.propertyGridData.push({
                    label: $translate.instant('characteristicRepr.PotentialFailures'),
                    value: vm.Specification.CharacteristicSpecification.CharacterisicFailureAssociations.length
                });
            }
        }

        function GetActualValues(samples) {
            var actualvalue;
            angular.forEach(samples,
                function(value, key) {
                    var firstValue = value.InspectionValues[0];
                    if (firstValue != null) {
                        if (firstValue.MTUNId === vm.mtu) {
                            actualvalue = value;
                        }
                    }
                    var firstFailure = value.VisualDetectedFailures[0];
                    if (firstFailure != null) {
                        if (firstFailure.MTUNId === vm.mtu) {
                            actualvalue = value;
                        }
                    }
                });
            return actualvalue;
        }


        function GetInspectionContext() {
            characteristicReprService.GetInspectionContext(vm.context).then(function (data) {
                if (data.value.length > 0) {
                    vm.InspectionContext = data.value[0];
                    if (vm.InspectionContext.InspectionSamples.length > 0) {
                        // vm.ActualValue = vm.InspectionContext.InspectionSamples[0].InspectionValues.length > 0 ? vm.InspectionContext.InspectionSamples[0].InspectionValues[0] : null;
                        vm.ActualValue = GetActualValues(vm.InspectionContext.InspectionSamples);
                        if (null !== vm.ActualValue) {
                            if (vm.IsVariable) {
                                vm.Quantity = vm.ActualValue.InspectionValues[0].MeasuredVariableValue;
                                vm.DisplayInfoBadge = vm.Quantity < vm.Specification.CharacteristicSpecification.LowerTolerance.QuantityValue ||
                                                        vm.Quantity > vm.Specification.CharacteristicSpecification.UpperTolerance.QuantityValue;
                            }
                            if (vm.IsAttributive) {
                                vm.HasAttribute = vm.ActualValue.InspectionValues[0].MeasuredAttributeValue;
                            }

                            if (vm.IsVisual) {
                                var visualSamples = vm.ActualValue.VisualDetectedFailures;
                                angular.forEach(visualSamples, function (value, key) {
                                    vm.FailuresToBeUpdated.push({ Id: value.Id, FailureNId: value.FailureNId, Count: value.Count });
                                    angular.element("#failure_" + value.FailureNId)[0].value = value.Count;
                                });
                            }
                        }
                    }
                    else {
                        vm.DisplayInfoBadge = false;
                        vm.ActualValue = null;
                        vm.Quantity = null;
                    }
                }
                else {
                    CreateInspectionContext();
                }
            }, backendService.error);
        }

        function CreateInspectionContext() {
            characteristicReprService.CreateInspectionContext(vm.context).then(function (value) {
                var InspectionContextId = value.data.Id;
                characteristicReprService.GetInspectionContextById(InspectionContextId).then(function (data) {
                    if (data.value.length > 0)
                        vm.InspectionContext = data.value[0];                     
                }, backendService.error);
            }, backendService.error);
        }

        var sampleElement = undefined;

        function InitSample($event) {

            sampleElement = angular.element($event.target);

            return true;
        }

        function ValueChanged() {

            if (!vm.notifyViolations) {

                return false;
            }

            if (vm.Quantity == undefined) {

                return false;
            }

            vm.DisplayInfoBadge = vm.Quantity < vm.Specification.CharacteristicSpecification.LowerTolerance.QuantityValue ||
                vm.Quantity > vm.Specification.CharacteristicSpecification.UpperTolerance.QuantityValue;
        }

        function SaveSample() {

            var validsample = false;

            if (vm.ActualValue != null) {
                var sampleupdatevalue = {
                    Id: vm.ActualValue.InspectionValues[0].Id
                };

                if (vm.Quantity !== null) {
                    sampleupdatevalue.MeasuredVariableValue = vm.Quantity;
                    validsample = true;            
                }

                if (vm.IsAttributive) {
                    sampleupdatevalue.MeasuredAttributeValue = vm.HasAttribute;
                    validsample = true;
                }

                if (validsample) {
                    characteristicReprService.UpdateInspectionValue(sampleupdatevalue).then(function (value) {
                        notificationTileGlobalService.info($translate.instant("characteristicRepr.sampleupdated")); 
                    }, backendService.error);
                }
                return;
            }

            var samplevalue = {
                InspectionAcquisitionContextId: vm.InspectionContext.Id,
                MTUNId: vm.mtu
            }

            if (vm.Quantity !== null) {
                samplevalue.MeasuredVariableValue = vm.Quantity;
                validsample = true;
            }

            if (vm.IsAttributive) {
                samplevalue.MeasuredAttributeValue = vm.HasAttribute;
                validsample = true;
            }

            if (validsample) {
                var runtimeChrRepresentationNId = vm.context.RuntimeChrRepresentationNId;
                characteristicReprService.CreateInspectionValue(samplevalue).then(function (value) {
                    notificationTileGlobalService.info($translate.instant("characteristicRepr.samplesaved"));
                    var inspectionContextId = samplevalue.InspectionAcquisitionContextId;
                    characteristicReprService.GetInspectionContextById(inspectionContextId).then(function (data) {
                        if (data.value.length > 0 && runtimeChrRepresentationNId == vm.context.RuntimeChrRepresentationNId) {
                            vm.InspectionContext = data.value[0];
                            vm.ActualValue = GetActualValues(vm.InspectionContext.InspectionSamples);
                        }
                        else if (vm.ActualValue == null) {
                            vm.DisplayInfoBadge = false;
                            vm.Quantity = null;
                        }
                    }, backendService.error);
                }, backendService.error);
            }
        }

       

        function SetTooltipPosition() {

            $(".icon-text").each(function (index) { $(this).css('left', -5 - $(this).width() * (1 - 1 / 1.618)) })
        }

        function SaveVisualSample() {

            angular.forEach(vm.Specification.CharacteristicSpecification.CharacterisicFailureAssociations, function (value, key) {

                var count = angular.element("#failure_" + value.NId)[0].value;
                var failurenid = value.NId;
                count = Number.parseInt(count);
                var visualvalue = {
                    InspectionAcquisitionContextId: vm.InspectionContext.Id,
                    MTUNId: vm.mtu,
                    FailureNId: failurenid,
                    Count: count
                }

                var found = _.findWhere(vm.FailuresToBeUpdated, { FailureNId: value.NId });
                if (found && found.Count != count) {
                    characteristicReprService.UpdateVisualDetectedFailure({ Id: found.Id, Count: count }).then(function (value) {
                        notificationTileGlobalService.info($translate.instant("characteristicRepr.sampleupdated"));
                    }, backendService.error);
                    return;
                }


                if (typeof found !== "undefined") return;

                if (isNaN(count)) return;

                characteristicReprService.CreateVisualDetectedFailure(visualvalue).then(function (value) {
                    notificationTileGlobalService.info("Sample saved");//TODO: translate string
                    vm.FailuresToBeUpdated.push({ Id: value.data.Id, FailureNId: failurenid, Count: count });
                }, backendService.error);

            });
        }

        function getViewerData() {
            if (vm.containerId === "" || vm.containerId.indexOf('{') !== -1) return;
            characteristicReprService.GetCharacteristicRepresentation(vm.containerId).then(function (data) {
                vm.viewerData = data.value;
              }, backendService.error);
        }

        vm.viewerOptions = {
            containerID: 'itemlist',
            selectionMode: 'single',
            viewMode: 'c',
            svgIcon: 'common/icons/typeCharacteristicRepresentation48.svg',
            quickSearchOptions: {
                enabled: true,
                field: 'NId',
                filterText: ''
            },
            sortFields: ['NId'],
            filterBarOptions: "sq",
            tileConfig: {
                propertyFields: [
                    { field: 'CanBeSkipped', displayName: $translate.instant('characteristicRepr.CanBeSkipped') },
                    { field: 'ChrSpecNId', displayName: $translate.instant('characteristicRepr.NId')  },
                    { field: 'ChrSpecRevision', displayName: $translate.instant('characteristicRepr.Revision')  }
                ],
                titleField: 'Label',
                descriptionField: 'ChrReprNId',
                isCell: true
            },
            onSelectionChangeCallback: onSelectionChange
        };

        Initialize();

        function Initialize() {
            vm.isenabled = characteristicReprService.IsEnabled();
            vm.context = JSON.parse(vm.context);
        }

        function onSelectionChange(item) {
            if (typeof vm.context === "string" )
                vm.context = JSON.parse(vm.context);

            //if (typeof vm.mtu === "string")
            //    vm.mtu = JSON.parse(vm.mtu);
            vm.Label = item[0].Label;

            //vm.context.RuntimeChrRepresentationNId = id;
            vm.Id = item[0].ChrReprNId;
            //vm.mtu = vm.mtu;

            vm.context.RuntimeChrRepresentationNId = item[0].NId;
           // $state.go(vm.currentStateName + '.' + vm.crId + 'Representation', { charrepId: item[0].ChrReprNId, label: item[0].Label, context: vm.context, mtu: vm.mtu});
            GetSpecification();
        }
    }

})();
(function () {
    'use strict';

    angular.module('siemens.simaticit.common.widgets.characteristicRepr');
      //  .provider('siemens.simaticit.common.widgets.characteristicRepr.charrepProvider', charrepProvider)
     //   .controller('siemens.simaticit.common.widgets.characteristicRepr.characteristicReprRuntime', characteristicReprRuntime);


})();

(function () {
    'use strict';

    angular.module('siemens.simaticit.common.widgets.characteristicRepr').service('siemens.simaticit.common.characteristicReprService', characteristicReprService);

    characteristicReprService.$inject = ['$state', '$stateParams', '$rootScope', 'common.services.runtime.backendService'];
    function characteristicReprService($state, $stateParams, $rootScope, backendService) {
        var APP_NAME = "WorkInstruction";
        var isenabled = backendService.getAppEndPoint(APP_NAME) != null;

        this.IsEnabled = function()
        {
            return isenabled;
        }


        this.GetCharacteristicRepresentation = function (containerid) {
            var options = containerid === "" ? "" : "$filter=RuntimeChrReprContainer_Id eq " + containerid;
            var query = {
                appName: APP_NAME,
                entityName: "RuntimeCharacteristicRepresentation",
                options: options
            }
            return backendService.findAll(query);
        }

        this.GetCharacteristicSpecification = function (characteristicrepresentationnid) {
            var options = characteristicrepresentationnid === "" ? "" : "$filter=NId eq '" + characteristicrepresentationnid +"'&$expand=CharacteristicSpecification($expand=CharacterisicFailureAssociations)";
            var query = {
                appName: APP_NAME,
                entityName: "CharacteristicRepresentation",
                options: options
            }
            return backendService.findAll(query);
        }

        this.GetInspectionContext = function (context) {
            var options = "$filter=RuntimeCharacteristicRepresentationNId eq '" + context.RuntimeChrRepresentationNId +
                "' AND EquipmentNId eq '" + context.EquipmentNId +
                "' AND MaterialNId eq '" + context.MaterialNId +
                "'&$expand=InspectionSamples($expand=InspectionValues,VisualDetectedFailures)";
            var query = {
                appName: APP_NAME,
                entityName: "InspectionAcquisitionContext",
                options: options
            }
            return backendService.findAll(query);
        }

        this.GetInspectionContextById = function (Id) {
            var options = "$filter=Id eq " + Id +"&$expand=InspectionSamples($expand=InspectionValues,VisualDetectedFailures)";
            var query = {
                appName: APP_NAME,
                entityName: "InspectionAcquisitionContext",
                options: options
            }
            return backendService.findAll(query);
        }

        this.CreateInspectionContext = function(acquisitioncontext)
        {
            return backendService.invoke({
                'appName': APP_NAME,
                'commandName': 'CreateInspectionAcquisitionContext',
                'params': acquisitioncontext
            });
        }


        this.CreateInspectionValue = function (inspectionvalue)
        {
            return backendService.invoke({
                'appName': APP_NAME,
                'commandName': 'CreateInspectionValue',
                'params': inspectionvalue
            });
        }

        this.CreateVisualDetectedFailure = function (visualfailurevalue)
        {
            return backendService.invoke({
                'appName': APP_NAME,
                'commandName': 'CreateVisualDetectedFailure',
                'params': visualfailurevalue
            });
        }

        this.UpdateInspectionValue = function (inspectionvalue)
        {
            return backendService.invoke({
                'appName': APP_NAME,
                'commandName': 'UpdateInspectionValue',
                'params': inspectionvalue
            });
        }

        this.UpdateVisualDetectedFailure = function (visualfailurevalue)
        {
            return backendService.invoke({
                'appName': APP_NAME,
                'commandName': 'UpdateVisualDetectedFailure',
                'params': visualfailurevalue
            });
        }

    }

})();