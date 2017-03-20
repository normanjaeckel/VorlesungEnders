from django.contrib import admin
from django.contrib.auth.models import Group
from mptt.admin import DraggableMPTTAdmin

from .models import Slide, Topic


class SlideAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'weight')


admin.site.register(Slide, SlideAdmin)
admin.site.register(Topic, DraggableMPTTAdmin)
admin.site.unregister(Group)

admin.site.site_title = 'VorlesungEnders Projektionen Administration'
admin.site.site_header = 'VorlesungEnders Projektionen Administration'
admin.site.index_title = 'Administration Übersicht'
admin.site.site_url = None
