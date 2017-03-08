require('angular');
var _ = require('lodash');


angular.module('vorlesung_enders_client', [])

.factory('DataStore', function () {
    var topics = [];
    var slides = [];
    var currentTopic;
    var projectorContent = {};
    return {
        topics: topics,
        slides: slides,
        setStore: function (data) {
            this.topics = data.topics;
            this.slides = data.slides;
        },
        currentTopic: currentTopic,
        projectorContent: projectorContent,
        setProjectorContent: function (data) {
            this.projectorContent = data;
            if (data && data.type === 'topic') {
                this.currentTopic = data;
            }
        },
    };
})

.factory('TopicTree', ['DataStore', function (DataStore) {
    var getData = function (topic) {
        var data = [];
        if (topic.children.length === 0) {
            data.push({
                type: 'topic',
                id: topic.id,
            });
        } else {
            data.push({
                type: 'topic',
                id: topic.id,
                withChildren: true,
            });
            angular.forEach(topic.children, function (child) {
                data.push({
                    type: 'topic',
                    id: topic.id,
                    withChildren: true,
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
            var previous = topic;
            if (index > 0) {
                previous = allProjectorContent[index-1];
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
            var next = topic;
            if (index < allProjectorContent.length-1) {
                next = allProjectorContent[index+1];
            }
            return next;
        },
    }
}])

.run(['$http', 'DataStore', function ($http, DataStore) {
    $http.get('/data/')
    .then(
        function (response) {
            DataStore.setStore(response.data);
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
        controller: ['DataStore', function (DataStore) {
            this.projectorContent = DataStore.projectorContent;
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
            this.topics = DataStore.topics;
            this.slides = DataStore.slides;

            this.toCurrentTopic = function () {
                var data;
                if (DataStore.currentTopic) {
                    data = DataStore.currentTopic;
                } else {
                    data = {
                        type: 'topic',
                        id: this.topics[0].id,
                        withChildren: true,
                    };
                }
                DataStore.setProjectorContent(data);
            };
            this.topicBack = function () {
                var data;
                if (DataStore.currentTopic == null) {
                    data = {
                        type: 'topic',
                        id: this.topics[0].id,
                        withChildren: true,
                    };
                } else {
                    data = TopicTree.getPrevious(DataStore.currentTopic);
                }
                DataStore.setProjectorContent(data);
            };
            this.topicForward = function () {
                var data;
                if (DataStore.currentTopic == null) {
                    data = {
                        type: 'topic',
                        id: this.topics[0].id,
                        withChildren: true,
                    };
                } else {
                    data = TopicTree.getNext(DataStore.currentTopic);
                }
                DataStore.setProjectorContent(data);
            };

            this.switchToProjector = function () {
                $rootScope.showProjector = true;
            };

            this.activateSlideButton = function (slide) {
                DataStore.setProjectorContent({
                    type: 'slide',
                    id: slide.id,
                    title: slide.title,
                    content: slide.content,
                });
            };
        }],
    };
});
