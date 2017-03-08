from django.db import models
from mptt.models import MPTTModel, TreeForeignKey


class Topic(MPTTModel):
    parent = TreeForeignKey(
        'self',
        null=True,
        blank=True,
        related_name='children',
        db_index=True
    )
    title = models.CharField(
        'Gliederungsüberschrift',
        max_length=255,
        help_text='Beispiel: § 3 II. 2. b) Inanspruchnahme Nichtverantwortlicher'
    )

    class Meta:
        verbose_name = 'Gliederungspunkt'
        verbose_name_plural = 'Gliederungspunkte'

    def __str__(self):
        return self.title

    def generate_data(self):
        data = {
            'id': self.id,
            'title': self.title,
            'children': []
        }
        for child in self.get_children():
            data['children'].append(child.generate_data())
        return data


class Slide(models.Model):
    title =  models.CharField(
        'Titel',
        max_length=255,
        help_text='Beispiel: § 3 SächsPolG: Polizeiliche Generalklausel'
    )
    button_text = models.CharField(
        'Text für den Button',
        max_length=20,
        help_text='Maximal 20 Zeichen. Beispiel: § 3 PolG'
    )
    content = models.TextField(
        'Inhalt (HTML)',
        blank=True,
        help_text='Beispiel: &lt;p&gt;Erster Absatz&lt;/p&gt;&lt;p&gt;Zweiter Absatz&lt;/p&gt;'
    )
    weight = models.IntegerField(
        'Gewichtung',
        default=0,
        help_text=('Je größer die Zahl, desto weiter hinten/unten ist der '
                   'Button einsortiert.')
    )
    class Meta:
        ordering = ('weight',)
        verbose_name = 'Folie'
        verbose_name_plural = 'Folien'

    def __str__(self):
        return '{} ({})'.format(self.title, self.button_text)

    def generate_data(self):
        return {
            'id': self.id,
            'title': self.title,
            'button_text': self.button_text,
            'content': self.content
        }
