# FROM sds.redii.net/sdspaas-mw/java:1.8.0_101-ubuntu14.04.3
FROM sds.redii.net/dci/openjdk8
VOLUME /tmp
ARG JAR_FILE
ADD ./target/admin-service-1.1.0.jar app.jar
EXPOSE 80
# RUN bash -c 'touch /app.jar'
ENTRYPOINT ["java","-Djava.security.egd=file:/dev/./urandom","-jar","/app.jar"]