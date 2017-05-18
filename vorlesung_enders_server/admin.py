from ckeditor.widgets import CKEditorWidget
from django import forms
from django.contrib import admin
from django.contrib.auth.models import Group
from mptt.admin import DraggableMPTTAdmin

from .models import Slide, Topic


class SlideAdminForm(forms.ModelForm):
    content = forms.CharField(widget=CKEditorWidget())

    class Meta:
        model = Slide
        fields = ('title', 'button_text', 'content', 'category', 'weight')


class SlideAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'category', 'weight')
    form = SlideAdminForm


# TODO: Expand tree by default
# https://github.com/django-mptt/django-mptt/commit/c4da901473513c0304c314738b53680145001b39

admin.site.register(Slide, SlideAdmin)
admin.site.register(Topic, DraggableMPTTAdmin)
admin.site.unregister(Group)

admin.site.site_title = 'VorlesungEnders Projektionen Administration'
admin.site.site_header = 'VorlesungEnders Projektionen Administration'
admin.site.index_title = 'Administration Übersicht'
admin.site.site_url = None
