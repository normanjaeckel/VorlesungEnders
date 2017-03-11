VorlesungEnders
===============

## Setup

Check dependencies (python3, build-essential, libssl-dev, libffi-dev,
python3-dev, python-pip).

Install Yarn by following the [install
instructions](https://yarnpkg.com/en/docs/install).

Run:

    $ python3 -m venv .virtualenv
    $ source .virtualenv/bin/activate
    $ pip install -U pip setuptools six
    $ pip install --requirement requirements.txt
    $ python manage.py migrate
    $ python manage.py createsuperuser
    $ python manage.py collectstatic

    $ cd vorlesung_enders_client
    $ yarn
    $ node_modules/.bin/jspm install
    $ cd ..

    $ PYTHONPATH=`pwd`:$PYTHONPATH crossbar start
