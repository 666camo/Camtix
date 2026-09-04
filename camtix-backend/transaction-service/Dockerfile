# Build stage
FROM maven:3.9-eclipse-temurin-17-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY api-gateway/api-gateway api-gateway/api-gateway
COPY user-service/user-service user-service/user-service
COPY event-service/event-service event-service/event-service
COPY transaction-service/transaction-service transaction-service/transaction-service
RUN mvn clean package -pl transaction-service/transaction-service -am -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/transaction-service/transaction-service/target/*.jar app.jar
EXPOSE 8083
ENTRYPOINT ["java", "-jar", "app.jar"]
