from constance import config
from django.http import JsonResponse
from django.views import View
from django.views.generic import TemplateView

from .models import Slide, Topic


class DataView(View):

    def get(self, request, *args, **kwargs):
        data = {}

        data['metadata'] = {
            'lecturer': config.LECTURER,
            'eventName': config.EVENT_NAME,
            'season': config.SEASON,
            'projectorContentFontSize': config.PROJECTOR_CONTENT_FONT_SIZE,
            'openerPageURL': config.OPENER_PAGE_URL,
        }

        data['topics'] = []
        for topic in Topic.objects.filter(parent=None):
            data['topics'].append(topic.generate_data())

        data['slides'] = []
        for slide in Slide.objects.all():
            data['slides'].append(slide.generate_data())

        return JsonResponse(data)


class BackupView(TemplateView):
    template_name = 'backup.html'

    def get_context_data(self, **context):
        context['slides'] = Slide.objects.all()
        context['config'] = config
        return super().get_context_data(**context)
