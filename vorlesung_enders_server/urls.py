from django.conf import settings
from django.conf.urls import url
from django.conf.urls.static import static
from django.contrib import admin

from . import views


urlpatterns = [
    url(r'^data/$', views.DataView.as_view()),
    url(r'^backup/$', views.BackupView.as_view()),
    url(r'^admin/', admin.site.urls),
] + static(settings.STATIC_URL_PART, document_root=settings.STATIC_ROOT)
