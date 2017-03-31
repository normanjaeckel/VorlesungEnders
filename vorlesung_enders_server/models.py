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
    mark = models.CharField(
        'Gliederungszeichen',
        max_length=10,
        help_text='Die Gliederungszeichen aller Ebenen werden zusammengesetzt. Beispiel: Aus b) wird § 3 II. 2. b).'
    )
    title = models.CharField(
        'Gliederungsüberschrift',
        max_length=255,
        help_text='Beispiel: Inanspruchnahme Nichtverantwortlicher'
    )

    class Meta:
        verbose_name = 'Gliederungspunkt'
        verbose_name_plural = 'Gliederungspunkte'

    def __str__(self):
        return '{} {}'.format(self.mark, self.title)

    def get_all_marks(self):
        return ' '.join((ancestor.mark for ancestor in self.get_ancestors(include_self=True)))

    def generate_data(self):
        data = {
            'id': self.id,
            'title': self.title,
            'mark': self.mark,
            'allMarks': self.get_all_marks(),
            'children': []
        }
        for child in self.get_children():
            data['children'].append(child.generate_data())
        return data


class Slide(models.Model):
    title = models.CharField(
        'Titel',
        max_length=255,
        help_text='Beispiel: § 3 SächsPolG: Polizeiliche Generalklausel'
    )
    button_text = models.CharField(
        'Text für den Button',
        max_length=255,
        help_text='Bitte nur wenige Zeichen verwenden. Beispiel: § 3 PolG'
    )
    content = models.TextField(
        'Inhalt (HTML)',
        blank=True,
        help_text='Beispiel: &lt;p&gt;Erster Absatz&lt;/p&gt;&lt;p&gt;Zweiter Absatz&lt;/p&gt;'
    )
    category = models.CharField(
        'Kategorie',
        max_length=255,
        default='Vorschriften',
        help_text='Beispiel: Fälle'
    )
    weight = models.IntegerField(
        'Gewichtung',
        default=0,
        help_text=('Je größer die Zahl, desto weiter hinten/unten ist der '
                   'Button einsortiert.')
    )

    class Meta:
        ordering = ('category', 'weight',)
        verbose_name = 'Zusatzfolie'
        verbose_name_plural = 'Zusatzfolien'

    def __str__(self):
        return '{} ({})'.format(self.title, self.button_text)

    def generate_data(self):
        return {
            'id': self.id,
            'title': self.title,
            'button_text': self.button_text,
            'category': self.category,
            'content': self.content
        }
