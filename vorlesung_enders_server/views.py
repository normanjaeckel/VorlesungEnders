from constance import config
from django.http import JsonResponse
from django.views import View

from .models import Slide, Topic


class DataView(View):

    def get(self, request, *args, **kwargs):
        data = {}

        data['metadata'] = {
            'lecturer': config.LECTURER,
            'eventName': config.EVENT_NAME,
            'season': config.SEASON,
        }

        data['topics'] = []
        for topic in Topic.objects.filter(parent=None):
            data['topics'].append(topic.generate_data())

        data['slides'] = []
        for slide in Slide.objects.all():
            data['slides'].append(slide.generate_data())

        return JsonResponse(data)
