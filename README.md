VorlesungEnders
===============

## Setup server (first terminal)

Run:

    $ python3 -m venv .virtualenv
    $ source .virtualenv/bin/activate
    $ pip install --requirement requirements.txt
    $ python manage.py migrate
    $ python manage.py createsuperuser
    $ python manage.py runserver


## Setup client (second terminal)

Install Yarn by following the [install instructions](https://yarnpkg.com/en/docs/install).

Then run:

    $ cd vorlesung_enders_client
    $ yarn
    $ node_modules/.bin/jspm install
    $ node devServer.js
