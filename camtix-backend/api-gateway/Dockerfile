# Build stage
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY api-gateway/api-gateway api-gateway/api-gateway
COPY user-service/user-service user-service/user-service
COPY event-service/event-service event-service/event-service
COPY transaction-service/transaction-service transaction-service/transaction-service
RUN apk add --no-cache maven && \
    mvn clean package -pl api-gateway/api-gateway -am -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/api-gateway/api-gateway/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
