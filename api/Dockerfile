# Stage 1: Build the application
FROM maven:3.8.4-openjdk-17-slim AS build
WORKDIR /app

# Copy pom.xml and download dependencies (cached layer)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build
COPY src ./src
RUN mvn package -DskipTests

# Stage 2: Runtime image
FROM openjdk:17-jdk-slim
WORKDIR /app

# Copy the built JAR from the builder stage
COPY --from=build /app/target/*.jar app.jar

# Google Cloud Run expects a PORT environment variable (default 8080)
ENV PORT=8080
EXPOSE 8080

# Run the application with optimized JVM settings for container environments
ENTRYPOINT ["java", "-Xmx512m", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
