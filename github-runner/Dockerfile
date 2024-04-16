FROM myoung34/github-runner:ubuntu-focal
LABEL authors="Alex Poon"

RUN apt-get update && apt-get install -y curl build-essential

RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -

RUN apt-get install -y nodejs
