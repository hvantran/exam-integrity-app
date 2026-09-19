FROM ${docker.java.base}
WORKDIR /app
COPY ${project.build.finalName}.jar app.jar
EXPOSE 8090
ENTRYPOINT ["java", "-jar", "-Dspring.profiles.active=prod", "app.jar"]
