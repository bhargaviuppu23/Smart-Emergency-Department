# Stage 1: Build application with Maven
FROM maven:3.9-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# Copy Maven descriptor
COPY pom.xml .

# Copy source code and package application
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Lightweight runtime image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser:appgroup

# Copy compiled executable JAR from builder
COPY --from=builder /app/target/smart-emergency-queue-backend-1.0.0.jar app.jar

ENV PORT=8080
ENV SPRING_PROFILES_ACTIVE=prod
EXPOSE 8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
