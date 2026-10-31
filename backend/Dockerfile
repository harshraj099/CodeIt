# Build stage: compile the Spring Boot jar.
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q -B dependency:go-offline
COPY src ./src
RUN mvn -q -B -DskipTests package

# Run stage: just the JRE and the jar.
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/lldpad-backend-*.jar app.jar
# Hosts like Render inject PORT; the app reads it (defaults to 8080).
EXPOSE 8080
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "app.jar"]
