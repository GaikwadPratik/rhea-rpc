FROM ubuntu:18.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
    && apt -y upgrade \
    && apt -y install \
              locales \
              rsync \
              openssh-server \
              sudo \
              procps \
              wget \
              unzip \
              mc \
              ca-certificates \
              curl \
              software-properties-common \
              bash-completion \
              shellcheck \
              whois \
              libudev-dev \
              libpam0g-dev \
    && add-apt-repository ppa:hio/appliance \
    && curl -sL https://deb.nodesource.com/setup_10.x | bash - \
    && apt-get update \
    && apt-get -y install \
                  nodejs \
                  git \
                  subversion \
                  qpidd \
                  qpid-tools \
                  debhelper \
                  openssl \
    && rm -rf /var/lib/apt/lists/* \
    && localedef -i en_US -c -f UTF-8 -A /usr/share/locale/locale.alias en_US.UTF-8 \
    && chsh -s /bin/bash 


  # hivesetup
RUN mkdir -p /var/lib/qpidd \
    && ssh-keygen -A  \
    && mkdir -p /run/sshd  \
    && echo "auth=no" > /etc/qpid/qpidd.conf

ENV LC_ALL=en_US.UTF-8 \
    LANG=en_US.UTF-8 \
    LANGUAGE=en_US.UTF-8 \
    SHELL=/bin/bash 

USER root

COPY ["test/testContainer/testenv.sh","/usr/bin/testenv.sh"]
RUN rm -rf node_modules
COPY . .
RUN npm install -g node-gyp bunyan
RUN npm install
RUN npm run build
WORKDIR /workspace
