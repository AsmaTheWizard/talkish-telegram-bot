# Talkish

## _Robot Agent to help customers_

Talkish is a telegram bot that help customers.

- collect feedback
- report damage order
- update location
- support Arabic and English

## Bot

In order to use the bot, follow this instruction

- search in telegram about Talkish Agent
- open it
- click o start
- the bot will guide you
- if you reach the end or want to start the bot from the beginning, type /start

## Workflow

I used Node.js, Telegraf lib, and MongoDB inside docker.

- Node.js to run node server to connect to telegram as well as exporting HTTP enpoints to check saved data in DB
- Telegraf lib, to build the bot workflow and responses
- MongoDB as session managment and to store data, such as customer data and feedback data
- all of them shipped in Docker container
- I generated randoms order IDs for customer to pcik form

## Installation

get project from GitHub

```sh
cd talkish
```

run Docker build

```sh
docker-compose build
```

run Docker up

```sh
docker-compose up
```

to get all feedback records

```sh
curl -X GET localhost:4000/get_feedback
```

to get all customers records

```sh
curl -X GET localhost:4000/get_customers
```

## If I have more time , I would:

- remove all hard coded data such as status codes, messages ..etc
- personally, I prefer to create generic class for alll common CRUD operation, and use this class instead of repating codes
- I will add Setup script to make sure that MongoDB is set properly (DB and collections created) as well as a teardown script, that will remove collections if needed
- build mechanism and middleware for Error Handling
- implment security mechanism for the whole system.
- I will add BOT_TOEKN to .gitignore and feed this info from process.env
- add inline query to the bot, fetching helpful information from FAQ
- image path has the bot token, for the real scenario, this is a risk! so, I would upload images in private storage and use this path instead of relying on telegram storage.

##### Note:

- I used telegraf-session-mongodb lib for session managment, which turn out lacked option to implment expire value for session /index collection so if I had more time, I would write my own telegraf sessions managment MongoDB middleware.

- I used JS models files because TS files throw error in the librray that I used and due to time constraint, I decided to use JS
