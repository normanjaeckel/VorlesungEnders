from django.contrib import admin
from mptt.admin import DraggableMPTTAdmin

from .models import Slide, Topic


admin.site.register(Slide)

admin.site.register(
    Topic,
    DraggableMPTTAdmin,
)
