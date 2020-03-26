FROM php:7.2-apache

# RUN apt-get update-y
# RUN apt-get install -y git
# RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
# RUN apt-get install -y mariadb-client
# RUN apt-get install -y libpq-dev libsqlite3-dev
# RUN docker-php-ext-install pdo pdo_mysql pdo_sqlite
# RUN docker-php-ext-install opcache
# RUN apt-get install -y zlib1g-dev
# RUN docker-php-ext-install zip
WORKDIR /php-grading-utils
COPY / /php-grading-utils
