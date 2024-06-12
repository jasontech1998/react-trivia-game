# java

A starter backend for captrivia in Java.  Make sure to copy the `questions.json` from the directory above and put it in `./captrivia`, or adjust `captrivia.yml` to point to a different path.

With JRE and JDK 21 or better installed, you can build and run locally with:
```bash
mvn package
java -jar ./target/captrivia-1.0-SNAPSHOT.jar server captrivia.yml
```

It currently exposes a single API endpoint:
```bash
curl localhost:8080/games
```

You can also run in Docker.  This will likely be slower for development, especially if you're running on a non-Linux machine, but you should test that it runs in Docker as we run it in Docker when we grade it.
```bash
docker build . --tag captrivia-be
docker run captrivia-be
```
