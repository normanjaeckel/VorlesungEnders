var angular = require('angular'),
    autobahn = require('autobahn'),
    _ = require('lodash');

require('angular-sanitize');
require('./main.css!');

angular.module('vorlesung_enders_client', ['ngSanitize'])

.constant('setProjectorContentURI', 'VorlesungEnders.setProjectorContent')

.constant('firstSlide', {
    type: 'topic',
    title: 'Gliederung der Veranstaltung',
})

.factory('DataStore', [
    'firstSlide',
    function (firstSlide) {
        var metadata = {},
            topics = [],
            slides = [],
            currentTopic = firstSlide,
            projectorContent = firstSlide;
        return {
            getMetadata: function () {
                return metadata;
            },
            getTopics: function () {
                return topics;
            },
            getSlides: function () {
                return slides;
            },
            getCurrentTopic: function () {
                return currentTopic;
            },
            getProjectorContent: function () {
                return projectorContent;
            },
            setStore: function (data) {
                metadata = data.metadata;
                topics = data.topics;
                slides = data.slides;
            },
            setProjectorContent: function (data) {
                projectorContent = data;
                if (data && data.type === 'topic') {
                    currentTopic = data;
                }
                return data;
            },
        };
    }
])

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

.factory('WAMPConnection', [
    '$timeout',
    'setProjectorContentURI',
    'DataStore',
    function ($timeout, setProjectorContentURI, DataStore) {
        var protocol = location.protocol === 'http:' ? 'ws:' : 'wss:';
        var connection = new autobahn.Connection({
            url: protocol + '//' + location.host + '/ws',
            realm: 'realm1'
        });
        connection.onopen = function (session) {
            session.subscribe(setProjectorContentURI, function (args, kwargs, details) {
                $timeout(
                    function () {
                        DataStore.setProjectorContent(kwargs);
                    }
                );
            });
        };
        return {
            connection: connection,
        };
    }
])

.run(['WAMPConnection', function (WAMPConnection) {
    WAMPConnection.connection.open();
}])

.factory('TopicTree', ['DataStore', 'firstSlide', function (DataStore, firstSlide) {
    var getData = function (topic) {
        var data = [];
        data.push({
            type: 'topic',
            id: topic.id,
            title: topic.title,
            mark: topic.mark,
            allMarks: topic.allMarks,
            children: topic.children,
        });
        if (topic.children.length > 0) {
            angular.forEach(topic.children, function (child) {
                data.push({
                    type: 'topic',
                    id: topic.id,
                    title: topic.title,
                    mark: topic.mark,
                    allMarks: topic.allMarks,
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
            angular.forEach(DataStore.getTopics(), function (rootTopic) {
                allProjectorContent = allProjectorContent.concat(getData(rootTopic));
            });
            var index = _.findIndex(allProjectorContent, function (item) {
                return item.id === topic.id && item.withChildren == topic.withChildren && item.highlight == topic.highlight;
            });
            var previous;
            if (index > 0) {
                previous = allProjectorContent[index-1];
            } else if (index === 0) {
                previous = firstSlide;
            } else {
                previous = _.last(allProjectorContent);
            }
            return previous;
        },
        getNext: function (topic) {
            var allProjectorContent = [];
            angular.forEach(DataStore.getTopics(), function (rootTopic) {
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

.directive('projector', function () {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'src/projector.html',
        controllerAs: 'ctrl',
        controller: ['$rootScope', '$scope', 'DataStore', function ($rootScope, $scope, DataStore) {
            var ctrl = this;
            ctrl.Metadata = DataStore.getMetadata();
            $scope.$watch(
                function () {
                    return DataStore.getProjectorContent();
                },
                function (newValue) {
                    ctrl.projectorContent = newValue;
                    if (!ctrl.projectorContent.id) {
                        ctrl.projectorContent.children = DataStore.getTopics();
                    }
                }
            );
            ctrl.switchToControlPanel = function () {
                $rootScope.showProjector = false;
            };
        }],

    };
})

.directive('controlPanel', [
    'setProjectorContentURI',
    'WAMPConnection',
    function (setProjectorContentURI, WAMPConnection) {
        return {
            restrict: 'E',
            scope: {},
            templateUrl: 'src/controlPanel.html',
            controllerAs: 'ctrl',
            controller: ['$rootScope', '$scope', 'DataStore', 'TopicTree', function ($rootScope, $scope, DataStore, TopicTree) {
                var ctrl = this;
                ctrl.Metadata = DataStore.getMetadata();
                ctrl.slides = DataStore.getSlides();
                ctrl.topics = DataStore.getTopics();

                $scope.$watch(
                    function () {
                        return DataStore.getCurrentTopic();
                    },
                    function (newValue) {
                        ctrl.currentTopic = newValue;
                    }
                );

                $scope.$watch(
                    function () {
                        return DataStore.getProjectorContent();
                    },
                    function (newValue) {
                        ctrl.projectorContent = newValue;
                    }
                );

                var updateStatus = function (data) {
                    WAMPConnection.connection.session.publish(
                        setProjectorContentURI,
                        [],
                        data
                    );
                };

                ctrl.toCurrentTopic = function () {
                    updateStatus(
                        DataStore.setProjectorContent(ctrl.currentTopic)
                    );
                };
                ctrl.toTopic = function (topic) {
                    updateStatus(
                        DataStore.setProjectorContent({
                            type: 'topic',
                            id: topic.id,
                            title: topic.title,
                            mark: topic.mark,
                            allMarks: topic.allMarks,
                            children: topic.children,
                        })
                    );
                };
                ctrl.topicBack = function (count) {
                    var topic = ctrl.currentTopic;
                    _.forEach(_.range(count), function () {
                        topic = TopicTree.getPrevious(topic);
                    });
                    updateStatus(
                        DataStore.setProjectorContent(topic)
                    );
                };
                ctrl.topicForward = function (count) {
                    var topic = ctrl.currentTopic;
                    _.forEach(_.range(count), function () {
                        topic = TopicTree.getNext(topic);
                    });
                    updateStatus(
                        DataStore.setProjectorContent(topic)
                    );
                };

                ctrl.switchToProjector = function () {
                    $rootScope.showProjector = true;
                };

                ctrl.activateSlideButton = function (slide) {
                    updateStatus(
                        DataStore.setProjectorContent({
                            type: 'slide',
                            id: slide.id,
                            title: slide.title,
                            content: slide.content,
                        })
                    );
                };
            }],
        };
    }
])
;
