import os
import re
import shutil
import sys

from django.utils.crypto import get_random_string

PROJECT_DIRECTORY_NAME = 'vorlesung_enders_server'
DEPLOYMENT_DIRECTORY_NAME = 'personal_data'


def create_deployment_dir():
    # Creates the deployment directory with settings and wsgi file if
    # inexistent. Then also copy crossbar node config.
    base_dir = os.path.dirname(os.path.abspath(__file__))

    if not os.path.exists(os.path.join(base_dir, DEPLOYMENT_DIRECTORY_NAME)):
        # Create directory.
        os.makedirs(os.path.join(base_dir, DEPLOYMENT_DIRECTORY_NAME))

        # Create __init__.py.
        open(os.path.join(
            base_dir, DEPLOYMENT_DIRECTORY_NAME, '__init__.py'), 'w').close()

        # Create settings file.
        with open(os.path.join(
                base_dir,
                PROJECT_DIRECTORY_NAME,
                'default_settings.py')) as default_settings:
            secret_key = get_random_string(
                50,
                'abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*(-_=+)')
            settings = re.sub(
                r"SECRET_KEY = ''",
                "SECRET_KEY = '%s'" % secret_key,
                default_settings.read())

            wsgi_app = '%s.wsgi.application' % DEPLOYMENT_DIRECTORY_NAME
            settings = re.sub(
                r"WSGI_APPLICATION = ''",
                "WSGI_APPLICATION = '%s'" % wsgi_app,
                settings)

            settings_path = os.path.join(
                os.path.join(base_dir, DEPLOYMENT_DIRECTORY_NAME),
                'settings.py')
            with open(settings_path, 'w') as new_settings:
                new_settings.write(settings)

        # Create wsgi file.
        with open(os.path.join(
                base_dir,
                PROJECT_DIRECTORY_NAME,
                'default_wsgi.py')) as default_wsgi:
            django_settings_module = '%s.settings' % DEPLOYMENT_DIRECTORY_NAME
            wsgi = re.sub(
                r"DJANGO_SETTINGS_MODULE = ''",
                "DJANGO_SETTINGS_MODULE = '%s'" % django_settings_module,
                default_wsgi.read())
            wsgi_path = os.path.join(
                os.path.join(base_dir, DEPLOYMENT_DIRECTORY_NAME),
                'wsgi.py')
            with open(wsgi_path, 'w') as new_wsgi:
                new_wsgi.write(wsgi)

        # Copy crossbar node config.
        if not os.path.exists(os.path.join(base_dir, '.crossbar')):
            os.makedirs(os.path.join(base_dir, '.crossbar'))
        shutil.copyfile(
            os.path.join(base_dir, 'crossbar_default_config.json'),
            os.path.join(base_dir, '.crossbar', 'config.json')
        )


if __name__ == "__main__":
    create_deployment_dir()

    os.environ.setdefault(
        'DJANGO_SETTINGS_MODULE',
        '%s.settings' % DEPLOYMENT_DIRECTORY_NAME)

    try:
        from django.core.management import execute_from_command_line
    except ImportError:
        # The above import may fail for some other reason. Ensure that the
        # issue is really that Django is missing to avoid masking other
        # exceptions on Python 2.
        try:
            import django  # flake8: noqa
        except ImportError:
            raise ImportError(
                "Couldn't import Django. Are you sure it's installed and "
                "available on your PYTHONPATH environment variable? Did you "
                "forget to activate a virtual environment?"
            )
        raise

    execute_from_command_line(sys.argv)
