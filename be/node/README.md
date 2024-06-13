# node

A starter backend for captrivia in Node and Typescript.  Make sure to copy the `questions.json` from the directory above and put it in `./src`, or adjust its import statement.

With nvm installed, you can install dependencies and start it locally with:
```bash
nvm use
npm install
npm run dev
```

This will start a nodemon process to automatically reload on file changes.  If you don't want this, you can start it with `npm run start` instead.

It currently exposes a single API endpoint:
```bash
curl localhost:8080/games
```

We have also configured eslint for you; you can invoke it with `npm run lint`.

You can also run in Docker.  This will likely be slower for development, especially if you're running on a non-Linux machine, but you should test that it runs in Docker as we run it in Docker when we grade it.
```
docker build . --tag captrivia-be
docker run captrivia-be
```
