FROM ${docker.java.base}
WORKDIR /app
COPY target/exam-integrity-backend-${project.version}.jar app.jar
EXPOSE 8090
ENTRYPOINT ["java", "-jar", "-Dspring.profiles.active=prod", "app.jar"]
