var angular = require('angular'),
    _ = require('lodash');

require('angular-sanitize');
require('angular-wamp');


angular.module('vorlesung_enders_client', ['ngSanitize'])

.constant('firstSlide', {
    type: 'topic',
    title: 'Gliederung der Veranstaltung',
})

.factory('DataStore', ['firstSlide', function (firstSlide) {
    return {
        topics: [],
        slides: [],
        setStore: function (data) {
            var DataStore = this;
            DataStore.topics = data.topics;
            DataStore.slides = data.slides;
        },
        currentTopic: firstSlide,
        projectorContent: firstSlide,
        setProjectorContent: function (data) {
            var DataStore = this;
            DataStore.projectorContent = data;
            if (data && data.type === 'topic') {
                DataStore.currentTopic = data;
            }
            return {
                currentTopic: DataStore.currentTopic,
                projectorContent: DataStore.projectorContent,
            };
        },
    };
}])

.factory('TopicTree', ['DataStore', 'firstSlide', function (DataStore, firstSlide) {
    var getData = function (topic) {
        var data = [];
        data.push({
            type: 'topic',
            id: topic.id,
            title: topic.title,
            children: topic.children,
        });
        if (topic.children.length > 0) {
            angular.forEach(topic.children, function (child) {
                data.push({
                    type: 'topic',
                    id: topic.id,
                    title: topic.title,
                    children: topic.children,
                    highlight: child.id,
                });
                data = data.concat(getData(child));
            });
        }
        return data;
    };

    return {
        getPrevious: function (topic) {
            var allProjectorContent = [];
            angular.forEach(DataStore.topics, function (rootTopic) {
                allProjectorContent = allProjectorContent.concat(getData(rootTopic));
            });
            var index = _.findIndex(allProjectorContent, function (item) {
                return item.id === topic.id && item.withChildren == topic.withChildren && item.highlight == topic.highlight;
            });
            var previous;
            if (index > 0) {
                previous = allProjectorContent[index-1];
            } else {
                previous = firstSlide;
            }
            return previous;
        },
        getNext: function (topic) {
            var allProjectorContent = [];
            angular.forEach(DataStore.topics, function (rootTopic) {
                allProjectorContent = allProjectorContent.concat(getData(rootTopic));
            });
            var index = _.findIndex(allProjectorContent, function (item) {
                return item.id === topic.id && item.withChildren == topic.withChildren && item.highlight == topic.highlight;
            });
            var next;
            if (index < allProjectorContent.length-1) {
                next = allProjectorContent[index+1];
            } else {
                next = firstSlide;
            }
            return next;
        },
    };
}])

.run(['$http', '$rootScope', 'DataStore', function ($http, $rootScope, DataStore) {
    $http.get('/app/data/')
    .then(
        function (response) {
            DataStore.setStore(response.data);
            $rootScope.ready = true;
        },
        function (error) {
            console.error(error);
        }
    );
}])

.directive('projector', function () {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'src/projector.html',
        controllerAs: 'ctrl',
        controller: ['$rootScope', 'DataStore', function ($rootScope, DataStore) {
            var ctrl = this;
            ctrl.projectorContent = DataStore.projectorContent;

            ctrl.switchToControlPanel = function () {
                $rootScope.showProjector = false;
            };
        }],

    };
})

.directive('controlPanel', function () {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'src/controlPanel.html',
        controllerAs: 'ctrl',
        controller: ['$rootScope', 'DataStore', 'TopicTree', function ($rootScope, DataStore, TopicTree) {
            var ctrl = this;
            ctrl.slides = DataStore.slides;
            ctrl.currentTopic = DataStore.currentTopic;
            ctrl.projectorContent = DataStore.projectorContent;

            updateStatus = function (status) {
                ctrl.currentTopic = status.currentTopic;
                ctrl.projectorContent = status.projectorContent;
            };

            ctrl.toCurrentTopic = function () {
                updateStatus(
                    DataStore.setProjectorContent(ctrl.currentTopic)
                );
            };
            ctrl.topicBack = function () {
                updateStatus(
                    DataStore.setProjectorContent(TopicTree.getPrevious(ctrl.currentTopic))
                );
            };
            ctrl.topicForward = function () {
                updateStatus(
                    DataStore.setProjectorContent(TopicTree.getNext(ctrl.currentTopic))
                );
            };

            ctrl.switchToProjector = function () {
                $rootScope.showProjector = true;
            };

            ctrl.activateSlideButton = function (slide) {
                updateStatus(DataStore.setProjectorContent({
                    type: 'slide',
                    id: slide.id,
                    title: slide.title,
                    content: slide.content,
                }));
            };
        }],
    };
});
