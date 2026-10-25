# Root Dockerfile for Render / Cloud Deployment of Spring Boot Backend
FROM maven:3.9-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# Copy Maven descriptor and source code from backend directory
COPY backend/pom.xml ./pom.xml
COPY backend/src ./src

# Build production jar
RUN mvn clean package -DskipTests

# Stage 2: Lightweight JRE runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser:appgroup

COPY --from=builder /app/target/smart-emergency-queue-backend-1.0.0.jar app.jar

ENV PORT=8080
ENV SPRING_PROFILES_ACTIVE=prod
EXPOSE 8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
